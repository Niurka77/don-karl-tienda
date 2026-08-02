-- ============================================================
-- MIGRACIÓN: Columna photo_shape en testimonials
-- ============================================================
-- Permite elegir el encuadre de la foto de cada testimonio:
-- 'circle' (avatar redondeado) o 'square' (cuadrado con esquinas suaves)
-- ============================================================

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS photo_shape TEXT DEFAULT 'circle';
ALTER TABLE testimonials ALTER COLUMN photo_shape SET DEFAULT 'circle';
