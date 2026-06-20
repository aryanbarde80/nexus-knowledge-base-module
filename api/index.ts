import 'reflect-metadata';
import { KnowledgeService } from '../server/knowledge.service';

const knowledge = new KnowledgeService();

function currentUser(headers: Record<string, string | string[] | undefined>) {
  const value = (name: string) => {
    const header = headers[name.toLowerCase()];
    return Array.isArray(header) ? header[0] : header;
  };

  return {
    id: value('x-user-id') || 'u1',
    role: (value('x-user-role') as 'Admin' | 'Manager' | 'Employee') || 'Admin',
    email: value('x-user-email')
  };
}

async function readBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function send(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  res.setHeader('access-control-allow-origin', process.env.VITE_NEXUS_IFRAME_ORIGIN || '*');
  res.setHeader('access-control-allow-credentials', 'true');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type,x-user-id,x-user-role,x-user-email,authorization');

  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });

  const url = new URL(req.url || '/api', 'https://nexus-knowledge-base-module.vercel.app');
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const segments = path.split('/').filter(Boolean);
  const user = currentUser(req.headers || {});

  try {
    if (req.method === 'GET' && segments[0] === 'articles' && segments[1]) {
      return send(res, 200, await knowledge.getArticle(segments[1]));
    }
    if (req.method === 'GET' && segments[0] === 'articles') {
      return send(res, 200, await knowledge.listArticles());
    }
    if (req.method === 'POST' && segments[0] === 'articles') {
      return send(res, 201, await knowledge.createArticle(await readBody(req), user));
    }
    if (req.method === 'PUT' && segments[0] === 'articles' && segments[1]) {
      return send(res, 200, await knowledge.updateArticle(segments[1], await readBody(req), user));
    }
    if (req.method === 'DELETE' && segments[0] === 'articles' && segments[1]) {
      return send(res, 200, await knowledge.deleteArticle(segments[1], user));
    }
    if (req.method === 'GET' && segments[0] === 'categories') {
      return send(res, 200, await knowledge.listCategories());
    }
    if (req.method === 'POST' && segments[0] === 'categories') {
      return send(res, 201, await knowledge.createCategory(await readBody(req), user));
    }
    if (req.method === 'GET' && segments[0] === 'search') {
      return send(res, 200, await knowledge.search(url.searchParams.get('q') || ''));
    }
    if (req.method === 'POST' && segments[0] === 'favorites') {
      const body = await readBody(req);
      return send(res, 200, await knowledge.favorite(body.articleId, user));
    }
    if (req.method === 'GET' && segments[0] === 'activity') {
      return send(res, 200, await knowledge.activity());
    }
    if (req.method === 'GET' && segments[0] === 'versions') {
      return send(res, 200, await knowledge.articleVersions(url.searchParams.get('articleId') || undefined));
    }
    if (req.method === 'POST' && segments[0] === 'restore-version') {
      const body = await readBody(req);
      return send(res, 200, await knowledge.restoreVersion(body.articleId, body.versionId, user));
    }
    if (req.method === 'GET' && segments[0] === 'tags') {
      return send(res, 200, await knowledge.tags());
    }

    return send(res, 404, { message: 'Knowledge Base endpoint not found' });
  } catch (error) {
    return send(res, 500, {
      message: 'Knowledge Base API error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
