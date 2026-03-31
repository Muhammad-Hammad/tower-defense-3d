-- Tower Defense 3D — Phase 1 schema + RLS
-- Apply in Supabase SQL Editor or via CLI: supabase db push

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_choice text,
  total_stars integer not null default 0,
  tutorial_complete boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stage clears (per difficulty)
create table if not exists public.stage_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stage_id integer not null,
  difficulty text not null check (difficulty in ('easy', 'normal', 'hard')),
  stars integer not null check (stars between 0 and 3),
  best_time integer,
  completed_at timestamptz not null default now(),
  unique (user_id, stage_id, difficulty)
);

alter table public.stage_progress enable row level security;

create policy "stage_progress_select_own"
  on public.stage_progress for select using (auth.uid() = user_id);

create policy "stage_progress_insert_own"
  on public.stage_progress for insert with check (auth.uid() = user_id);

create policy "stage_progress_update_own"
  on public.stage_progress for update using (auth.uid() = user_id);

create policy "stage_progress_delete_own"
  on public.stage_progress for delete using (auth.uid() = user_id);

-- Tower upgrade unlocks (global per tower type for user)
create table if not exists public.tower_upgrades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tower_type text not null,
  upgrade_path jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, tower_type)
);

alter table public.tower_upgrades enable row level security;

create policy "tower_upgrades_select_own"
  on public.tower_upgrades for select using (auth.uid() = user_id);

create policy "tower_upgrades_upsert_own"
  on public.tower_upgrades for insert with check (auth.uid() = user_id);

create policy "tower_upgrades_update_own"
  on public.tower_upgrades for update using (auth.uid() = user_id);

create policy "tower_upgrades_delete_own"
  on public.tower_upgrades for delete using (auth.uid() = user_id);

-- User settings (video/audio/game)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  quality_preset text,
  resolution_scale real,
  master_volume real,
  bgm_volume real,
  sfx_volume real,
  keybindings jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings_select_own"
  on public.user_settings for select using (auth.uid() = user_id);

create policy "user_settings_insert_own"
  on public.user_settings for insert with check (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update using (auth.uid() = user_id);

-- Side quest progress
create table if not exists public.side_quest_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  quest_id text not null,
  current_count integer not null default 0,
  completed boolean not null default false,
  primary key (user_id, quest_id)
);

alter table public.side_quest_progress enable row level security;

create policy "side_quest_select_own"
  on public.side_quest_progress for select using (auth.uid() = user_id);

create policy "side_quest_insert_own"
  on public.side_quest_progress for insert with check (auth.uid() = user_id);

create policy "side_quest_update_own"
  on public.side_quest_progress for update using (auth.uid() = user_id);
