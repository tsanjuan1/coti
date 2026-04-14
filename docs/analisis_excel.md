# Analisis funcional de los Excel

## Alcance y fuentes usadas

### Archivos inspeccionados

- `C:\Users\Usuario\Downloads\Estuata - ANYX.xlsm`
- `C:\Users\Usuario\Downloads\Patrimonio (2).xlsx`

### Observacion importante

- La ruta declarada por el usuario para `COTIZADOR.xlsm` no existe en el entorno actual.
- Se tomo como fuente de verdad operativa para el modulo cotizador a `Estuata - ANYX.xlsm`, porque contiene:
  - la hoja `COTIZADOR ACTUAL`;
  - varias variantes `Cotizador ...`;
  - hojas auxiliares de tasas, derechos, aranceles y costos;
  - un proyecto VBA embebido.
- Esta decision queda documentada como supuesto verificable.

## Resumen ejecutivo

- `Estuata - ANYX.xlsm` funciona como un workbook operativo de cotizacion/importacion.
- `Patrimonio (2).xlsx` contiene dos calculadoras relevantes:
  - `Punto de equilibrio`
  - `resultado x op`
- Ambos libros mezclan:
  - inputs manuales;
  - tablas de configuracion;
  - datos historicos;
  - formulas visibles;
  - y, en el caso del `xlsm`, logica adicional probablemente disparada por eventos VBA.

## Archivo 1: `Estuata - ANYX.xlsm`

### Que hace el archivo

- Consolida compras/cotizaciones por item.
- Calcula costo importado por linea considerando:
  - FOB;
  - seguro;
  - flete y gastos;
  - CIF/CIP;
  - derechos;
  - estadistica;
  - IVA;
  - adelantos impositivos;
  - impuesto interno;
  - gastos en destino;
  - impuesto pais.
- Calcula costo unitario con impuestos y precio de venta por linea.
- Incluye variantes simplificadas de cotizador por vendedor o caso.

### Hojas relevantes

#### `COTIZADOR ACTUAL`

- Hoja principal del motor de cotizacion.
- Tamaño aproximado:
  - `6922` celdas con formula;
  - `19750` constantes.
- Tiene validaciones de datos activas.
- Estructura funcional:
  - cabecera de parametros globales;
  - grilla de items;
  - totales;
  - bloques de costos de origen;
  - costos de destino;
  - costos/remanentes adicionales;
  - parametros de courier/flete minimo.

#### `AUXILIAR`

- Tabla maestra de tipos de producto y alicuotas.
- Contiene formulas de lookup y varios parametros editables de costos.
- Parece ser la principal fuente de:
  - derechos;
  - estadistica;
  - IVA;
  - adelanto de IVA;
  - IIBB;
  - adelanto de ganancias;
  - impuesto interno;
  - reglas de costos fijos/variables.

#### `Tasas, Derechos y Aranceles`

- Padron de producto/aranceles.
- Fuente de referencia para clasificacion o consolidacion de tasas.

#### `Analisis de costos`

- Hoja oculta con formulas de distribucion de costos.
- Indica que existe una capa de costeo mas analitica que alimenta decisiones del cotizador.

#### `Datos`

- Tabla `Tabla2` en rango `A1:H43`.
- Contiene datos sensibles de proveedores:
  - proveedor;
  - web;
  - usuario;
  - password;
  - bandera de tax.
- No corresponde exponer esta informacion en el sistema salvo necesidad explicita y con cifrado/secret management.

#### Otras hojas

- `Cotizador GDC`, `Cotizador EG`, `Cotizador TS`, etc.
- Son calculadoras mas chicas, orientadas a cotizacion unitaria o por perfil.
- Se ven como variantes simplificadas o legacy, no como el motor principal.

### Variables de entrada detectadas en `COTIZADOR ACTUAL`

#### Parametros globales

- `N8`: factor global de markup. En la muestra: `1.05`.
- `S8`: seguro global. En la muestra: `0.01`.
- `Y8`: flag de adelanto IVA. Lista `SI/NO`.
- `AD8`: factor de impuesto pais. En la muestra: `0`.

#### Inputs por linea de item

En filas de item, la estructura visible sugiere como inputs:

- `B`: status
- `C`: fecha
- `D`: vendedor
- `E`: cantidad
- `H`: part number
- `I`: descripcion
- `J`: tipo de producto
- `L`: costo Estuata / FOB unitario
- `P`: peso unitario en kg
- `AG`: markup de venta por linea

Ejemplo completo de una linea:

- `B14 = COMPRAS`
- `D14 = FABRICIO`
- `E14 = 1`
- `H14 = WD22TB4`
- `J14 = DOCKING`
- `L14 = 209.24`
- `P14 = 1.65`
- `AG14 = 1.47`

#### Inputs de costos de origen

Bloque filas `940:947`:

- `delivery airport`
- `flete internacional`
- `manejo de doc origen`
- `afip resol 3244`
- costos administrativos / flete

Parametros detectados editables:

- `C943`
- `C944`
- `B945`
- `B946`
- `C946`
- `H946`
- `I946`
- `D949`
- `D950`

#### Inputs de costos de destino

Bloque filas `951:964`:

- `custodia`
- `gtos admin (sobre almacenaje)`
- `digitalizacion`
- `acarreo interno`
- `gtos operativos`
- `honorarios`
- `seguro destino`
- `almacenaje TCA`
- `varios`
- `IIBB CABA`
- `IIBB PBA`
- `manejo doc destino`

#### Inputs de bloque adicional/remanente

Bloque filas `967:984`:

- `honorarios`
- `gastos operativos`
- `digitalizacion docu`
- `varios`
- `custodia`
- `seguro destino`
- `acarreo interno`
- `gtos admin`
- `almacenaje TCA`
- `afip resol 3244`
- `manejo de doc origen`
- `flete internacional`
- `IIBB CABA`
- `IIBB PBA`
- `manejo doc destino`

#### Inputs de courier/flete minimo

- `H989`: etiqueta `hasta 30 kg`
- `D990 = 4.5`
- `H990 = 150 x kg`
- `I992 = 25000`
- `D993 = 0.007`
- `H993 = 250`

### Variables calculadas en `COTIZADOR ACTUAL`

Por linea:

- `M`: precio/costo FOB ajustado por markup global
- `N`: total FOB de linea para status `cotizacion`
- `O`: participacion porcentual sobre valor total
- `Q`: peso total por linea
- `R`: participacion porcentual sobre peso total
- `S`: seguro
- `T`: fletes y gastos prorrateados
- `U`: CIF / CIP
- `V`: derechos
- `W`: estadistica
- `X`: IVA
- `Y`: adelanto IVA
- `Z`: IIBB
- `AA`: adelanto ganancias
- `AB`: impuesto interno
- `AC`: gastos en destino
- `AD`: impuesto pais
- `AE`: total linea
- `AF`: costo unitario con impuestos
- `AH`: precio de venta unitario
- `AI`: precio de venta total

Totales:

- `E12`
- `M12`
- `N12`
- `Q12`
- `U12`
- `AF12`
- `AG12`
- `AH12`

Subtotales y costos auxiliares:

- `D947`: total costos de origen
- `H947`: componente admin/origen
- `I947`: componente flete/origen
- `D964`: total costos de destino
- `D984`: total bloque adicional
- `H984`: remanente
- `H992`: conversion derivada de honorarios/flete
- `I993`: honorarios derivados

### Formulas clave de `COTIZADOR ACTUAL`

#### Formulas por linea

- `M14 = L14*$N$8`
- `N14 = IF(B14="cotizacion",M14*E14,0)`
- `O14 = IFERROR(N14/$N$12,"-")`
- `Q14 = IF(B14="cotizacion",P14*E14,0)`
- `R14 = IFERROR(Q14/$Q$12,"-")`
- `S14 = IF(B14="cotizacion",IFERROR((N14+T14)*$S$8,"-"),0)`
- `T14 = IFERROR($I$947*R14,"-")+IFERROR($H$947*O14,"-")`
- `U14 = IFERROR(S14+N14+T14,"-")`
- `V14 = IFERROR(U14*VLOOKUP(J14,AUXILIAR!K$5:S156,2,0),"-")`
- `W14 = IFERROR(U14*VLOOKUP(J14,AUXILIAR!K$5:S156,3,0),"-")`
- `X14 = IFERROR((U14+V14+W14)*VLOOKUP(J14,AUXILIAR!K$4:S246,4,0),"-")`
- `Y14 = IFERROR((U14+V14+W14)*IF(Y$8="SI",VLOOKUP(J14,AUXILIAR!K$4:S226,5,0)),"-")`
- `Z14 = IFERROR((U14+V14+W14)*VLOOKUP(J14,AUXILIAR!K$4:S245,6,0),"-")`
- `AA14 = IFERROR((U14+V14+W14)*VLOOKUP(J14,AUXILIAR!K$4:S245,7,0),"-")`
- `AB14 = IFERROR((U14+V14+W14)*1.3*VLOOKUP(J14,AUXILIAR!K$4:S245,8,0),"-")`
- `AC14 = IFERROR($H$984*O14,"-")`
- `AD14 = IFERROR(U14*$AD$8,"-")`
- `AE14 = SUM(U14:AD14)`
- `AF14 = IFERROR(AE14/E14,"-")`
- `AH14 = IFERROR(AF14*AG14,"-")`
- `AI14 = AH14*E14`

#### Totales de cotizacion

- `E12 = SUMIF($B$14:$B$97,"cotizacion",$E$14:$E$97)`
- `M12 = SUMIF($B$14:$B$801,"cotizacion",M$14:M$801)`
- `N12 = SUMIF($B$14:$B$801,"cotizacion",N$14:N$801)`
- `Q12 = SUMIF($B$14:$B$801,"cotizacion",Q$14:Q$801)`
- `U12 = SUMIF($B$14:$B$97,"cotizacion",U$14:U$97)`
- `AF12 = SUMIF($B$14:$B$97,"cotizacion",AF$14:AF$97)`
- `AG12 = AH12/AF12`
- `AH12 = SUMIF($B$14:$B$97,"cotizacion",AH$14:AH$97)`

#### Totales diferenciales

- `N11 = N12-N929`
- `Q11 = Q12-Q929`
- `U11 = U12-U929`
- `AF11 = AF12-AF929`
- `AH11 = AH12-AH929`

#### Costos auxiliares

- `D947 = SUM(D941:D946)`
- `H947 = D947-D944`
- `I947 = D944`
- `D964 = SUM(D952:D963)`
- `D984 = SUM(D969:D983)`
- `H984 = D984-D947`
- `H992 = H993/D993`
- `I993 = D993*I992`

### Dependencias entre hojas

- `COTIZADOR ACTUAL` depende fuertemente de `AUXILIAR`.
- `AUXILIAR` parece consolidar:
  - clasificacion de producto;
  - tasas;
  - costos configurables.
- `Datos` es una tabla separada con informacion operativa de proveedores.
- Existen rastros de VBA:
  - `Worksheet_Change`
  - `ThisWorkbook`
- No fue posible descompilar el VBA completo con las herramientas disponibles, pero su presencia queda confirmada.

### Reglas de negocio inferidas

- Solo los items con status exacto `cotizacion` entran a los totales principales.
- El costo FOB unitario se multiplica por un factor global de markup antes del resto de impuestos.
- El seguro se calcula sobre `N + T`.
- La distribucion de flete/admin usa doble prorrateo:
  - por peso (`R`);
  - por valor (`O`).
- El tipo de producto es la llave de lookup para tasas e impuestos.
- El adelanto de IVA se activa/desactiva globalmente con `Y8`.
- El impuesto pais se aplica como multiplicador global sobre `U`.
- El precio de venta final se construye sobre costo unitario total por markup de linea.

### Validaciones detectadas

- `Y8`: lista `"SI,NO"`.
- `D14:D928`: lista fija de vendedores.
- `K21`: lista desde `$U$20:$U$973`.
- `J929:K930`: validacion rota con `#REF!`.

### Celdas editables vs resultados

#### Editables claras

- parametros globales `N8`, `S8`, `Y8`, `AD8`;
- columnas no calculadas de cada item;
- bloques de costos `940:993`.

#### Resultados claros

- columnas `M`, `N`, `O`, `Q`, `R`, `S`, `T`, `U`, `V`, `W`, `X`, `Y`, `Z`, `AA`, `AB`, `AC`, `AD`, `AE`, `AF`, `AH`, `AI`;
- totales `11`, `12`, `929`, `947`, `964`, `984`, `992`, `993`.

### Ambiguedades y hallazgos

- No existe el archivo `COTIZADOR.xlsm` en la ruta informada.
- En la muestra actual no hay filas con status `cotizacion`; solo `COMPRAS` y `VENCIDO`, pero las formulas dependen de `cotizacion`.
- La validacion `J929:K930` apunta a `#REF!`.
- Varias celdas muestran `#VALUE!` en `T`, `AI` y totales derivados cuando faltan datos coherentes.
- Hay logica VBA confirmada, pero no totalmente inspeccionada.
- La hoja `Datos` contiene credenciales en texto plano; no debe migrarse sin rediseño de seguridad.

### Traduccion propuesta a software

- Motor puro de calculo para cotizacion:
  - parametros globales;
  - lista dinamica de items;
  - tablas de tasas/configuracion;
  - bloques configurables de costos origen/destino/remanente;
  - salida con desglose por linea y totales.
- Persistir en DB:
  - configuraciones de cotizador;
  - categorias/tipos de producto;
  - escenarios de cotizacion;
  - items;
  - historico de ejecucion/calculo.
- Dejar el motor desacoplado del frontend y de la base.

## Archivo 2: `Patrimonio (2).xlsx`

### Que hace el archivo

- Consolida patrimonio/estructura financiera.
- Incluye una calculadora de punto de equilibrio.
- Incluye una calculadora de resultado/utilidad por operacion.
- Usa hojas historicas y auxiliares ocultas.

### Hojas relevantes

#### `Punto de equilibrio`

- Hoja visible principal.
- `225` formulas y `970` constantes.
- Tiene una tabla formal:
  - `Tabla1`
  - rango `B1:E44`
  - columnas: `Rubro`, `Monto`, `Datos varios`, `TC`

#### `resultado x op`

- Hoja visible principal.
- `34` formulas y `127` constantes.
- Calculadora compacta de utilidad por operacion.

#### `Patrimonio anyx actual`

- Snapshot financiero amplio.
- Tabla `Tabla24` en `C26:Z67`.
- Sirve como origen de datos historicos/estructura.

#### `Análisis1`

- Contiene formulas de Python de Excel:
  - `_xlfn._xlws.PY`
  - `_DF_Python`
- No es portable directamente a backend Node sin redefinir su logica.

### Modulo: `Punto de equilibrio`

#### Inputs detectados

Inputs de encabezado:

- `C2`: ventas actuales
- `C4`: markup
- `E6`: TC
- `AT4`, `AZ4`: facturacion real por escenario
- `AW2`, `BC2`: TC escenario USD
- `AT5`, `AZ5`: markup escenario

Inputs de gastos fijos / estructura:

- Rubros en `B9:B56`
- Importes/calculos en `C9:C56`
- Parametros auxiliares en `D`, `E`, `F`

Rubros principales:

- cargas sociales
- extra sueldos
- sueldos
- abl
- agua AYSA
- alquiler
- gcba
- luz Edenor
- bancos
- celular
- fibertel
- capacitaciones
- mant cta bancos
- posnet
- seguro
- sindicatos
- verisure ALARMA
- telefonica
- vistage
- limpieza
- pp
- swiss medical
- vituallas
- abogado
- consultoria
- oppen
- estudio contable
- pipedrive
- tango
- fletes
- iibb
- imp al chq
- intereses
- licencias microsoft

Inputs historicos/tesoreria:

- bloque `G:Z` con series mensuales:
  - ventas del mes;
  - saldo bancos;
  - stock;
  - ds x vtas;
  - remit pendientes;
  - fondos;
  - U$S en $;
  - etc.

Inputs de vendedores:

- bloque `AS:BC` filas `58:67`
- salarios y minima facturacion por vendedor.

#### Variables calculadas

Encabezado:

- `D2 = C2/E6`
- `C5 = C2/C4`
- `C6 = SUM(C9:C56)-150000-110000+260000`
- `C7 = C2-C5`
- `C8 = C7-C6`
- `D8 = C8/C2`

Escenario 1:

- `AT6 = AT48/(1-1/AT5-AV21)`
- `AT7 = AT6/AT5`
- `AT8 = AT6-AT7`
- `AT10 = AT21+AT48`
- `AT11 = AT8-AT10`
- `AT12 = 1-1/AT5-AV21`
- `AT13 = AT4-AT6`

Escenario 2:

- `AZ6 = AZ48/(1-1/AZ5-BB21)`
- equivalentes en `AZ:BB`.

#### Dependencias entre hojas

- `' prestamo y dife de cambio'!AB8`
- `' prestamo y dife de cambio'!AH3:AJ4`
- `'Patrimonio anyx old'!B150:B376`

#### Reglas de negocio inferidas

- Punto de equilibrio = gastos fijos totales / margen de contribucion.
- Margen de contribucion = `1 - 1/markup - tasa_gastos_variables`.
- Los gastos variables se calculan como porcentaje de ventas.
- Los gastos fijos se suman desde una estructura amplia de rubros.
- Existe una segunda capa de analisis por vendedor para facturacion minima.

#### Ambiguedades

- Hay dependencias a hojas historicas ocultas.
- Parte de la planilla mezcla presupuesto, caja e historico en un mismo layout.
- Algunos importes son formulas y otros constantes manuales sin proteccion diferencial.

### Modulo: `resultado x op`

#### Inputs detectados

- `F3`: TC
- `C5`: Facturacion
- `C6`: Markup
- tasas variables:
  - `E15`: IIBB
  - `E16`: Impuesto al cheque
  - `E17`: Fletes
  - `E18`: Consultoria
  - `E19`: Comisiones
- costos fijos / estructura:
  - `C23`, `C24`, `C25` ... `C48`
  - y algunos importes derivados en columna `D`

#### Variables calculadas

- `C7 = C5/C6`
- `C8 = C5-C7`
- `C10 = C21+C48`
- `C11 = C8-C10`
- `C12 = 1-1/C6-E21`
- `C15 = C5*E15`
- `C16 = C5*E16`
- `C17 = C5*E17`
- `C18 = C5*E18`
- `C19 = C5*E19`
- `C21 = SUM(C15:C20)`

#### Problemas detectados

- `E23 = C23/$AT$47`
- `E24 = C24/$AT$47`
- La hoja no tiene datos en columna `AT`, por lo que estas referencias quedan rotas de hecho.
- Varias celdas muestran `#DIV/0!` como valor actual.

#### Reglas de negocio inferidas

- Replica el esquema conceptual del punto de equilibrio, pero aplicado a una sola operacion.
- Distingue:
  - facturacion;
  - CMV;
  - utilidad bruta;
  - gastos variables;
  - gastos fijos;
  - resultado operativo.

### Traduccion propuesta a software para `Patrimonio (2).xlsx`

- Separar en dos motores puros:
  - `breakEvenCalculator`
  - `operationProfitCalculator`
- Persistir en DB:
  - configuraciones de rubros;
  - tasas variables;
  - salarios y estructuras por vendedor;
  - escenarios guardados;
  - historicos importados si se decide usarlos.
- Aplanar dependencias a hojas ocultas en configuraciones/tablas de referencia.

## Conclusiones de analisis

- El sistema web debe modelarse como un conjunto de motores de calculo puros con configuraciones persistentes.
- No conviene “copiar la UI del Excel”; conviene extraer:
  - inputs;
  - tablas maestras;
  - formulas;
  - escenarios;
  - trazabilidad.
- Hay errores heredados en los Excel que no deben esconderse:
  - `#REF!`
  - `#VALUE!`
  - `#DIV/0!`
  - formulas que dependen de hojas ocultas;
  - VBA no completamente inspeccionado.
