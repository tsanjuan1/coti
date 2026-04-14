#!/usr/bin/env python3
"""Inspect XLSX/XLSM workbooks using only Python's standard library.

This script parses Office Open XML workbooks directly from the ZIP container,
which makes it usable in restricted environments without openpyxl installed.
It is designed to support reverse-engineering spreadsheet logic into software.
"""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET


NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkg": "http://schemas.openxmlformats.org/package/2006/relationships",
}

CELL_REF_RE = re.compile(
    r"(?:'[^']+'|[A-Za-z0-9_\.]+)?!?\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?"
)


def qn(prefix: str, tag: str) -> str:
    return f"{{{NS[prefix]}}}{tag}"


def col_letters_to_index(col_letters: str) -> int:
    value = 0
    for char in col_letters:
        value = value * 26 + ord(char) - 64
    return value


def split_cell_ref(cell_ref: str) -> tuple[str, int]:
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    digits = "".join(ch for ch in cell_ref if ch.isdigit())
    return letters, int(digits)


def short(value: str | None, limit: int = 140) -> str | None:
    if value is None:
        return None
    value = str(value).strip()
    if len(value) <= limit:
        return value
    return value[: limit - 3] + "..."


@dataclass
class StyleInfo:
    style_id: int
    locked: bool
    hidden: bool
    num_fmt_id: str | None = None


class WorkbookInspector:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.zip_file = zipfile.ZipFile(path)
        self.shared_strings = self._load_shared_strings()
        self.styles = self._load_styles()
        self.workbook_tree = self._load_xml("xl/workbook.xml")
        self.workbook_rels = self._load_relationships("xl/_rels/workbook.xml.rels")
        self.sheet_info = self._load_sheet_info()
        self.defined_names = self._load_defined_names()

    def close(self) -> None:
        self.zip_file.close()

    def _load_xml(self, entry_name: str) -> ET.Element:
        with self.zip_file.open(entry_name) as handle:
            return ET.parse(handle).getroot()

    def _load_relationships(self, entry_name: str) -> dict[str, str]:
        root = self._load_xml(entry_name)
        rels: dict[str, str] = {}
        for rel in root.findall(f".//{qn('pkg', 'Relationship')}"):
            rels[rel.attrib["Id"]] = rel.attrib["Target"]
        return rels

    def _load_shared_strings(self) -> list[str]:
        try:
            root = self._load_xml("xl/sharedStrings.xml")
        except KeyError:
            return []

        strings: list[str] = []
        for si in root.findall(f".//{qn('main', 'si')}"):
            text_chunks = [node.text or "" for node in si.iter() if node.tag == qn("main", "t")]
            strings.append("".join(text_chunks))
        return strings

    def _load_styles(self) -> dict[int, StyleInfo]:
        try:
            root = self._load_xml("xl/styles.xml")
        except KeyError:
            return {0: StyleInfo(style_id=0, locked=True, hidden=False)}

        cell_xfs = root.find(f".//{qn('main', 'cellXfs')}")
        if cell_xfs is None:
            return {0: StyleInfo(style_id=0, locked=True, hidden=False)}

        styles: dict[int, StyleInfo] = {}
        for idx, xf in enumerate(cell_xfs.findall(qn("main", "xf"))):
            protection = xf.find(qn("main", "protection"))
            apply_protection = xf.attrib.get("applyProtection") == "1"
            locked = True
            hidden = False
            if protection is not None:
                if protection.attrib.get("locked") == "0":
                    locked = False
                if protection.attrib.get("hidden") == "1":
                    hidden = True
            elif apply_protection:
                locked = xf.attrib.get("locked", "1") != "0"

            styles[idx] = StyleInfo(
                style_id=idx,
                locked=locked,
                hidden=hidden,
                num_fmt_id=xf.attrib.get("numFmtId"),
            )
        return styles

    def _load_sheet_info(self) -> list[dict[str, str | None]]:
        sheets_parent = self.workbook_tree.find(f".//{qn('main', 'sheets')}")
        if sheets_parent is None:
            return []

        info: list[dict[str, str | None]] = []
        for sheet in sheets_parent.findall(qn("main", "sheet")):
            rel_id = sheet.attrib.get(qn("rel", "id"))
            info.append(
                {
                    "name": sheet.attrib.get("name"),
                    "sheetId": sheet.attrib.get("sheetId"),
                    "state": sheet.attrib.get("state"),
                    "target": self.workbook_rels.get(rel_id or "", ""),
                }
            )
        return info

    def _load_defined_names(self) -> list[dict[str, str | None]]:
        parent = self.workbook_tree.find(f".//{qn('main', 'definedNames')}")
        if parent is None:
            return []

        return [
            {
                "name": node.attrib.get("name"),
                "localSheetId": node.attrib.get("localSheetId"),
                "hidden": node.attrib.get("hidden"),
                "refersTo": (node.text or "").strip(),
            }
            for node in parent.findall(qn("main", "definedName"))
        ]

    def workbook_summary(self) -> dict[str, object]:
        return {
            "path": str(self.path),
            "has_vba": "xl/vbaProject.bin" in self.zip_file.namelist(),
            "sheet_count": len(self.sheet_info),
            "sheets": self.sheet_info,
            "defined_names": self.defined_names,
        }

    def inspect_sheet(self, sheet_name: str) -> dict[str, object]:
        sheet_meta = next((sheet for sheet in self.sheet_info if sheet["name"] == sheet_name), None)
        if not sheet_meta:
            raise ValueError(f"Sheet not found: {sheet_name}")

        sheet_path = f"xl/{sheet_meta['target']}"
        root = self._load_xml(sheet_path)
        rels_path = sheet_path.replace("worksheets/", "worksheets/_rels/") + ".rels"
        table_targets = []
        if rels_path in self.zip_file.namelist():
            rels = self._load_relationships(rels_path)
            table_targets = [target for target in rels.values() if target.startswith("../tables/")]

        cells = []
        formula_cells = []
        constant_cells = []
        unlocked_cells = []
        text_cells = []
        data_validations = []
        merged_ranges = []
        dependencies = Counter()

        for merged in root.findall(f".//{qn('main', 'mergeCell')}"):
            merged_ranges.append(merged.attrib.get("ref"))

        for validation in root.findall(f".//{qn('main', 'dataValidation')}"):
            data_validations.append(
                {
                    "sqref": validation.attrib.get("sqref"),
                    "type": validation.attrib.get("type"),
                    "operator": validation.attrib.get("operator"),
                    "formula1": short(validation.findtext(qn("main", "formula1"))),
                    "formula2": short(validation.findtext(qn("main", "formula2"))),
                }
            )

        for cell in root.findall(f".//{qn('main', 'sheetData')}//{qn('main', 'c')}"):
            address = cell.attrib["r"]
            row_col = split_cell_ref(address)
            style_id = int(cell.attrib.get("s", "0"))
            style = self.styles.get(style_id, StyleInfo(style_id=style_id, locked=True, hidden=False))
            cell_type = cell.attrib.get("t")
            formula_node = cell.find(qn("main", "f"))
            value_node = cell.find(qn("main", "v"))
            inline_text_node = cell.find(f".//{qn('main', 'is')}//{qn('main', 't')}")

            value: str | None = None
            if cell_type == "s" and value_node is not None and value_node.text is not None:
                shared_index = int(value_node.text)
                value = self.shared_strings[shared_index] if shared_index < len(self.shared_strings) else value_node.text
            elif cell_type == "inlineStr" and inline_text_node is not None:
                value = inline_text_node.text or ""
            elif value_node is not None:
                value = value_node.text

            formula = formula_node.text if formula_node is not None else None
            record = {
                "address": address,
                "row": row_col[1],
                "column_letters": row_col[0],
                "column_index": col_letters_to_index(row_col[0]),
                "style_id": style_id,
                "locked": style.locked,
                "hidden_formula": style.hidden,
                "type": cell_type,
                "formula": formula,
                "value": value,
            }
            cells.append(record)

            if formula:
                refs = CELL_REF_RE.findall(formula)
                dependencies.update(refs)
                formula_cells.append(record)
            else:
                if value not in (None, ""):
                    constant_cells.append(record)
                    if not style.locked:
                        unlocked_cells.append(record)
                    if cell_type in ("s", "inlineStr") or (value and not value.replace(".", "", 1).replace("-", "", 1).isdigit()):
                        text_cells.append(record)

        formula_by_row = defaultdict(list)
        for cell in formula_cells:
            formula_by_row[cell["row"]].append(cell)

        text_by_row = defaultdict(list)
        text_by_col = defaultdict(list)
        for cell in text_cells:
            text_by_row[cell["row"]].append(cell)
            text_by_col[cell["column_index"]].append(cell)

        def describe_label(target_cell: dict[str, object]) -> str | None:
            row = int(target_cell["row"])
            col = int(target_cell["column_index"])

            same_row = [
                cell
                for cell in text_by_row.get(row, [])
                if int(cell["column_index"]) < col and (col - int(cell["column_index"])) <= 4
            ]
            if same_row:
                return short(same_row[-1]["value"])

            same_col = [
                cell
                for cell in text_by_col.get(col, [])
                if int(cell["row"]) < row and (row - int(cell["row"])) <= 4
            ]
            if same_col:
                return short(same_col[-1]["value"])
            return None

        for bucket in (formula_cells, unlocked_cells, constant_cells):
            for cell in bucket:
                cell["label_hint"] = describe_label(cell)

        return {
            "sheet": sheet_name,
            "state": sheet_meta["state"],
            "target": sheet_meta["target"],
            "total_cells": len(cells),
            "formula_count": len(formula_cells),
            "constant_count": len(constant_cells),
            "unlocked_constant_count": len(unlocked_cells),
            "formula_cells": formula_cells,
            "constant_cells": constant_cells,
            "unlocked_cells": unlocked_cells,
            "data_validations": data_validations,
            "merged_ranges": merged_ranges,
            "table_targets": table_targets,
            "top_dependencies": dependencies.most_common(60),
        }


def dump_json(data: object) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect XLSX/XLSM workbook structure.")
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--sheet", action="append", default=[], help="Sheet name to inspect in detail.")
    parser.add_argument(
        "--formulas-limit",
        type=int,
        default=120,
        help="Maximum number of formula cells returned per inspected sheet.",
    )
    parser.add_argument(
        "--constants-limit",
        type=int,
        default=120,
        help="Maximum number of constant cells returned per inspected sheet.",
    )
    parser.add_argument(
        "--inputs-limit",
        type=int,
        default=120,
        help="Maximum number of unlocked cells returned per inspected sheet.",
    )
    args = parser.parse_args()

    inspector = WorkbookInspector(args.workbook)
    try:
        payload: dict[str, object] = {"workbook": inspector.workbook_summary(), "sheets": []}
        for sheet_name in args.sheet:
            inspected = inspector.inspect_sheet(sheet_name)
            inspected["formula_cells"] = inspected["formula_cells"][: args.formulas_limit]
            inspected["constant_cells"] = inspected["constant_cells"][: args.constants_limit]
            inspected["unlocked_cells"] = inspected["unlocked_cells"][: args.inputs_limit]
            payload["sheets"].append(inspected)
        dump_json(payload)
    finally:
        inspector.close()


if __name__ == "__main__":
    main()
