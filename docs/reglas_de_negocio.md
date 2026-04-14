# Reglas de negocio y ambiguedades

## Reglas confirmadas por formulas

### Cotizador

- El status `cotizacion` es el unico que entra en los totales principales del presupuesto activo.
- El costo base por linea parte de `FOB unitario * factor global`.
- El seguro se aplica sobre `FOB total + flete/gastos prorrateados`.
- El prorrateo logistico combina:
  - porcentaje sobre valor total;
  - porcentaje sobre peso total.
- Los impuestos por linea dependen del `tipo de producto`.
- La tabla de referencia de tasas vive en `AUXILIAR`.
- El impuesto pais es un factor global.
- El precio de venta final se calcula como `costo unitario total * markup de linea`.

### Punto de equilibrio

- La formula central es:
  - `punto_de_equilibrio = gastos_fijos / margen_de_contribucion`
- El margen de contribucion se calcula como:
  - `1 - 1/markup - tasa_gastos_variables`
- Los gastos variables incluyen:
  - IIBB;
  - impuesto al cheque;
  - fletes;
  - consultoria;
  - comisiones.
- El sistema contempla al menos dos escenarios paralelos.
- Existe un subanalisis por vendedor para facturacion minima requerida.

### Resultado por operacion

- Parte de `facturacion` y `markup`.
- Obtiene `CMV = facturacion / markup`.
- Calcula utilidad bruta y luego descuenta:
  - gastos variables;
  - gastos fijos.
- Debe mostrar monto absoluto y porcentajes cuando el Excel lo hace.

## Reglas inferidas que deben quedar configurables

- Lista de vendedores.
- Tipos de producto.
- Alicuotas por tipo de producto.
- Costos de origen y destino.
- Parametros de courier/flete.
- Rubros fijos del punto de equilibrio.
- Tasas variables.
- Estructura salarial por vendedor.

## Ambiguedades detectadas

### Fuente del cotizador

- El archivo `COTIZADOR.xlsm` no esta accesible en la ruta entregada.
- Se uso `Estuata - ANYX.xlsm` como reemplazo mas fiel disponible.

### VBA

- El `xlsm` contiene `vbaProject.bin`.
- Se detectaron rastros de `Worksheet_Change` y `ThisWorkbook`.
- No fue posible reconstruir todo el codigo VBA en este entorno.
- Decisión: la app se basara en formulas visibles y dejara documentada esta brecha.

### Estados del cotizador

- Las formulas dependen de `cotizacion`.
- En la muestra actual solo aparecen `COMPRAS`, `VENCIDO` y `vencido`.
- Decisión: modelar `cotizacion` como estado operativo valido y documentar confirmacion pendiente de la taxonomia completa.

### Validaciones rotas

- `J929:K930` referencia `#REF!`.
- Decisión: no replicar una validacion rota; reemplazarla por configuracion controlada en DB.

### Formulas rotas en `resultado x op`

- Existen referencias a `$AT$47` sin soporte visible en la hoja.
- Varias celdas muestran `#DIV/0!`.
- Decisión: implementar el flujo respetando la estructura, pero aislar esas referencias en una configuracion corregible y marcar el origen como inconsistente.

### Datos sensibles

- La hoja `Datos` contiene credenciales de proveedores en texto plano.
- Decisión: no exponerlas en UI ni persistirlas como parte del MVP funcional.

### Excel Python

- `Análisis1` usa Python de Excel.
- Decisión: dejarlo fuera del alcance del motor core y documentarlo como no portable sin redefinicion funcional.

## Criterios de implementacion derivados

- Nada de formulas embebidas en componentes UI.
- Todo calculo debe vivir en servicios puros testeables.
- Toda tasa/parametro dudoso debe quedar en tablas configurables.
- Toda inconsistencia heredada debe quedar documentada en codigo y docs.
- Las pantallas deben mostrar desglose y trazabilidad, no solo el total.
