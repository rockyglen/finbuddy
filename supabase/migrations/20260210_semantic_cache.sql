-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Create the semantic cache table
create table if not exists ai_summary_cache (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    input_hash text not null, -- A hash of the expenses used for exact matching
    embedding vector(1536),    -- Embedding for semantic similarity
    summary_text text not null,
    created_at timestamp with time zone default now(),
    
    constraint unique_user_hash unique(user_id, input_hash)
);

-- 3. Create a vector index for faster search
create index on ai_summary_cache using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
