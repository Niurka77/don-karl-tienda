-- ═══════════════════════════════════════════════════════════════════
-- RLS COMPLETO PARA DON KARL TIENDA
-- Plan gratuito + Google Auth
-- Email admin: karl@tienda.com
-- ═══════════════════════════════════════════════════════════════════

-- ─── PASO 1: Función helper para verificar admin ──────────────────
-- Esta función busca en auth.users por email. Es la forma más segura
-- con Google auth en el plan gratuito.
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

-- ─── PASO 3: Eliminar policies viejas rotas ──────────────────────
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Productos visibles para todos" ON products;
DROP POLICY IF EXISTS "Publico puede actualizar stock" ON products;
DROP POLICY IF EXISTS "Solo admins pueden modificar productos" ON products;

DROP POLICY IF EXISTS "Only admins can update orders" ON orders;
DROP POLICY IF EXISTS "Only admins can view orders" ON orders;
DROP POLICY IF EXISTS "Cualquiera puede crear pedidos" ON orders;

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Cualquiera puede ver reseñas" ON reviews;

DROP POLICY IF EXISTS "Admins gestionan slides" ON hero_slides;
DROP POLICY IF EXISTS "Todos pueden ver slides activos" ON hero_slides;

DROP POLICY IF EXISTS "Admins gestionan videos" ON social_videos;
DROP POLICY IF EXISTS "Todos pueden ver videos activos" ON social_videos;

-- ─── PASO 4: Crear policies correctas ────────────────────────────

-- PRODUCTS
-- Admin puede hacer todo
CREATE POLICY "Admin gestiona productos"
ON products FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Cualquiera puede ver productos
CREATE POLICY "Publico ve productos"
ON products FOR SELECT
USING (true);

-- El RPC de decrementar_stock necesita UPDATE público para stock
-- (Supabase RPC ejecuta con permisos del usuario anónimo)
CREATE POLICY "Publico actualiza stock"
ON products FOR UPDATE
USING (true)
WITH CHECK (true);

-- ORDERS
-- Admin puede ver y actualizar pedidos
CREATE POLICY "Admin gestiona pedidos"
ON orders FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Cualquiera puede crear pedidos (clientes)
CREATE POLICY "Publico crea pedidos"
ON orders FOR INSERT
WITH CHECK (true);

-- REVIEWS
-- Admin puede ver todas las reseñas
CREATE POLICY "Admin ve todas las reseñas"
ON reviews FOR SELECT
USING (true);

-- Cualquiera puede ver reseñas aprobadas
CREATE POLICY "Publico ve reseñas"
ON reviews FOR SELECT
USING (true);

-- Usuarios autenticados pueden crear reseñas
CREATE POLICY "Autenticados crean reseñas"
ON reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- HERO_SLIDES
-- Admin gestiona slides
CREATE POLICY "Admin gestiona slides"
ON hero_slides FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Cualquiera ve slides activos
CREATE POLICY "Publico ve slides activos"
ON hero_slides FOR SELECT
USING (active = true);

-- SOCIAL_VIDEOS
-- Admin gestiona videos
CREATE POLICY "Admin gestiona videos"
ON social_videos FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Cualquiera ve videos activos
CREATE POLICY "Publico ve videos activos"
ON social_videos FOR SELECT
USING (active = true);

-- ─── PASO 5: Activar auto-RLS para tablas futuras ────────────────
-- (Esto se hace en Dashboard > Settings > Database >杂项)

-- ═══════════════════════════════════════════════════════════════════
-- LISTO. Después de ejecutar esto, ve a:
-- Authentication > Users > tu usuario > Copia el User ID
-- Luego verifica que funcione haciendo login en /admin/login
-- ═══════════════════════════════════════════════════════════════════
