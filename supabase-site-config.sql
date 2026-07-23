-- ═══════════════════════════════════════════════════════════════════
-- TABLA DE CONFIGURACIÓN VISUAL DEL SITIO
-- Almacena texturas, decoraciones, textos y colores editables
-- ═══════════════════════════════════════════════════════════════════

-- Tabla principal de configuración
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Solo admin puede modificar, todos pueden leer
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Admin gestiona config
CREATE POLICY "Admin gestiona config visual"
ON site_config FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Público puede leer config (para texturas/textos de la tienda)
CREATE POLICY "Publico lee config visual"
ON site_config FOR SELECT
USING (true);

-- Bucket de storage para assets del sitio (texturas, decoraciones)
-- Ejecutar esto desde el Dashboard de Supabase:
-- Storage > New Bucket > name: "site-assets" > Public: true

-- ═══════════════════════════════════════════════════════════════════
-- INSTRUCCIONES:
-- 1. Ejecuta este SQL en el SQL Editor de Supabase
-- 2. Ve a Storage y crea el bucket "site-assets" como público
-- 3. El sistema de configuración visual ya funcionará
-- ═══════════════════════════════════════════════════════════════════
