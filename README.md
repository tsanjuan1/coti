# Anyx Comercial

Aplicacion web interna para gestion comercial, autenticada con Supabase, persistida en PostgreSQL y construida a partir de la logica relevada desde los Excel operativos.

## Objetivo

El sistema cubre cuatro frentes principales:

- cotizador con formulas desacopladas del frontend;
- calculadora de punto de equilibrio;
- calculadora de utilidad por operacion;
- administracion de usuarios y permisos por modulo.

Los Excel analizados se tomaron como fuente de verdad funcional y las ambiguedades detectadas quedaron documentadas en `docs/`.

## Fuentes analizadas

- `C:\Users\Usuario\Downloads\Estuata - ANYX.xlsm`
- `C:\Users\Usuario\Downloads\Patrimonio (2).xlsx`

Nota importante:

- la ruta original informada para `COTIZADOR.xlsm` no existia en este entorno;
- se utilizo `Estuata - ANYX.xlsm` como fuente operativa equivalente para el modulo cotizador;
- esta decision esta documentada en [docs/analisis_excel.md](/C:/Users/Usuario/OneDrive%20-%20Anyx%20S.R.L/Documentos/New%20project/docs/analisis_excel.md).

## Stack

- Next.js 16 + TypeScript estricto
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Prisma ORM
- Zod
- Vitest
- Vercel para despliegue

## Modulos implementados

### Autenticacion y seguridad

- login con email y password
- logout
- cambio de password desde perfil
- administracion server-side de usuarios con Supabase Admin API
- activacion y desactivacion de usuarios
- permisos por modulo

### Administracion

- alta de usuarios
- edicion de usuarios
- reseteo de password por administrador
- control de acceso a:
  - `QUOTE`
  - `BREAK_EVEN`
  - `OPERATION_PROFIT`
  - `ADMIN`

La baja se resuelve como baja logica por desactivacion para no perder historico ni escenarios asociados.

### Cotizador

- items editables
- calculo inmediato en cliente usando motor puro
- persistencia del escenario en backend
- reglas de producto seedadas desde `AUXILIAR`
- desglose por linea y totales principales

### Punto de equilibrio

- carga de variables principales
- rubros fijos configurables
- tasas variables configurables
- calculo de punto de equilibrio y metas por vendedor

### Utilidad por operacion

- carga de facturacion, markup y TC
- gastos variables y fijos editables
- desglose de utilidad bruta, margen de contribucion y resultado operativo

## Estructura del proyecto

```text
docs/
  analisis_excel.md
  arquitectura.md
  reglas_de_negocio.md
  excel-analysis/
prisma/
  migrations/
  schema.prisma
  seed.ts
scripts/
src/
  app/
  components/
  lib/
  modules/
tests/
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
APP_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="admin@anyx.local"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

## Configuracion de Supabase

1. Crear un proyecto nuevo en Supabase.
2. Obtener `Project URL`, `anon key` y `service_role key`.
3. Ir a `Authentication > Providers` y habilitar `Email`.
4. Completar `.env` con las credenciales.
5. Abrir el boton `Connect` en el dashboard del proyecto para copiar las cadenas de conexion de Postgres.
6. Usar:
   `DATABASE_URL`: transaction pooler / serverless string para Vercel, agregando `?pgbouncer=true&connection_limit=1`
   `DIRECT_URL`: direct connection string

Sugerencia para Prisma:

- `DATABASE_URL`: cadena del pooler transaccional para serverless
- `DIRECT_URL`: cadena directa sin pooler, usada para migraciones

## Instalacion local

```bash
npm install
```

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
npm run dev
```

La semilla hace dos cosas:

- inserta reglas de producto del cotizador;
- intenta crear o sincronizar el usuario administrador en Supabase Auth y en la tabla `AppUser`.

## Usuario administrador inicial

El seed usa:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Ese usuario queda con acceso total a todos los modulos.

## Scripts utiles

```bash
npm run dev
npm run build
npm test
npm run db:generate
npm run db:seed
```

## Despliegue en Vercel

La app esta pensada para desplegarse en Vercel con variables de entorno configuradas a nivel proyecto.

Variables requeridas en Vercel:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_URL`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Notas:

- `APP_URL` debe apuntar al dominio final de Vercel;
- Prisma necesita `DATABASE_URL` y `DIRECT_URL` reales de Supabase Postgres;
- no se deben commitear secretos al repo.

## Migraciones

La migracion inicial se encuentra en:

- [migration.sql](/C:/Users/Usuario/OneDrive%20-%20Anyx%20S.R.L/Documentos/New%20project/prisma/migrations/20260413163000_init/migration.sql)

## Testing

Cobertura incluida:

- tests unitarios del motor de cotizacion
- tests unitarios de punto de equilibrio
- tests unitarios de utilidad por operacion
- tests de permisos por modulo

Ejecutar:

```bash
npm test
```

## Documentacion funcional y tecnica

- [Analisis funcional de Excel](/C:/Users/Usuario/OneDrive%20-%20Anyx%20S.R.L/Documentos/New%20project/docs/analisis_excel.md)
- [Reglas de negocio y ambiguedades](/C:/Users/Usuario/OneDrive%20-%20Anyx%20S.R.L/Documentos/New%20project/docs/reglas_de_negocio.md)
- [Arquitectura](/C:/Users/Usuario/OneDrive%20-%20Anyx%20S.R.L/Documentos/New%20project/docs/arquitectura.md)

## Ambiguedades y limites conocidos

- existe un `vbaProject.bin` en el `xlsm`, pero no se pudo reconstruir todo su comportamiento en este entorno;
- el Excel `resultado x op` tiene referencias rotas como `$AT$47`;
- `Análisis1` usa formulas Python de Excel no portables directamente a Node;
- la hoja `Datos` del `xlsm` contiene credenciales sensibles y no fue migrada a la app.

## Nota sobre Windows + OneDrive

Si `npm run build` falla con un error tipo `EPERM unlink` sobre `.next`, borrar la carpeta y volver a construir:

```powershell
Remove-Item -LiteralPath '.next' -Recurse -Force -ErrorAction SilentlyContinue
cmd /c npm run build
```

## Siguientes pasos recomendados

- conectar el repo a GitHub y desplegar en Vercel con variables de entorno reales;
- cargar configuraciones globales desde panel admin si se quiere externalizar aun mas los parametros;
- completar validacion fina contra usuarios expertos del negocio para cerrar los casos con VBA o referencias rotas heredadas.
