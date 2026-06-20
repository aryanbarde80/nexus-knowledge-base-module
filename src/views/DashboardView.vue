<script setup lang="ts">
import { computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { Activity, BarChart3, Bot, FileText, FolderTree, Tags, TrendingUp, Users } from 'lucide-vue-next';
import { useKnowledgeStore } from '../stores/knowledge';

const store = useKnowledgeStore();

const metricCards = computed(() => [
  { label: 'Total Articles', value: store.stats.totalArticles, icon: FileText, tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200' },
  { label: 'Total Categories', value: store.stats.totalCategories, icon: FolderTree, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200' },
  { label: 'Total Tags', value: store.stats.totalTags, icon: Tags, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200' },
  { label: 'Draft Articles', value: store.stats.draftArticles, icon: FileText, tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200' }
]);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const growth = [18, 26, 33, 46, 59, 72];
</script>

<template>
  <div class="space-y-6">
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="metric in metricCards" :key="metric.label" class="card p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">{{ metric.label }}</p>
            <p class="mt-2 text-3xl font-bold">{{ metric.value }}</p>
          </div>
          <div class="rounded-lg p-3" :class="metric.tone">
            <component :is="metric.icon" class="h-5 w-5" />
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div class="card p-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Knowledge Growth Trend</h2>
            <p class="text-sm text-slate-500">Articles created per month across Nexus ERP teams.</p>
          </div>
          <TrendingUp class="h-5 w-5 text-nexus-600" />
        </div>
        <div class="mt-8 flex h-64 items-end gap-4">
          <div v-for="(value, index) in growth" :key="months[index]" class="flex flex-1 flex-col items-center gap-3">
            <div class="w-full rounded-t-md bg-nexus-600/90 transition-all hover:bg-nexus-700" :style="{ height: `${value * 2.4}px` }" />
            <span class="text-xs text-slate-500">{{ months[index] }}</span>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Most Accessed Categories</h2>
          <BarChart3 class="h-5 w-5 text-slate-400" />
        </div>
        <div class="mt-5 space-y-4">
          <div v-for="category in store.categories.filter((item) => !item.parentId).slice(0, 6)" :key="category.id">
            <div class="flex items-center justify-between text-sm">
              <span>{{ category.name }}</span>
              <span class="font-semibold">{{ category.articleCount }}</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div class="h-2 rounded-full" :style="{ width: `${Math.min(category.articleCount * 4, 100)}%`, backgroundColor: category.color }" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-3">
      <div class="card p-5">
        <div class="flex items-center gap-2">
          <Activity class="h-5 w-5 text-nexus-600" />
          <h2 class="text-lg font-semibold">Recent Activity Feed</h2>
        </div>
        <div class="mt-5 space-y-4">
          <div v-for="item in store.activities" :key="item.id" class="flex gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">{{ store.authorAvatar(item.userId) }}</div>
            <div>
              <p class="text-sm"><span class="font-semibold">{{ store.authorName(item.userId) }}</span> {{ item.action }} "{{ item.target }}"</p>
              <p class="text-xs text-slate-500">{{ formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <div class="flex items-center gap-2">
          <Users class="h-5 w-5 text-emerald-600" />
          <h2 class="text-lg font-semibold">Most Active Authors</h2>
        </div>
        <div class="mt-5 space-y-3">
          <div v-for="authorId in ['u1', 'u2', 'u3']" :key="authorId" class="flex items-center justify-between rounded-md border border-slate-100 p-3 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-nexus-50 text-xs font-bold text-nexus-700 dark:bg-nexus-950 dark:text-nexus-100">{{ store.authorAvatar(authorId) }}</div>
              <span class="text-sm font-medium">{{ store.authorName(authorId) }}</span>
            </div>
            <span class="text-sm text-slate-500">{{ store.articles.filter((article) => article.authorId === authorId).length }} docs</span>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <div class="flex items-center gap-2">
          <Bot class="h-5 w-5 text-violet-600" />
          <h2 class="text-lg font-semibold">AI Suggested Articles</h2>
        </div>
        <div class="mt-5 space-y-3">
          <div v-for="article in store.mostViewed.slice(0, 4)" :key="article.id" class="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
            <p class="text-sm font-semibold">{{ article.title }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ article.views.toLocaleString() }} views · {{ store.categoryName(article.categoryId) }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
