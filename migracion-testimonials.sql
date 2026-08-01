-- ============================================================
-- MIGRACIÓN: Tabla testimonials (opiniones de clientas)
-- ============================================================
-- Carrusel de opiniones en Home, gestionadas desde el admin.
-- El admin agrega los testimonios que recibe por WhatsApp/tienda.
-- ============================================================

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT DEFAULT '',
  photo TEXT DEFAULT '',
  comment TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activar RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
DROP POLICY IF EXISTS "Publico ve testimonios" ON testimonials;
DROP POLICY IF EXISTS "Admin gestiona testimonios" ON testimonials;

CREATE POLICY "Publico ve testimonios"
ON testimonials FOR SELECT
USING (active = true);

CREATE POLICY "Admin gestiona testimonios"
ON testimonials FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 4. Permisos de lectura para anon (necesario junto a la política)
GRANT SELECT ON testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON testimonials TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE testimonials_id_seq TO authenticated;

-- ============================================================
-- NOTA: Ejecutar después de que exista la función
-- public.is_admin_user() y la tabla public.orders
-- (ya creadas en supabase-setup-completo.sql / supabase-rls-setup.sql)
-- ============================================================
