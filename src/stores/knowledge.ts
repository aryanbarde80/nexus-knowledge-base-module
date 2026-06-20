import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { activities as seedActivities, articles as seedArticles, categories as seedCategories, tags as seedTags, users, versions as seedVersions, type Article, type ArticleStatus } from '../data/mock';

const apiBase = import.meta.env.VITE_API_BASE || '/api';

export const useKnowledgeStore = defineStore('knowledge', () => {
  const articles = ref<Article[]>(seedArticles);
  const categories = ref(seedCategories);
  const tags = ref(seedTags);
  const activities = ref(seedActivities);
  const versions = ref(seedVersions);
  const query = ref('');
  const selectedCategory = ref<string>('all');
  const selectedStatus = ref<ArticleStatus | 'All'>('All');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const recentSearches = ref<string[]>(['purchase order', 'leave policy', 'onboarding']);

  const stats = computed(() => ({
    totalArticles: articles.value.length,
    totalCategories: categories.value.length,
    totalTags: tags.value.length,
    draftArticles: articles.value.filter((article) => article.status === 'Draft').length,
    healthScore: 91
  }));

  const filteredArticles = computed(() => {
    const needle = query.value.trim().toLowerCase();
    return articles.value.filter((article) => {
      const matchesQuery = !needle || [article.title, article.content, article.tags.join(' '), authorName(article.authorId), categoryName(article.categoryId)].join(' ').toLowerCase().includes(needle);
      const matchesCategory = selectedCategory.value === 'all' || article.categoryId === selectedCategory.value;
      const matchesStatus = selectedStatus.value === 'All' || article.status === selectedStatus.value;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  });

  const favorites = computed(() => articles.value.filter((article) => article.favorite));
  const mostViewed = computed(() => [...articles.value].sort((a, b) => b.views - a.views).slice(0, 5));
  const recentArticles = computed(() => [...articles.value].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 6));

  function categoryName(id: string) {
    return categories.value.find((category) => category.id === id)?.name || 'Uncategorized';
  }

  function authorName(id: string) {
    return users.find((user) => user.id === id)?.name || 'Unknown';
  }

  function authorAvatar(id: string) {
    return users.find((user) => user.id === id)?.avatar || 'NX';
  }

  function toggleFavorite(articleId: string) {
    const article = articles.value.find((item) => item.id === articleId);
    if (article) article.favorite = !article.favorite;
  }

  function duplicateArticle(articleId: string) {
    const source = articles.value.find((item) => item.id === articleId);
    if (!source) return;
    const copy = {
      ...source,
      id: crypto.randomUUID(),
      title: `${source.title} Copy`,
      slug: `${source.slug}-copy`,
      status: 'Draft' as ArticleStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      favorite: false
    };
    articles.value.unshift(copy);
  }

  function saveArticle(payload: Partial<Article>) {
    const now = new Date().toISOString();
    if (payload.id) {
      const index = articles.value.findIndex((article) => article.id === payload.id);
      if (index >= 0) {
        const previous = articles.value[index];
        versions.value.unshift({
          id: crypto.randomUUID(),
          articleId: previous.id,
          version: versions.value.filter((version) => version.articleId === previous.id).length + 1,
          authorId: 'u1',
          timestamp: now,
          summary: 'Saved document changes.'
        });
        articles.value[index] = { ...previous, ...payload, updatedAt: now };
      }
      return payload.id;
    }

    const article: Article = {
      id: crypto.randomUUID(),
      title: payload.title || 'Untitled Document',
      slug: (payload.title || 'untitled-document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: payload.content || '<h1>Untitled Document</h1><p>Start writing...</p>',
      categoryId: payload.categoryId || 'sops',
      tags: payload.tags || ['SOP'],
      authorId: 'u1',
      status: payload.status || 'Draft',
      visibility: payload.visibility || 'Company',
      createdAt: now,
      updatedAt: now,
      views: 0,
      favorite: false
    };
    articles.value.unshift(article);
    return article.id;
  }

  function archiveArticle(articleId: string) {
    saveArticle({ id: articleId, status: 'Archived' });
  }

  function publishArticle(articleId: string) {
    saveArticle({ id: articleId, status: 'Published' });
  }

  const searchDebounced = useDebounceFn((value: string) => {
    query.value = value;
    if (value.trim() && !recentSearches.value.includes(value.trim())) {
      recentSearches.value.unshift(value.trim());
      recentSearches.value = recentSearches.value.slice(0, 6);
    }
  }, 250);

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${apiBase}/articles`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.articles)) articles.value = data.articles;
      }
    } catch {
      error.value = 'Using local demo data until API environment variables are configured.';
    } finally {
      loading.value = false;
    }
  }

  function askAi(question: string) {
    const words = question.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = articles.value
      .map((article) => ({
        article,
        score: words.reduce((score, word) => score + (article.title.toLowerCase().includes(word) || article.content.toLowerCase().includes(word) ? 1 : 0), 0)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    return {
      answer: matches.length
        ? `I found ${matches.length} relevant knowledge reference${matches.length > 1 ? 's' : ''}. Start with "${matches[0].article.title}" and review the linked procedure before acting.`
        : 'I could not find a strong match yet. Try asking about onboarding, leave approval, purchase orders, or incidents.',
      references: matches.map((item) => item.article)
    };
  }

  return {
    articles,
    categories,
    tags,
    activities,
    versions,
    query,
    selectedCategory,
    selectedStatus,
    loading,
    error,
    recentSearches,
    stats,
    filteredArticles,
    favorites,
    mostViewed,
    recentArticles,
    categoryName,
    authorName,
    authorAvatar,
    toggleFavorite,
    duplicateArticle,
    archiveArticle,
    publishArticle,
    saveArticle,
    searchDebounced,
    refresh,
    askAi
  };
});
