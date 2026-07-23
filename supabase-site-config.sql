-- ═══════════════════════════════════════════════════════════════════
-- TABLA DE CONFIGURACIÓN VISUAL DEL SITIO
-- SEGURO PARA EJECUTAR MÚLTIPLES VECES (idempotente)
-- ═══════════════════════════════════════════════════════════════════

-- Tabla principal de configuración
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Eliminar policies si existen
DROP POLICY IF EXISTS "Admin gestiona config visual" ON site_config;
DROP POLICY IF EXISTS "Publico lee config visual" ON site_config;

-- Admin gestiona config
CREATE POLICY "Admin gestiona config visual"
ON site_config FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Público puede leer config
CREATE POLICY "Publico lee config visual"
ON site_config FOR SELECT
USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- LISTO. Ejecuta esto DESPUÉS del script de RLS principal.
-- ═══════════════════════════════════════════════════════════════════
