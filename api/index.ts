type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  tags: string[];
  authorId: string;
  status: 'Draft' | 'Published' | 'Archived';
  visibility: 'Company' | 'Managers' | 'Private';
  createdAt: string;
  updatedAt: string;
  views: number;
  favorite: boolean;
};

const seedArticles: Article[] = [
  {
    id: 'a1',
    title: 'Employee Onboarding Guide',
    slug: 'employee-onboarding-guide',
    content: '<h1>Employee Onboarding Guide</h1><p>Set up HR, IT, payroll, and manager handover.</p>',
    categoryId: 'onboarding',
    tags: ['Onboarding', 'HR', 'IT'],
    authorId: 'u1',
    status: 'Published',
    visibility: 'Company',
    createdAt: '2026-02-12T09:00:00.000Z',
    updatedAt: '2026-06-18T10:30:00.000Z',
    views: 1840,
    favorite: true
  }
];

const seedCategories = [
  { id: 'hr', name: 'HR Policies', icon: 'Users', color: '#2563eb', articleCount: 18 },
  { id: 'sops', name: 'SOPs', icon: 'ClipboardList', color: '#059669', articleCount: 24 },
  { id: 'onboarding', name: 'Onboarding Guides', icon: 'Route', color: '#7c3aed', articleCount: 11 },
  { id: 'it', name: 'IT Documentation', icon: 'MonitorCog', color: '#0891b2', articleCount: 15 },
  { id: 'engineering', name: 'Engineering Docs', icon: 'Braces', color: '#dc2626', articleCount: 20 },
  { id: 'finance', name: 'Finance Procedures', icon: 'ReceiptText', color: '#16a34a', articleCount: 13 },
  { id: 'support', name: 'Customer Support Guides', icon: 'Headphones', color: '#ea580c', articleCount: 10 }
];

const seedActivities = [
  { id: 'act1', userId: 'u1', action: 'updated', target: 'Employee Onboarding Guide', timestamp: '2026-06-20T10:00:00.000Z' }
];

const seedVersions = [
  { id: 'v1', articleId: 'a1', version: 12, authorId: 'u1', timestamp: '2026-06-18T10:30:00.000Z', summary: 'Updated IT checklist.' }
];

let pool: any;
let schemaReady: Promise<void> | undefined;

async function getPool() {
  if (!process.env.DATABASE_URL) return undefined;
  if (!pool) {
    const pg = await import('pg');
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

async function ensureSchema(db: any) {
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
    tags: [],
    authorId: row.author_id || 'u1',
    status: row.status,
    visibility: row.visibility || 'Company',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    views: Number(row.views || 0),
    favorite: Boolean(row.favorite)
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
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function listArticles() {
  const db = await getPool();
  if (!db) return { articles: seedArticles };
  await ensureSchema(db);
  const result = await db.query('select * from articles order by updated_at desc');
  return { articles: result.rows.map(mapArticle) };
}

async function createArticle(body: Partial<Article>, userId: string) {
  const db = await getPool();
  const now = new Date().toISOString();
  const article: Article = {
    id: body.id || crypto.randomUUID(),
    title: body.title || 'Untitled Document',
    slug: `${slugify(body.slug || body.title || 'untitled-document')}-${Date.now()}`,
    content: body.content || '<h1>Untitled Document</h1><p>Start writing...</p>',
    categoryId: body.categoryId || 'sops',
    tags: body.tags || ['SOP'],
    authorId: userId || 'u1',
    status: body.status || 'Draft',
    visibility: body.visibility || 'Company',
    createdAt: now,
    updatedAt: now,
    views: 0,
    favorite: false
  };
  if (!db) return { article };
  await ensureSchema(db);
  const result = await db.query(
    `insert into articles (id, title, slug, content, category_id, author_id, status, visibility, views, favorite)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 0, false) returning *`,
    [article.id, article.title, article.slug, article.content, article.categoryId, article.authorId, article.status, article.visibility]
  );
  return { article: mapArticle(result.rows[0]) };
}

async function updateArticle(id: string, body: Partial<Article>, userId: string) {
  const db = await getPool();
  if (!db) return { article: { ...seedArticles.find((article) => article.id === id), ...body, id, updatedAt: new Date().toISOString() } };
  await ensureSchema(db);
  const current = await db.query('select * from articles where id = $1', [id]);
  if (current.rows[0]) {
    await db.query(
      'insert into article_versions (id, article_id, version, author_id, content, summary) values ($1, $2, $3, $4, $5, $6)',
      [crypto.randomUUID(), id, 1, userId || 'u1', current.rows[0].content, 'Auto-saved before update']
    ).catch(() => undefined);
  }
  const result = await db.query(
    `update articles set title = coalesce($2, title), content = coalesce($3, content), category_id = coalesce($4, category_id),
     status = coalesce($5, status), visibility = coalesce($6, visibility), updated_at = now()
     where id = $1 returning *`,
    [id, body.title, body.content, body.categoryId, body.status, body.visibility]
  );
  return { article: mapArticle(result.rows[0]) };
}

export default async function handler(req: any, res: any) {
  res.setHeader('access-control-allow-origin', process.env.VITE_NEXUS_IFRAME_ORIGIN || '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type,x-user-id,x-user-role,x-user-email,authorization');
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });

  try {
    const url = new URL(req.url || '/api', 'https://nexus-knowledge-base-module.vercel.app');
    const path = url.pathname.replace(/^\/api/, '') || '/';
    const segments = path.split('/').filter(Boolean);
    const userId = req.headers?.['x-user-id'] || 'u1';

    if (req.method === 'GET' && segments[0] === 'articles' && segments[1]) {
      const data = await listArticles();
      return send(res, 200, { article: data.articles.find((article: Article) => article.id === segments[1]) || null });
    }
    if (req.method === 'GET' && segments[0] === 'articles') return send(res, 200, await listArticles());
    if (req.method === 'POST' && segments[0] === 'articles') return send(res, 201, await createArticle(await readBody(req), userId));
    if (req.method === 'PUT' && segments[0] === 'articles' && segments[1]) return send(res, 200, await updateArticle(segments[1], await readBody(req), userId));
    if (req.method === 'DELETE' && segments[0] === 'articles' && segments[1]) {
      const db = await getPool();
      if (db) {
        await ensureSchema(db);
        await db.query('delete from articles where id = $1', [segments[1]]);
      }
      return send(res, 200, { ok: true });
    }
    if (req.method === 'GET' && segments[0] === 'categories') return send(res, 200, { categories: seedCategories });
    if (req.method === 'GET' && segments[0] === 'search') {
      const query = (url.searchParams.get('q') || '').toLowerCase();
      const data = await listArticles();
      return send(res, 200, { results: data.articles.filter((article: Article) => [article.title, article.content, article.tags.join(' ')].join(' ').toLowerCase().includes(query)) });
    }
    if (req.method === 'POST' && segments[0] === 'favorites') return send(res, 200, { ok: true });
    if (req.method === 'GET' && segments[0] === 'activity') return send(res, 200, { activity: seedActivities });
    if (req.method === 'GET' && segments[0] === 'versions') return send(res, 200, { versions: seedVersions });
    if (req.method === 'POST' && segments[0] === 'restore-version') return send(res, 200, { ok: true });
    if (req.method === 'GET' && segments[0] === 'tags') return send(res, 200, { tags: ['SOP', 'HR', 'IT', 'Finance', 'Security', 'Onboarding', 'Engineering', 'Support', 'Training'] });

    return send(res, 404, { message: 'Knowledge Base endpoint not found' });
  } catch (error) {
    return send(res, 500, { message: 'Knowledge Base API error', detail: error instanceof Error ? error.message : 'Unknown error' });
  }
}
