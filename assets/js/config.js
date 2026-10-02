/*
 * Configuración pública del sitio.
 * La "anon key" de Supabase es pública por diseño: la seguridad real la dan las
 * políticas RLS de supabase/schema.sql (solo permiten INSERT en la tabla leads).
 * NUNCA pongas acá la service_role key.
 */
window.DUNBER_CONFIG = {
  SUPABASE_URL: '',        // https://xxxxxxxx.supabase.co
  SUPABASE_ANON_KEY: '',   // eyJhbGciOi... (clave "anon public")
  SUPABASE_TABLE: 'leads',
  WHATSAPP_NUMBER: '5493516201626'
};
