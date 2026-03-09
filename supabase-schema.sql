-- LaunchPad Pro Tier Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  tier text not null default 'free' check (tier in ('free', 'one_time', 'pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================================
-- ROADMAPS
-- ============================================================
create table if not exists roadmaps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  answers jsonb not null default '{}',
  preview jsonb not null default '{}',
  full_plan jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_roadmaps_user_id on roadmaps(user_id);

alter table roadmaps enable row level security;

create policy "Users can view own roadmaps"
  on roadmaps for select
  using (auth.uid() = user_id);

create policy "Users can insert own roadmaps"
  on roadmaps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own roadmaps"
  on roadmaps for update
  using (auth.uid() = user_id);

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  roadmap_id uuid references roadmaps(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  day_number integer not null check (day_number between 1 and 30),
  title text not null,
  description text not null default '',
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_tasks_roadmap_day on tasks(roadmap_id, day_number);
create index idx_tasks_user_id on tasks(user_id);

alter table tasks enable row level security;

create policy "Users can view own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
create table if not exists chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  roadmap_id uuid references roadmaps(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_chat_messages_roadmap on chat_messages(roadmap_id, created_at);

alter table chat_messages enable row level security;

create policy "Users can view own chat messages"
  on chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
  on chat_messages for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- CHECK-INS
-- ============================================================
create table if not exists check_ins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  roadmap_id uuid references roadmaps(id) on delete cascade not null,
  day_number integer not null check (day_number between 1 and 30),
  mood text not null check (mood in ('great', 'okay', 'stuck', 'overwhelmed')),
  note text,
  created_at timestamptz not null default now(),
  -- One check-in per user per roadmap per day
  unique (user_id, roadmap_id, day_number)
);

create index idx_check_ins_user_roadmap on check_ins(user_id, roadmap_id);

alter table check_ins enable row level security;

create policy "Users can view own check-ins"
  on check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert own check-ins"
  on check_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own check-ins"
  on check_ins for update
  using (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null unique,
  stripe_subscription_id text not null,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_end timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_user_id on subscriptions(user_id);

alter table subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================
-- SERVICE ROLE POLICIES (for webhooks/cron that bypass RLS)
-- The admin client uses the service_role key which bypasses RLS.
-- These policies allow the service role to insert/update all tables.
-- ============================================================

-- Grant service_role access (this is automatic with service_role key,
-- but we add policies for tasks insert since task generation uses admin client)
create policy "Service role can insert tasks"
  on tasks for insert
  with check (true);

create policy "Service role can insert chat messages"
  on chat_messages for insert
  with check (true);

create policy "Service role can manage subscriptions"
  on subscriptions for all
  using (true);

create policy "Service role can manage profiles"
  on profiles for all
  using (true);
