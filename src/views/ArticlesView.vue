<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Archive, Bot, Copy, FilePlus2, FolderTree, History, MoreHorizontal, Search, Star, UploadCloud } from 'lucide-vue-next';
import { formatDistanceToNow } from 'date-fns';
import { useKnowledgeStore } from '../stores/knowledge';

const store = useKnowledgeStore();
const aiQuestion = ref('');
const aiResponse = ref<{ answer: string; references: typeof store.articles } | null>(null);

const rootCategories = computed(() => store.categories.filter((category) => !category.parentId));

function ask() {
  aiResponse.value = store.askAi(aiQuestion.value);
}
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[260px_1fr_340px]">
    <aside class="space-y-4">
      <div class="card p-4">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Categories</h2>
          <FolderTree class="h-4 w-4 text-slate-400" />
        </div>
        <div class="mt-4 space-y-1">
          <button class="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" :class="{ 'bg-nexus-50 text-nexus-700 dark:bg-nexus-950 dark:text-nexus-100': store.selectedCategory === 'all' }" @click="store.selectedCategory = 'all'">
            All Articles <span>{{ store.articles.length }}</span>
          </button>
          <div v-for="category in rootCategories" :key="category.id">
            <button class="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" :class="{ 'bg-nexus-50 text-nexus-700 dark:bg-nexus-950 dark:text-nexus-100': store.selectedCategory === category.id }" @click="store.selectedCategory = category.id">
              <span class="flex items-center gap-2"><span class="h-2 w-2 rounded-full" :style="{ backgroundColor: category.color }" />{{ category.name }}</span>
              <span>{{ category.articleCount }}</span>
            </button>
            <div class="ml-4 border-l border-slate-200 pl-2 dark:border-slate-800">
              <button v-for="child in store.categories.filter((item) => item.parentId === category.id)" :key="child.id" class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" @click="store.selectedCategory = child.id">
                {{ child.name }} <span>{{ child.articleCount }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <h2 class="font-semibold">Quick Access</h2>
        <div class="mt-3 space-y-2">
          <RouterLink v-for="article in store.favorites" :key="article.id" :to="`/articles/${article.id}`" class="block rounded-md bg-slate-50 p-2 text-sm hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
            {{ article.title }}
          </RouterLink>
        </div>
      </div>
    </aside>

    <section class="space-y-4">
      <div class="soft-card p-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="relative flex-1">
            <Search class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input class="input pl-9" placeholder="Instant search title, content, tags, category, author..." @input="store.searchDebounced(($event.target as HTMLInputElement).value)" />
          </div>
          <div class="flex gap-2">
            <select v-model="store.selectedStatus" class="input md:w-40">
              <option>All</option>
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
            <RouterLink to="/articles/new" class="btn-primary"><FilePlus2 class="h-4 w-4" />Create</RouterLink>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button v-for="search in store.recentSearches" :key="search" class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300" @click="store.query = search">{{ search }}</button>
        </div>
      </div>

      <div v-if="store.loading" class="space-y-3">
        <div v-for="item in 4" :key="item" class="skeleton h-28" />
      </div>

      <div v-else-if="!store.filteredArticles.length" class="card flex min-h-80 flex-col items-center justify-center p-8 text-center">
        <FilePlus2 class="h-10 w-10 text-slate-400" />
        <h2 class="mt-3 text-lg font-semibold">No documents found</h2>
        <p class="mt-1 text-sm text-slate-500">Create a new article or clear your filters.</p>
        <RouterLink to="/articles/new" class="btn-primary mt-4">Create Article</RouterLink>
      </div>

      <article v-for="article in store.filteredArticles" v-else :key="article.id" class="card p-5 transition hover:border-nexus-200 hover:shadow-enterprise dark:hover:border-nexus-900">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-md px-2 py-1 text-xs font-semibold" :class="{ 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200': article.status === 'Published', 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200': article.status === 'Draft', 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300': article.status === 'Archived' }">{{ article.status }}</span>
              <span class="text-xs text-slate-500">{{ store.categoryName(article.categoryId) }}</span>
              <span class="text-xs text-slate-500">{{ article.visibility }}</span>
            </div>
            <RouterLink :to="`/articles/${article.id}`" class="mt-2 block text-xl font-bold hover:text-nexus-600">{{ article.title }}</RouterLink>
            <p class="mt-2 line-clamp-2 text-sm text-slate-500" v-html="article.content.replace(/<[^>]*>/g, ' ').slice(0, 180)" />
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span v-for="tag in article.tags" :key="tag" class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{{ tag }}</span>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button class="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" @click="store.toggleFavorite(article.id)"><Star class="h-4 w-4" :class="{ 'fill-amber-400 text-amber-400': article.favorite }" /></button>
            <button class="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" @click="store.duplicateArticle(article.id)"><Copy class="h-4 w-4" /></button>
            <button class="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" @click="store.archiveArticle(article.id)"><Archive class="h-4 w-4" /></button>
            <button class="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><MoreHorizontal class="h-4 w-4" /></button>
          </div>
        </div>
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
          <span>{{ store.authorName(article.authorId) }} · updated {{ formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true }) }}</span>
          <span>{{ article.views.toLocaleString() }} views</span>
        </div>
      </article>
    </section>

    <aside class="space-y-4">
      <div class="card p-4">
        <div class="flex items-center gap-2">
          <Bot class="h-5 w-5 text-violet-600" />
          <h2 class="font-semibold">AI Knowledge Assistant</h2>
        </div>
        <div class="mt-4 space-y-2">
          <button v-for="question in ['How do I create a purchase order?', 'Show onboarding process', 'What is the leave approval workflow?']" :key="question" class="w-full rounded-md bg-slate-50 p-2 text-left text-sm hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700" @click="aiQuestion = question; ask()">{{ question }}</button>
        </div>
        <textarea v-model="aiQuestion" class="input mt-4 min-h-24" placeholder="Ask Nexus AI" />
        <button class="btn-primary mt-3 w-full" @click="ask">Ask Nexus AI</button>
        <div v-if="aiResponse" class="mt-4 rounded-lg bg-violet-50 p-3 text-sm dark:bg-violet-950">
          <p>{{ aiResponse.answer }}</p>
          <div class="mt-3 space-y-2">
            <RouterLink v-for="reference in aiResponse.references" :key="reference.id" :to="`/articles/${reference.id}`" class="block rounded-md bg-white p-2 text-xs font-semibold dark:bg-slate-900">{{ reference.title }}</RouterLink>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <h2 class="font-semibold">Upload Center</h2>
        <div class="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <UploadCloud class="mx-auto h-8 w-8 text-slate-400" />
          <p class="mt-2 text-sm font-medium">PDF, DOCX, images, videos</p>
          <p class="text-xs text-slate-500">Drag and drop files to attach.</p>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center gap-2">
          <History class="h-4 w-4 text-slate-400" />
          <h2 class="font-semibold">Version History</h2>
        </div>
        <div class="mt-4 space-y-3">
          <div v-for="version in store.versions.slice(0, 4)" :key="version.id" class="rounded-md border border-slate-100 p-3 text-sm dark:border-slate-800">
            <p class="font-semibold">Version {{ version.version }}</p>
            <p class="text-xs text-slate-500">Updated by {{ store.authorName(version.authorId) }}</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
