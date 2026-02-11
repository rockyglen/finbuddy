-- Add monthly_budget column to profiles
alter table profiles add column if not exists monthly_budget numeric default 2000;
