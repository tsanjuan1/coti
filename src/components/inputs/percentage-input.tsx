import type { InputHTMLAttributes } from "react";

import { cn, round, toNumber } from "@/lib/utils";

type PercentageInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: number;
  onValueChange: (value: number) => void;
  inputClassName?: string;
};

export function PercentageInput({
  value,
  onValueChange,
  className,
  inputClassName,
  step = "0.01",
  disabled,
  ...props
}: PercentageInputProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-xl border border-[var(--line)] bg-white px-3",
        disabled ? "opacity-70" : "",
        className
      )}
    >
      <input
        {...props}
        disabled={disabled}
        type="number"
        step={step}
        value={round(value * 100, 4)}
        onChange={(event) => onValueChange(toNumber(event.target.value) / 100)}
        className={cn(
          "w-full border-0 bg-transparent px-0 py-2 outline-none",
          inputClassName
        )}
      />
      <span className="pl-2 text-sm text-[color:var(--muted)]">%</span>
    </div>
  );
}
