import { Pool } from 'pg';
import { activities, articles as seedArticles, categories as seedCategories, tags, versions as seedVersions, type Article } from '../src/data/mock';

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;

function getPool() {
  if (!process.env.DATABASE_URL) return undefined;
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  return pool;
}

async function ensureSchema(db: Pool) {
  schemaReady ??= db.query(`
    create table if not exists articles (
      id text primary key,
      title text not null,
      slug text unique not null,
      content text not null,
      category_id text,
      author_id text,
      status text not null,
      visibility text not null default 'Company',
      created_at timestamptz default now(),
      updated_at timestamptz default now(),
      views integer default 0,
      favorite boolean default false
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
    create table if not exists article_versions (
      id text primary key,
      article_id text not null,
      version integer not null,
      author_id text,
      content text not null,
      summary text,
      created_at timestamptz default now()
    );
    create table if not exists favorites (
      user_id text not null,
      article_id text not null,
      created_at timestamptz default now(),
      primary key (user_id, article_id)
    );
  `).then(() => undefined);
  await schemaReady;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `article-${Date.now()}`;
}

function mapArticle(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    categoryId: row.category_id || 'sops',
    tags: Array.isArray(row.tags) ? row.tags : [],
    authorId: row.author_id || 'u1',
    status: row.status,
    visibility: row.visibility || 'Company',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    views: Number(row.views || 0),
    favorite: Boolean(row.favorite)
  };
}

function mapCategory(row: any) {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id || undefined,
    icon: row.icon || 'FolderTree',
    color: row.color || '#2673e8',
    articleCount: Number(row.article_count || 0)
  };
}

function send(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function listArticles() {
  const db = getPool();
  if (!db) return { articles: seedArticles };
  await ensureSchema(db);
  const result = await db.query('select * from articles order by updated_at desc');
  return { articles: result.rows.map(mapArticle) };
}

async function getArticle(id: string) {
  const db = getPool();
  if (!db) return { article: seedArticles.find((article) => article.id === id) || null };
  await ensureSchema(db);
  const result = await db.query('select * from articles where id = $1', [id]);
  return { article: result.rows[0] ? mapArticle(result.rows[0]) : null };
}

async function createArticle(body: Partial<Article>, userId: string) {
  const db = getPool();
  const now = new Date().toISOString();
  const article = {
    id: body.id || crypto.randomUUID(),
    title: body.title || 'Untitled Document',
    slug: `${slugify(body.slug || body.title || 'untitled-document')}-${Date.now()}`,
    content: body.content || '<h1>Untitled Document</h1><p>Start writing...</p>',
    categoryId: body.categoryId || 'sops',
    authorId: userId || 'u1',
    status: body.status || 'Draft',
    visibility: body.visibility || 'Company',
    createdAt: now,
    updatedAt: now,
    views: 0,
    favorite: false,
    tags: body.tags || ['SOP']
  } satisfies Article;

  if (!db) return { article };
  await ensureSchema(db);
  try {
    const result = await db.query(
      `insert into articles (id, title, slug, content, category_id, author_id, status, visibility, views, favorite)
       values ($1, $2, $3, $4, $5, $6, $7, $8, 0, false) returning *`,
      [article.id, article.title, article.slug, article.content, article.categoryId, article.authorId, article.status, article.visibility]
    );
    return { article: mapArticle(result.rows[0]) };
  } catch {
    const result = await db.query(
      `insert into articles (id, title, slug, content, status, visibility)
       values ($1, $2, $3, $4, $5, $6) returning *`,
      [article.id, article.title, article.slug, article.content, article.status, article.visibility]
    );
    return { article: mapArticle(result.rows[0]) };
  }
}

async function updateArticle(id: string, body: Partial<Article>, userId: string) {
  const db = getPool();
  if (!db) return { article: { ...seedArticles.find((article) => article.id === id), ...body, id, updatedAt: new Date().toISOString() } };
  await ensureSchema(db);
  const current = await db.query('select * from articles where id = $1', [id]);
  if (current.rows[0]) {
    await db.query(
      'insert into article_versions (id, article_id, version, author_id, content, summary) values ($1, $2, $3, $4, $5, $6)',
      [crypto.randomUUID(), id, 1, userId || 'u1', current.rows[0].content, 'Auto-saved before update']
    ).catch(() => undefined);
  }
  try {
    const result = await db.query(
      `update articles set title = coalesce($2, title), content = coalesce($3, content), category_id = coalesce($4, category_id),
       status = coalesce($5, status), visibility = coalesce($6, visibility), updated_at = now()
       where id = $1 returning *`,
      [id, body.title, body.content, body.categoryId, body.status, body.visibility]
    );
    return { article: mapArticle(result.rows[0]) };
  } catch {
    const result = await db.query(
      `update articles set title = coalesce($2, title), content = coalesce($3, content),
       status = coalesce($4, status), visibility = coalesce($5, visibility), updated_at = now()
       where id = $1 returning *`,
      [id, body.title, body.content, body.status, body.visibility]
    );
    return { article: mapArticle(result.rows[0]) };
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('access-control-allow-origin', process.env.VITE_NEXUS_IFRAME_ORIGIN || '*');
  res.setHeader('access-control-allow-credentials', 'true');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type,x-user-id,x-user-role,x-user-email,authorization');

  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });

  try {
    const url = new URL(req.url || '/api', 'https://nexus-knowledge-base-module.vercel.app');
    const path = url.pathname.replace(/^\/api/, '') || '/';
    const segments = path.split('/').filter(Boolean);
    const userId = req.headers?.['x-user-id'] || 'u1';

    if (req.method === 'GET' && segments[0] === 'articles' && segments[1]) return send(res, 200, await getArticle(segments[1]));
    if (req.method === 'GET' && segments[0] === 'articles') return send(res, 200, await listArticles());
    if (req.method === 'POST' && segments[0] === 'articles') return send(res, 201, await createArticle(await readBody(req), userId));
    if (req.method === 'PUT' && segments[0] === 'articles' && segments[1]) return send(res, 200, await updateArticle(segments[1], await readBody(req), userId));
    if (req.method === 'DELETE' && segments[0] === 'articles' && segments[1]) {
      const db = getPool();
      if (db) {
        await ensureSchema(db);
        await db.query('delete from articles where id = $1', [segments[1]]);
      }
      return send(res, 200, { ok: true });
    }
    if (req.method === 'GET' && segments[0] === 'categories') {
      const db = getPool();
      if (!db) return send(res, 200, { categories: seedCategories });
      await ensureSchema(db);
      const result = await db.query('select * from categories order by name asc');
      return send(res, 200, { categories: result.rows.length ? result.rows.map(mapCategory) : seedCategories });
    }
    if (req.method === 'GET' && segments[0] === 'search') {
      const query = (url.searchParams.get('q') || '').toLowerCase();
      const data = await listArticles();
      return send(res, 200, { results: data.articles.filter((article) => [article.title, article.content, article.tags.join(' ')].join(' ').toLowerCase().includes(query)) });
    }
    if (req.method === 'POST' && segments[0] === 'favorites') return send(res, 200, { ok: true });
    if (req.method === 'GET' && segments[0] === 'activity') return send(res, 200, { activity: activities });
    if (req.method === 'GET' && segments[0] === 'versions') return send(res, 200, { versions: seedVersions });
    if (req.method === 'POST' && segments[0] === 'restore-version') return send(res, 200, { ok: true });
    if (req.method === 'GET' && segments[0] === 'tags') return send(res, 200, { tags });

    return send(res, 404, { message: 'Knowledge Base endpoint not found' });
  } catch (error) {
    return send(res, 500, { message: 'Knowledge Base API error', detail: error instanceof Error ? error.message : 'Unknown error' });
  }
}
