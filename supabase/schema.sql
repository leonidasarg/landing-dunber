-- Tabla de leads de la landing de Dunber
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nombre        text not null check (char_length(nombre) between 2 and 80),
  comercio      text not null check (char_length(comercio) between 2 and 100),
  telefono      text not null check (char_length(telefono) between 6 and 25),
  localidad     text not null check (char_length(localidad) between 2 and 60),
  tipo_comercio text check (tipo_comercio is null or char_length(tipo_comercio) <= 60),
  mensaje       text check (mensaje is null or char_length(mensaje) <= 500),
  origen        text default 'landing-dunber',
  contactado    boolean not null default false
);

-- Seguridad: el público solo puede INSERTAR. Nadie puede leer/editar con la anon key.
alter table public.leads enable row level security;

drop policy if exists "anon puede insertar leads" on public.leads;
create policy "anon puede insertar leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- (Sin policy de select/update/delete para anon => denegado por defecto)
-- Los leads se consultan desde el panel de Supabase (Table Editor) o con service_role.
