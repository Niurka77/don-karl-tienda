-- ═══════════════════════════════════════════════════════════════════
-- POLICIES DE STORAGE PARA BUCKET site-assets
-- Permite al admin subir/eliminar archivos
-- El público puede leer (el bucket es público)
-- ═══════════════════════════════════════════════════════════════════

-- Admin puede subir archivos
CREATE POLICY "Admin sube archivos a site-assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets'
  AND public.is_admin_user()
);

-- Admin puede eliminar archivos
CREATE POLICY "Admin elimina archivos de site-assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'site-assets'
  AND public.is_admin_user()
);

-- Admin puede actualizar archivos
CREATE POLICY "Admin actualiza archivos de site-assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'site-assets'
  AND public.is_admin_user()
);

-- Público puede leer archivos (el bucket es público)
CREATE POLICY "Publico lee archivos de site-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-assets');

-- ═══════════════════════════════════════════════════════════════════
-- LISTO. Ejecuta este script en el SQL Editor de Supabase.
-- ═══════════════════════════════════════════════════════════════════
