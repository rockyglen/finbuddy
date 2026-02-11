-- 1. Add embedding column to expenses
alter table expenses add column if not exists embedding vector(1536);

-- 2. Create index for fast vector searching
create index on expenses using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 3. RPC function for semantic search
create or replace function match_expenses (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  category text,
  amount numeric,
  date date,
  description text,
  user_id uuid,
  ocr_parsed jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    expenses.id,
    expenses.category,
    expenses.amount,
    expenses.date,
    expenses.description,
    expenses.user_id,
    expenses.ocr_parsed,
    1 - (expenses.embedding <=> query_embedding) as similarity
  from expenses
  where 1 - (expenses.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
