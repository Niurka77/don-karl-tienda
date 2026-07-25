-- ═══════════════════════════════════════════════════════════════════
-- SETUP COMPLETO - Ejecutar en Supabase SQL Editor
-- Incluye: RLS, site_config, storage bucket y policies
-- Email admin: karl@tienda.com
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. FUNCIÓN HELPER: Verificar admin ──────────────────────────
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

-- ─── 2. TABLA: site_config ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Policies de site_config
DROP POLICY IF EXISTS "Admin gestiona config visual" ON site_config;
DROP POLICY IF EXISTS "Publico lee config visual" ON site_config;

CREATE POLICY "Admin gestiona config visual"
ON site_config FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Publico lee config visual"
ON site_config FOR SELECT
USING (true);

-- ─── 3. TABLA: products (si no existe) ───────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  gender TEXT DEFAULT 'unisex',
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  images_urls TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publico ve productos" ON products;
DROP POLICY IF EXISTS "Admin gestiona productos" ON products;

CREATE POLICY "Publico ve productos"
ON products FOR SELECT
USING (stock > 0 OR public.is_admin_user());

CREATE POLICY "Admin gestiona productos"
ON products FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ─── 4. TABLA: hero_slides ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_slides (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  title_accent TEXT,
  subtitle TEXT,
  description TEXT,
  tag TEXT,
  price NUMERIC(10,2),
  image_url TEXT,
  product_id BIGINT REFERENCES products(id),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publico ve hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Admin gestiona hero slides" ON hero_slides;

CREATE POLICY "Publico ve hero slides"
ON hero_slides FOR SELECT
USING (active = true OR public.is_admin_user());

CREATE POLICY "Admin gestiona hero slides"
ON hero_slides FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ─── 5. TABLA: social_videos ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_videos (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'tiktok',
  video_url TEXT NOT NULL,
  embed_url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE social_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publico ve videos" ON social_videos;
DROP POLICY IF EXISTS "Admin gestiona videos" ON social_videos;

CREATE POLICY "Publico ve videos"
ON social_videos FOR SELECT
USING (active = true OR public.is_admin_user());

CREATE POLICY "Admin gestiona videos"
ON social_videos FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ─── 6. TABLA: orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publico crea pedidos" ON orders;
DROP POLICY IF EXISTS "Admin gestiona pedidos" ON orders;

CREATE POLICY "Publico crea pedidos"
ON orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin gestiona pedidos"
ON orders FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ─── 7. TABLA: reviews ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publico ve reviews aprobados" ON reviews;
DROP POLICY IF EXISTS "Publico crea reviews" ON reviews;
DROP POLICY IF EXISTS "Admin gestiona reviews" ON reviews;

CREATE POLICY "Publico ve reviews aprobados"
ON reviews FOR SELECT
USING (approved = true OR public.is_admin_user());

CREATE POLICY "Publico crea reviews"
ON reviews FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin gestiona reviews"
ON reviews FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ─── 8. STORAGE BUCKET: site-assets ──────────────────────────────
-- Crear bucket (idempotente)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies de storage
DROP POLICY IF EXISTS "Admin sube archivos a site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin elimina archivos de site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin actualiza archivos de site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Publico lee archivos de site-assets" ON storage.objects;

CREATE POLICY "Admin sube archivos a site-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets'
  AND public.is_admin_user()
);

CREATE POLICY "Admin elimina archivos de site-assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets'
  AND public.is_admin_user()
);

CREATE POLICY "Admin actualiza archivos de site-assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets'
  AND public.is_admin_user()
);

CREATE POLICY "Publico lee archivos de site-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- ─── 9. STORAGE BUCKET: product-images ───────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admin subeimagenes a product-images" ON storage.objects;
DROP POLICY IF EXISTS "Publico lee imagenes de product-images" ON storage.objects;

CREATE POLICY "Admin subeimagenes a product-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND public.is_admin_user()
);

CREATE POLICY "Publico lee imagenes de product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- ═══════════════════════════════════════════════════════════════════
-- LISTO. Copia todo esto y pégalo en el SQL Editor de Supabase.
-- ═══════════════════════════════════════════════════════════════════
