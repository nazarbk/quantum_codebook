-- Quantum Codebook · progreso de cada usuario
-- Ejecuta este script una vez en Supabase: SQL Editor → New query → pegar → Run.

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Seguridad a nivel de fila: cada persona solo puede leer y escribir su propia fila.
alter table public.user_progress enable row level security;

drop policy if exists "Leer mi progreso" on public.user_progress;
create policy "Leer mi progreso" on public.user_progress
  for select using (auth.uid() = user_id);

drop policy if exists "Crear mi progreso" on public.user_progress;
create policy "Crear mi progreso" on public.user_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "Actualizar mi progreso" on public.user_progress;
create policy "Actualizar mi progreso" on public.user_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Límite de tamaño razonable (progreso + notas) para evitar abusos.
alter table public.user_progress drop constraint if exists user_progress_size;
alter table public.user_progress add constraint user_progress_size check (pg_column_size(data) < 200000);
