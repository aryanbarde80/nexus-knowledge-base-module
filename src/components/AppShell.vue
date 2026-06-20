<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useDark, useToggle } from '@vueuse/core';
import { BookOpen, Bot, Clock3, FileText, FolderTree, History, LayoutDashboard, Moon, Search, Settings, Sparkles, Star, Sun, Tags } from 'lucide-vue-next';
import { useKnowledgeStore } from '../stores/knowledge';

const route = useRoute();
const store = useKnowledgeStore();
const isDark = useDark();
const toggleDark = useToggle(isDark);

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Articles', path: '/articles', icon: FileText },
  { label: 'Categories', path: '/articles?panel=categories', icon: FolderTree },
  { label: 'Tags', path: '/articles?panel=tags', icon: Tags },
  { label: 'Search', path: '/articles?focus=search', icon: Search },
  { label: 'Recent Updates', path: '/articles?panel=activity', icon: Clock3 },
  { label: 'Favorites', path: '/articles?filter=favorites', icon: Star },
  { label: 'Drafts', path: '/articles?status=Draft', icon: BookOpen },
  { label: 'Version History', path: '/articles?panel=versions', icon: History },
  { label: 'AI Assistant', path: '/articles?panel=ai', icon: Bot },
  { label: 'Settings', path: '/settings', icon: Settings }
];

const activePath = computed(() => route.path);
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white/95 px-4 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:block">
      <div class="flex items-center gap-3 px-2">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-600 text-white">
          <Sparkles class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-bold">Nexus ERP</p>
          <p class="text-xs text-slate-500">Knowledge Base</p>
        </div>
      </div>

      <nav class="mt-8 space-y-1">
        <RouterLink v-for="item in navigation" :key="item.label" :to="item.path" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900" :class="{ 'bg-nexus-50 text-nexus-700 dark:bg-nexus-950 dark:text-nexus-100': activePath === item.path.split('?')[0] && item.label !== 'Settings' || (item.label === 'Settings' && activePath === '/settings') }">
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="absolute bottom-5 left-4 right-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Knowledge Health</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-2xl font-bold">{{ store.stats.healthScore }}%</span>
          <button class="rounded-md p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800" @click="toggleDark()">
            <Sun v-if="isDark" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </button>
        </div>
        <div class="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div class="h-2 rounded-full bg-nexus-600" :style="{ width: `${store.stats.healthScore}%` }" />
        </div>
      </div>
    </aside>

    <div class="lg:pl-72">
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-nexus-600">Internal Wiki</p>
            <h1 class="text-xl font-bold">Company Knowledge Base</h1>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative flex-1 md:w-96">
              <Search class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input class="input pl-9" placeholder="Search articles, tags, authors..." @input="store.searchDebounced(($event.target as HTMLInputElement).value)" />
            </div>
            <RouterLink to="/articles/new" class="btn-primary">New Article</RouterLink>
          </div>
        </div>
      </header>

      <main class="p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
