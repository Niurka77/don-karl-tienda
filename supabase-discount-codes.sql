-- ═══════════════════════════════════════════════════════════════════
-- TABLA DE CÓDIGOS DE DESCUENTO
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS discount_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  min_purchase NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publico valida codigos" ON discount_codes;
DROP POLICY IF EXISTS "Admin gestiona codigos" ON discount_codes;

CREATE POLICY "Publico valida codigos"
ON discount_codes FOR SELECT
USING (active = true);

CREATE POLICY "Admin gestiona codigos"
ON discount_codes FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ═══════════════════════════════════════════════════════════════════
-- LISTO
-- ═══════════════════════════════════════════════════════════════════
