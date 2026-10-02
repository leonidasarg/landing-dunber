/*
 * Configuración pública del sitio.
 * La "anon key" de Supabase es pública por diseño: la seguridad real la dan las
 * políticas RLS de supabase/schema.sql (solo permiten INSERT en la tabla basededatosdunbersa).
 * NUNCA pongas acá la service_role key.
 */
window.DUNBER_CONFIG = {
  SUPABASE_URL: 'https://mzkhkgkcyfzpljslcmri.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2hrZ2tjeWZ6cGxqc2xjbXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTkxMzAsImV4cCI6MjEwNjUzNTEzMH0.gYNkTTkQ1-hfFJSpv1_CshWuKjJ5hBR60X0KT7FLmQw',
  SUPABASE_TABLE: 'basededatosdunbersa',
  WHATSAPP_NUMBER: '5493516201626'
};
