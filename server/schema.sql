create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  role text not null check (role in ('Admin', 'Manager', 'Employee')),
  avatar text,
  created_at timestamptz default now()
);

create table if not exists categories (
  id text primary key,
  name text not null,
  parent_id text,
  icon text,
  color text,
  article_count integer default 0,
  created_at timestamptz default now()
);

create table if not exists articles (
  id text primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  category_id text,
  author_id text,
  status text not null check (status in ('Draft', 'Published', 'Archived')),
  visibility text not null default 'Company',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  views integer default 0,
  favorite boolean default false
);

create table if not exists article_versions (
  id text primary key,
  article_id text not null,
  version integer not null,
  author_id text,
  content text not null,
  summary text,
  created_at timestamptz default now()
);

create table if not exists tags (
  id text primary key,
  name text unique not null
);

create table if not exists article_tags (
  article_id text not null,
  tag_id text not null,
  primary key (article_id, tag_id)
);

create table if not exists favorites (
  user_id text not null,
  article_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);

create table if not exists attachments (
  id text primary key,
  article_id text not null,
  file_name text not null,
  file_type text not null,
  file_url text not null,
  size_bytes bigint,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists article_views (
  id text primary key,
  article_id text not null,
  user_id text,
  viewed_at timestamptz default now()
);

create table if not exists search_history (
  id text primary key,
  user_id text,
  query text not null,
  created_at timestamptz default now()
);
