-- Supabase Migration: Initial Schema for Mindlight
-- This migration creates the necessary tables for user profiles and encrypted data storage

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  passphrase_salt bytea,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create devices table for tracking user devices
create table devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_name text not null,
  device_fingerprint text,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Create encrypted_blobs table for E2EE storage
create table encrypted_blobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  blob_type text not null check (blob_type in ('assessments', 'progress', 'reflections', 'settings')),
  ciphertext bytea not null,
  version int not null default 1,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, blob_type)
);

-- Create sync_log table for tracking sync operations
create table sync_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  operation text not null check (operation in ('push', 'pull', 'migrate')),
  blob_type text,
  success boolean not null,
  error_message text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table devices enable row level security;
alter table encrypted_blobs enable row level security;
alter table sync_log enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile" 
  on profiles for select 
  using (auth.uid() = user_id);

create policy "Users can insert own profile" 
  on profiles for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own profile" 
  on profiles for update 
  using (auth.uid() = user_id);

-- RLS Policies for devices
create policy "Users can view own devices" 
  on devices for select 
  using (auth.uid() = user_id);

create policy "Users can insert own devices" 
  on devices for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own devices" 
  on devices for update 
  using (auth.uid() = user_id);

create policy "Users can delete own devices" 
  on devices for delete 
  using (auth.uid() = user_id);

-- RLS Policies for encrypted_blobs
create policy "Users can view own blobs" 
  on encrypted_blobs for select 
  using (auth.uid() = user_id);

create policy "Users can insert own blobs" 
  on encrypted_blobs for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own blobs" 
  on encrypted_blobs for update 
  using (auth.uid() = user_id);

create policy "Users can delete own blobs" 
  on encrypted_blobs for delete 
  using (auth.uid() = user_id);

-- RLS Policies for sync_log
create policy "Users can view own sync logs" 
  on sync_log for select 
  using (auth.uid() = user_id);

create policy "Users can insert own sync logs" 
  on sync_log for insert 
  with check (auth.uid() = user_id);

-- Create indexes for performance
create index idx_profiles_user_id on profiles(user_id);
create index idx_devices_user_id on devices(user_id);
create index idx_encrypted_blobs_user_id on encrypted_blobs(user_id);
create index idx_encrypted_blobs_type on encrypted_blobs(blob_type);
create index idx_encrypted_blobs_updated_at on encrypted_blobs(updated_at);
create index idx_sync_log_user_id on sync_log(user_id);
create index idx_sync_log_created_at on sync_log(created_at);

-- Create function to automatically update updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_profiles_updated_at 
  before update on profiles 
  for each row execute function update_updated_at_column();

create trigger update_encrypted_blobs_updated_at 
  before update on encrypted_blobs 
  for each row execute function update_updated_at_column();

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
