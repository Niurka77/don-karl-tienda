-- ═══════════════════════════════════════════════════════════════════
-- RLS COMPLETO PARA DON KARL TIENDA
-- Plan gratuito + Google Auth
-- Email admin: karl@tienda.com
-- 
-- SEGURO PARA EJECUTAR MÚLTIPLES VECES (idempotente)
-- ═══════════════════════════════════════════════════════════════════

-- ─── PASO 1: Función helper para verificar admin ──────────────────
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'karl@tienda.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── PASO 2: Activar RLS en todas las tablas ─────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_videos ENABLE ROW LEVEL SECURITY;

-- Tabla de configuración visual (necesita existir antes de RLS)
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- ─── PASO 3: Eliminar TODAS las policies existentes ──────────────
-- Products
DROP POLICY IF EXISTS "Admin gestiona productos" ON products;
DROP POLICY IF EXISTS "Publico ve productos" ON products;
DROP POLICY IF EXISTS "Publico actualiza stock" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Productos visibles para todos" ON products;
DROP POLICY IF EXISTS "Solo admins pueden modificar productos" ON products;

-- Orders
DROP POLICY IF EXISTS "Admin gestiona pedidos" ON orders;
DROP POLICY IF EXISTS "Publico crea pedidos" ON orders;
DROP POLICY IF EXISTS "Only admins can update orders" ON orders;
DROP POLICY IF EXISTS "Only admins can view orders" ON orders;
DROP POLICY IF EXISTS "Cualquiera puede crear pedidos" ON orders;

-- Reviews
DROP POLICY IF EXISTS "Admin ve todas las reseñas" ON reviews;
DROP POLICY IF EXISTS "Publico ve reseñas" ON reviews;
DROP POLICY IF EXISTS "Autenticados crean reseñas" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Cualquiera puede ver reseñas" ON reviews;

-- Hero slides
DROP POLICY IF EXISTS "Admin gestiona slides" ON hero_slides;
DROP POLICY IF EXISTS "Publico ve slides activos" ON hero_slides;
DROP POLICY IF EXISTS "Admins gestionan slides" ON hero_slides;
DROP POLICY IF EXISTS "Todos pueden ver slides activos" ON hero_slides;

-- Social videos
DROP POLICY IF EXISTS "Admin gestiona videos" ON social_videos;
DROP POLICY IF EXISTS "Publico ve videos activos" ON social_videos;
DROP POLICY IF EXISTS "Admins gestionan videos" ON social_videos;
DROP POLICY IF EXISTS "Todos pueden ver videos activos" ON social_videos;

-- Site config
DROP POLICY IF EXISTS "Admin gestiona config visual" ON site_config;
DROP POLICY IF EXISTS "Publico lee config visual" ON site_config;

-- ─── PASO 4: Crear policies correctas ────────────────────────────

-- PRODUCTS
CREATE POLICY "Admin gestiona productos"
ON products FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Publico ve productos"
ON products FOR SELECT
USING (true);

-- ORDERS
CREATE POLICY "Admin gestiona pedidos"
ON orders FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Publico crea pedidos"
ON orders FOR INSERT
WITH CHECK (true);

-- REVIEWS
CREATE POLICY "Admin ve todas las reseñas"
ON reviews FOR SELECT
USING (public.is_admin_user());

CREATE POLICY "Publico ve reseñas"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "Autenticados crean reseñas"
ON reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- HERO_SLIDES
CREATE POLICY "Admin gestiona slides"
ON hero_slides FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Publico ve slides activos"
ON hero_slides FOR SELECT
USING (active = true);

-- SOCIAL_VIDEOS
CREATE POLICY "Admin gestiona videos"
ON social_videos FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Publico ve videos activos"
ON social_videos FOR SELECT
USING (active = true);

-- SITE_CONFIG
CREATE POLICY "Admin gestiona config visual"
ON site_config FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Publico lee config visual"
ON site_config FOR SELECT
USING (true);

-- ─── PASO 5: RPC segura para decrementar stock ───────────────────
CREATE OR REPLACE FUNCTION public.decrementar_stock(product_id uuid, cantidad int)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = stock - cantidad
  WHERE id = product_id
    AND stock >= cantidad;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- LISTO. Puedes ejecutar este script cuantas veces necesites.
-- ═══════════════════════════════════════════════════════════════════
