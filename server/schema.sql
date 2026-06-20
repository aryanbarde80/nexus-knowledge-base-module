create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('Admin', 'Manager', 'Employee')),
  avatar text,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references categories(id) on delete set null,
  icon text,
  color text,
  created_at timestamptz default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  category_id uuid references categories(id) on delete set null,
  author_id uuid references users(id) on delete set null,
  status text not null check (status in ('Draft', 'Published', 'Archived')),
  visibility text not null default 'Company',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete cascade,
  version integer not null,
  author_id uuid references users(id) on delete set null,
  content text not null,
  summary text,
  created_at timestamptz default now()
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists favorites (
  user_id uuid references users(id) on delete cascade,
  article_id uuid references articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_url text not null,
  size_bytes bigint,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  viewed_at timestamptz default now()
);

create table if not exists search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  query text not null,
  created_at timestamptz default now()
);
