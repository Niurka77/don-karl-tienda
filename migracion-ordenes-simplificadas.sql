-- ============================================================
-- MIGRACIÓN: Simplificar tabla orders para flujo WhatsApp
-- ============================================================
-- El negocio cambió: los pedidos se crean sin pago en línea.
-- El método de pago solo se registra cuando el admin confirma.
-- customer_address y customer_city no se piden en checkout.
-- ============================================================

-- 1. Eliminar CHECK constraint de payment_method (si existe)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- 2. Hacer payment_method nullable (ya no se requiere al crear)
ALTER TABLE orders ALTER COLUMN payment_method DROP NOT NULL;

-- 3. customer_address y customer_city no se recolectan en checkout
ALTER TABLE orders ALTER COLUMN customer_address DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN customer_city DROP NOT NULL;

-- 4. Opcional: establecer valores por defecto elegantes
ALTER TABLE orders ALTER COLUMN payment_method SET DEFAULT NULL;
ALTER TABLE orders ALTER COLUMN customer_address SET DEFAULT NULL;
ALTER TABLE orders ALTER COLUMN customer_city SET DEFAULT NULL;

-- ============================================================
-- NOTA: La columna se llama "products" (no "items") en la DB real
-- El frontend ya envía "products"
-- ============================================================
