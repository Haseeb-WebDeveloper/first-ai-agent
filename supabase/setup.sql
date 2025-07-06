-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists documents (
  id bigserial primary key,
  content text, -- corresponds to pageContent in LangChain
  metadata jsonb,
  embedding vector(1536)
);

-- Create a function to search for similar documents
create or replace function match_documents (
  query_embedding vector(1536),
  filter jsonb default '{}'::jsonb,
  match_count int default 10,
  match_threshold float8 default 0.78
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float8
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where case
    when filter != '{}'::jsonb then
      metadata @> filter
    else
      true
    end
    and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$; 