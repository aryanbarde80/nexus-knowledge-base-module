import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import admin from 'firebase-admin';
import { activities, articles, categories, tags, versions } from '../src/data/mock';

type CurrentUser = { id: string; role: 'Admin' | 'Manager' | 'Employee'; email?: string };

@Injectable()
export class KnowledgeService {
  private pool?: Pool;
  private firebase?: admin.app.App;
  private schemaReady?: Promise<void>;

  constructor() {
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined });
    }

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && !admin.apps.length) {
      try {
        this.firebase = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
      } catch {
        this.firebase = undefined;
      }
    }
  }

  async listArticles() {
    if (!this.pool) return { articles };
    await this.ensureSchema();
    const result = await this.pool.query(`
      select a.*, coalesce(json_agg(t.name) filter (where t.name is not null), '[]') as tags
      from articles a
      left join article_tags at on at.article_id = a.id
      left join tags t on t.id = at.tag_id
      group by a.id
      order by a.updated_at desc
    `);
    return { articles: result.rows.map(this.mapArticle) };
  }

  async getArticle(id: string) {
    if (!this.pool) return { article: articles.find((article) => article.id === id) };
    await this.ensureSchema();
    const result = await this.pool.query('select * from articles where id = $1', [id]);
    return { article: result.rows[0] ? this.mapArticle(result.rows[0]) : null };
  }

  async createArticle(body: any, user: CurrentUser) {
    this.assertCanWrite(user);
    if (!this.pool) return { article: { ...body, id: crypto.randomUUID(), authorId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
    await this.ensureSchema();
    const id = body.id || crypto.randomUUID();
    const slug = await this.uniqueSlug(body.slug || this.slugify(body.title || 'untitled-document'));
    let result;
    try {
      result = await this.pool.query(
        `insert into articles (id, title, slug, content, category_id, author_id, status, visibility)
         values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
        [id, body.title, slug, body.content, body.categoryId || null, user.id || null, body.status || 'Draft', body.visibility || 'Company']
      );
    } catch {
      result = await this.pool.query(
        `insert into articles (id, title, slug, content, category_id, author_id, status, visibility)
         values ($1, $2, $3, $4, null, null, $5, $6) returning *`,
        [id, body.title, slug, body.content, body.status || 'Draft', body.visibility || 'Company']
      );
    }
    await this.notify('Article created', body.title);
    return { article: this.mapArticle(result.rows[0]) };
  }

  async updateArticle(id: string, body: any, user: CurrentUser) {
    this.assertCanWrite(user);
    if (!this.pool) return { article: { ...articles.find((article) => article.id === id), ...body, id, updatedAt: new Date().toISOString() } };
    await this.ensureSchema();
    const current = await this.pool.query('select * from articles where id = $1', [id]);
    if (current.rows[0]) {
      const versionCount = await this.pool.query('select count(*)::int as count from article_versions where article_id = $1', [id]);
      await this.pool.query(
        'insert into article_versions (article_id, version, author_id, content, summary) values ($1, $2, $3, $4, $5)',
        [id, versionCount.rows[0].count + 1, user.id, current.rows[0].content, 'Auto-saved before update']
      );
    }
    let result;
    try {
      result = await this.pool.query(
        `update articles set title = coalesce($2, title), content = coalesce($3, content), category_id = coalesce($4, category_id),
         status = coalesce($5, status), visibility = coalesce($6, visibility), updated_at = now()
         where id = $1 returning *`,
        [id, body.title, body.content, body.categoryId, body.status, body.visibility]
      );
    } catch {
      result = await this.pool.query(
        `update articles set title = coalesce($2, title), content = coalesce($3, content),
         status = coalesce($4, status), visibility = coalesce($5, visibility), updated_at = now()
         where id = $1 returning *`,
        [id, body.title, body.content, body.status, body.visibility]
      );
    }
    await this.notify('Article updated', body.title || id);
    return { article: this.mapArticle(result.rows[0]) };
  }

  async deleteArticle(id: string, user: CurrentUser) {
    if (user.role !== 'Admin') throw new Error('Admin access required');
    await this.ensureSchema();
    if (this.pool) await this.pool.query('delete from articles where id = $1', [id]);
    return { ok: true };
  }

  async listCategories() {
    if (!this.pool) return { categories };
    await this.ensureSchema();
    const result = await this.pool.query('select * from categories order by name asc');
    return { categories: result.rows.length ? result.rows.map(this.mapCategory) : categories };
  }

  async createCategory(body: any, user: CurrentUser) {
    this.assertCanWrite(user);
    if (!this.pool) return { category: { ...body, id: crypto.randomUUID(), articleCount: 0 } };
    await this.ensureSchema();
    const result = await this.pool.query('insert into categories (id, name, parent_id, icon, color) values ($1, $2, $3, $4, $5) returning *', [body.id || this.slugify(body.name), body.name, body.parentId || null, body.icon, body.color]);
    await this.notify('New category added', body.name);
    return { category: result.rows[0] };
  }

  async search(query = '') {
    const needle = query.toLowerCase();
    if (!this.pool) {
      return { results: articles.filter((article) => [article.title, article.content, article.tags.join(' ')].join(' ').toLowerCase().includes(needle)) };
    }
    await this.ensureSchema();
    const result = await this.pool.query(
      `select * from articles where title ilike $1 or content ilike $1 or slug ilike $1 order by updated_at desc limit 25`,
      [`%${query}%`]
    );
    return { results: result.rows.map(this.mapArticle) };
  }

  async favorite(articleId: string, user: CurrentUser) {
    if (this.pool) {
      await this.ensureSchema();
      await this.pool.query('insert into favorites (user_id, article_id) values ($1, $2) on conflict do nothing', [user.id, articleId]);
    }
    return { ok: true };
  }

  async activity() {
    return { activity: activities };
  }

  async articleVersions(articleId?: string) {
    if (!this.pool) return { versions: articleId ? versions.filter((version) => version.articleId === articleId) : versions };
    await this.ensureSchema();
    const result = await this.pool.query('select * from article_versions where ($1::text is null or article_id = $1) order by version desc', [articleId || null]);
    return { versions: result.rows };
  }

  async restoreVersion(articleId: string, versionId: string, user: CurrentUser) {
    this.assertCanWrite(user);
    if (this.pool) {
      await this.ensureSchema();
      const version = await this.pool.query('select * from article_versions where id = $1 and article_id = $2', [versionId, articleId]);
      if (version.rows[0]) await this.pool.query('update articles set content = $2, updated_at = now() where id = $1', [articleId, version.rows[0].content]);
    }
    return { ok: true };
  }

  async tags() {
    return { tags };
  }

  private assertCanWrite(user: CurrentUser) {
    if (!['Admin', 'Manager'].includes(user.role)) throw new Error('Write access requires Admin or Manager role');
  }

  private async notify(title: string, body: string) {
    if (!this.firebase) return;
    await this.firebase.firestore().collection('knowledge_notifications').add({ title, body, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  private async ensureSchema() {
    if (!this.pool) return;
    this.schemaReady ??= this.pool.query(`
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
      create table if not exists tags (id text primary key, name text unique not null);
      create table if not exists article_tags (article_id text not null, tag_id text not null, primary key (article_id, tag_id));
      create table if not exists favorites (user_id text not null, article_id text not null, created_at timestamptz default now(), primary key (user_id, article_id));
    `).then(() => undefined);
    await this.schemaReady;
  }

  private async uniqueSlug(base: string) {
    if (!this.pool) return base;
    const candidate = this.slugify(base);
    const result = await this.pool.query('select count(*)::int as count from articles where slug = $1', [candidate]);
    return result.rows[0]?.count ? `${candidate}-${Date.now()}` : candidate;
  }

  private slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `article-${Date.now()}`;
  }

  private mapCategory(row: any) {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parent_id || undefined,
      icon: row.icon || 'FolderTree',
      color: row.color || '#2673e8',
      articleCount: Number(row.article_count || 0)
    };
  }

  private mapArticle(row: any) {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: row.content,
      categoryId: row.category_id,
      authorId: row.author_id,
      status: row.status,
      visibility: row.visibility,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags: row.tags || [],
      views: Number(row.views || 0),
      favorite: Boolean(row.favorite)
    };
  }
}
