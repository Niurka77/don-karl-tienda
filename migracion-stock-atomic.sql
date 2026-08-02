-- ============================================================
-- MIGRACIÓN: Stock atómico y verificado
-- ============================================================
-- Regla de negocio: el stock se descuenta SOLO cuando hay pago.
-- La BD es la única fuente de verdad (transacciones + bloqueos).
-- ============================================================

-- 1. Estados simplificados (idempotente)
UPDATE orders SET status = 'pendiente' WHERE status = 'aceptado';
UPDATE orders SET status = 'pagado'    WHERE status = 'preparando';
UPDATE orders SET status = 'cancelado' WHERE status = 'expirado';
UPDATE orders SET status = 'pagado'    WHERE status = 'confirmado';

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'cotizacion')
);

-- 2. Columnas de auditoría (quién y cuándo)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fecha_pago       TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS usuario_pago     UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fecha_cancelacion TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS usuario_cancelacion UUID;

-- 3. Historial de movimientos de inventario (auditoría)
CREATE TABLE IF NOT EXISTS inventario_movimientos (
  id          BIGSERIAL PRIMARY KEY,
  producto_id UUID REFERENCES products(id) ON DELETE SET NULL,
  pedido_id   UUID REFERENCES orders(id)   ON DELETE SET NULL,
  tipo        TEXT NOT NULL,                    -- 'venta' | 'cancelacion' | 'ajuste'
  cantidad    INTEGER NOT NULL,                 -- negativo = sale, positivo = entra
  fecha       TIMESTAMPTZ NOT NULL DEFAULT now(),
  usuario_id  UUID
);

-- 4. Función: procesar pago (pendiente/cotizacion -> pagado)
--    Atómica: bloquea pedido + productos, valida TODO el stock,
--    descuenta todo, registra movimientos y marca pagado.
--    Idempotente: si ya está pagado/entregado/enviado, no toca nada.
CREATE OR REPLACE FUNCTION procesar_pago(order_id UUID)
RETURNS TEXT LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pedido RECORD;
  prod   JSONB;
  stock_actual INTEGER;
BEGIN
  SELECT * INTO pedido FROM orders WHERE id = order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'NO_PEDIDO'; END IF;

  -- Idempotente: no volver a descontar
  IF pedido.status IN ('pagado', 'enviado', 'entregado') THEN
    RETURN 'YA_PROCESADO';
  END IF;

  -- Solo se paga desde pendiente o cotizacion
  IF pedido.status NOT IN ('pendiente', 'cotizacion') THEN
    RETURN 'ESTADO_INVALIDO';
  END IF;

  IF pedido.products IS NULL OR jsonb_typeof(pedido.products) <> 'array' THEN
    RETURN 'SIN_PRODUCTOS';
  END IF;

  -- Validar stock de TODOS los productos
  FOR prod IN SELECT * FROM jsonb_array_elements(pedido.products) LOOP
    SELECT stock INTO stock_actual FROM products
      WHERE id = (prod->>'id')::uuid FOR UPDATE;
    IF NOT FOUND THEN RETURN 'PRODUCTO_INEXISTENTE:' || (prod->>'name'); END IF;
    IF stock_actual < (prod->>'quantity')::int THEN
      RETURN 'STOCK_INSUFICIENTE:' || (prod->>'name');
    END IF;
  END LOOP;

  -- Descontar stock
  FOR prod IN SELECT * FROM jsonb_array_elements(pedido.products) LOOP
    UPDATE products SET stock = stock - (prod->>'quantity')::int
      WHERE id = (prod->>'id')::uuid;
  END LOOP;

  -- Registrar movimientos de inventario
  FOR prod IN SELECT * FROM jsonb_array_elements(pedido.products) LOOP
    INSERT INTO inventario_movimientos (producto_id, pedido_id, tipo, cantidad, usuario_id)
    VALUES ((prod->>'id')::uuid, order_id, 'venta', -((prod->>'quantity')::int), auth.uid());
  END LOOP;

  -- Marcar pagado + auditoría
  UPDATE orders SET status = 'pagado', fecha_pago = now(), usuario_pago = auth.uid()
    WHERE id = order_id;

  RETURN 'OK';
END;
$$;

-- 5. Función: cancelar pedido (reponer stock si estaba pagado)
--    Bloquea cancelar un pedido ya ENTREGADO (eso es devolución).
CREATE OR REPLACE FUNCTION cancelar_pedido(order_id UUID)
RETURNS TEXT LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pedido RECORD;
  prod   JSONB;
BEGIN
  SELECT * INTO pedido FROM orders WHERE id = order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'NO_PEDIDO'; END IF;

  -- Un pedido entregado no se cancela: es una devolución
  IF pedido.status = 'entregado' THEN RETURN 'PEDIDO_ENTREGADO'; END IF;

  -- Si estaba pagado/enviado, reponer stock + registrar movimiento
  IF pedido.status IN ('pagado', 'enviado') AND pedido.products IS NOT NULL
     AND jsonb_typeof(pedido.products) = 'array' THEN
    FOR prod IN SELECT * FROM jsonb_array_elements(pedido.products) LOOP
      UPDATE products SET stock = stock + (prod->>'quantity')::int
        WHERE id = (prod->>'id')::uuid;
      INSERT INTO inventario_movimientos (producto_id, pedido_id, tipo, cantidad, usuario_id)
      VALUES ((prod->>'id')::uuid, order_id, 'cancelacion', (prod->>'quantity')::int, auth.uid());
    END LOOP;
  END IF;

  UPDATE orders SET status = 'cancelado', fecha_cancelacion = now(), usuario_cancelacion = auth.uid()
    WHERE id = order_id;

  RETURN 'OK';
END;
$$;

-- 6. Función: reponer stock manualmente (usada al eliminar un pedido pagado)
CREATE OR REPLACE FUNCTION reponer_stock(producto_id UUID, cantidad INTEGER)
RETURNS TEXT LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products SET stock = stock + cantidad WHERE id = producto_id;
  RETURN 'OK';
END;
$$;

-- 7. Políticas RLS para que el admin autenticado pueda actualizar/eliminar pedidos
--    (arregla "Error al actualizar pedido" si la causa era falta de política)
DROP POLICY IF EXISTS orders_update_auth ON orders;
CREATE POLICY orders_update_auth ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS orders_delete_auth ON orders;
CREATE POLICY orders_delete_auth ON orders
  FOR DELETE USING (auth.role() = 'authenticated');
