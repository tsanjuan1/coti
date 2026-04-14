# Arquitectura propuesta

## Stack elegida

- Frontend: Next.js con App Router + TypeScript estricto
- UI: Tailwind CSS
- Backend: Route Handlers y servicios de dominio en el mismo repo
- Base de datos: Supabase Postgres
- ORM: Prisma
- Autenticacion: Supabase Auth con email/password y administracion server-side
- Validacion: Zod
- Testing: Vitest para dominio y permisos

## Justificacion

- Next.js permite un monolito modular rapido de poner en produccion.
- Supabase resuelve autenticacion, Postgres administrado y operacion simple.
- Prisma da tipado, migraciones y separacion limpia entre dominio y persistencia.
- Mantener frontend y backend en el mismo repo simplifica evolucion y deploy.

## Principios

- Logica de negocio desacoplada de la UI.
- Persistencia desacoplada del motor de calculo.
- Configuracion parametrizable en DB.
- Seguridad server-side: ninguna formula critica vive solo en cliente.
- Arquitectura preparada para sumar nuevos modulos y permisos finos.

## Estructura propuesta

```text
src/
  app/
    (auth)/
    (private)/
      cotizador/
      punto-equilibrio/
      resultado-operacion/
      admin/
    api/
  components/
  lib/
    auth/
    db/
    permissions/
    validations/
  modules/
    cotizador/
      domain/
      service/
      repository/
      ui/
    break-even/
      domain/
      service/
      repository/
      ui/
    operation-profit/
      domain/
      service/
      repository/
      ui/
    admin/
  styles/
prisma/
  schema.prisma
  seed.ts
docs/
tests/
```

## Modelo de autenticacion y autorizacion

### Autenticacion

- Supabase Auth como fuente de identidad.
- Login por email/password.
- Sesion mantenida por Supabase en cookies SSR.

### Autorizacion

- Perfil de aplicacion separado de `auth.users`.
- Roles base:
  - `ADMIN`
  - `SELLER`
- Permisos por modulo:
  - `quote`
  - `break_even`
  - `operation_profit`
  - `admin`

### Escalabilidad futura

- Tabla de permisos preparada para acciones mas finas:
  - `read`
  - `write`
  - `manage`
  - `export`

## Modelo de datos propuesto

### Usuarios y permisos

- `app_user`
  - `id`
  - `auth_user_id`
  - `email`
  - `full_name`
  - `role`
  - `is_active`
  - `must_change_password`
  - `created_at`
  - `updated_at`

- `module_permission`
  - `id`
  - `user_id`
  - `module_key`
  - `can_access`
  - `can_manage`

### Configuracion global

- `system_setting`
  - `id`
  - `namespace`
  - `key`
  - `value_json`
  - `description`

### Cotizador

- `quote_scenario`
  - `id`
  - `name`
  - `created_by`
  - `seller_id`
  - `status`
  - `global_markup_factor`
  - `insurance_rate`
  - `advance_vat_enabled`
  - `country_tax_rate`
  - `notes`
  - `created_at`
  - `updated_at`

- `quote_item`
  - `id`
  - `scenario_id`
  - `line_number`
  - `status`
  - `quote_date`
  - `seller_name`
  - `quantity`
  - `part_number`
  - `description`
  - `product_type_key`
  - `fob_unit_cost`
  - `weight_kg`
  - `line_markup`

- `quote_cost_profile`
  - `id`
  - `scenario_id`
  - `section`
  - `line_key`
  - `label`
  - `mode`
  - `amount`
  - `rate`
  - `metadata_json`

- `quote_product_rule`
  - `id`
  - `product_type_key`
  - `duty_rate`
  - `statistics_rate`
  - `vat_rate`
  - `advance_vat_rate`
  - `gross_income_rate`
  - `advance_income_tax_rate`
  - `internal_tax_rate`
  - `ncm_code`
  - `description`

### Punto de equilibrio

- `break_even_scenario`
  - `id`
  - `name`
  - `created_by`
  - `sales_amount`
  - `markup`
  - `exchange_rate`
  - `real_billing_pesos`
  - `real_billing_markup`
  - `real_billing_exchange_rate`
  - `alt_billing_pesos`
  - `alt_billing_markup`
  - `alt_billing_exchange_rate`
  - `created_at`
  - `updated_at`

- `break_even_fixed_cost_line`
  - `id`
  - `scenario_id`
  - `line_key`
  - `label`
  - `amount`
  - `formula_mode`
  - `input_a`
  - `input_b`
  - `input_c`

- `break_even_variable_cost_line`
  - `id`
  - `scenario_id`
  - `line_key`
  - `label`
  - `rate`

- `break_even_sales_history`
  - `id`
  - `scenario_id`
  - `period_label`
  - `sales_amount`
  - `collections_amount`
  - `loan_amount`
  - `cash_out_amount`

- `break_even_salesperson_profile`
  - `id`
  - `scenario_id`
  - `label`
  - `salary_amount`
  - `burden_amount`
  - `salary_share`
  - `allocated_fixed_cost`
  - `contribution_margin`

### Resultado por operacion

- `operation_profit_scenario`
  - `id`
  - `name`
  - `created_by`
  - `exchange_rate`
  - `billing_amount`
  - `markup`
  - `created_at`
  - `updated_at`

- `operation_profit_variable_cost_line`
  - `id`
  - `scenario_id`
  - `line_key`
  - `label`
  - `rate`

- `operation_profit_fixed_cost_line`
  - `id`
  - `scenario_id`
  - `line_key`
  - `label`
  - `amount`
  - `derived_amount`

### Auditoria

- `audit_log`
  - `id`
  - `actor_user_id`
  - `entity_type`
  - `entity_id`
  - `action`
  - `payload_json`
  - `created_at`

## Servicios de dominio

### Cotizador

- `calculateQuoteItemBreakdown(input, context)`
- `calculateQuoteScenarioTotals(input, context)`
- `normalizeQuoteScenarioInput(input)`

### Punto de equilibrio

- `calculateBreakEvenScenario(input)`
- `calculateBreakEvenSalespersonTargets(input)`

### Resultado por operacion

- `calculateOperationProfit(input)`

### Permisos

- `assertModuleAccess(user, module)`
- `assertAdminAccess(user)`

## Manejo de seguridad

- Toda escritura pasa por server actions o route handlers.
- Los permisos se validan en:
  - middleware de rutas privadas;
  - capa de servicio;
  - endpoints administrativos.
- Las claves de Supabase admin quedan solo del lado servidor.
- No se exponen credenciales importadas desde Excel.

## Estrategia de persistencia

- Guardar escenarios de calculo para trazabilidad y reuse.
- Guardar configuraciones como registros editables, no como constantes del codigo.
- Permitir semillas iniciales a partir de los Excel analizados.

## Testing esperado

- Unit tests sobre formulas clave de cada motor.
- Tests de permisos por modulo.
- Tests de normalizacion de input y manejo de errores.

## Riesgos y mitigacion

- VBA no inspeccionado completamente:
  - mitigar con documentacion y capa de configuracion flexible.
- Formulas heredadas rotas:
  - mitigar marcando overrides configurables y tests de regresion.
- Dependencias a hojas ocultas:
  - mitigar aplanando datos en tablas de configuracion.
