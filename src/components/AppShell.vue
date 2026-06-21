<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Bell, BookOpen, Bot, Clock3, FileText, FolderTree, History, LayoutDashboard, Search, Settings, Sparkles, Star, Tags } from 'lucide-vue-next';
import { useKnowledgeStore } from '../stores/knowledge';

const route = useRoute();
const store = useKnowledgeStore();

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'AI Assistant', path: '/articles?panel=ai', icon: Bot },
  { label: 'Articles', path: '/articles', icon: FileText },
  { label: 'Categories', path: '/articles?panel=categories', icon: FolderTree },
  { label: 'Tags', path: '/articles?panel=tags', icon: Tags },
  { label: 'Search', path: '/articles?focus=search', icon: Search },
  { label: 'Recent updates', path: '/articles?panel=activity', icon: Clock3 },
  { label: 'Favorites', path: '/articles?filter=favorites', icon: Star },
  { label: 'Drafts', path: '/articles?status=Draft', icon: BookOpen },
  { label: 'Version history', path: '/articles?panel=versions', icon: History },
  { label: 'Settings', path: '/settings', icon: Settings }
];

const activePath = computed(() => route.path);
</script>

<template>
  <div class="min-h-screen bg-[#f8fbff] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-slate-200 bg-[#f6f8fb] px-4 py-6 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div class="flex items-center gap-3 px-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#008bcf] text-white shadow-sm">
          <Sparkles class="h-4 w-4" />
        </div>
        <div>
          <p class="text-xl font-bold leading-5">Nexus</p>
          <p class="text-xs uppercase tracking-[0.32em] text-slate-500">ERP</p>
        </div>
      </div>

      <nav class="mt-7 max-h-[calc(100vh-128px)] space-y-1 overflow-y-auto pr-1">
        <RouterLink
          v-for="item in navigation"
          :key="item.label"
          :to="item.path"
          class="flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          :class="{ 'bg-[#dfeafa] text-[#073b76] shadow-sm dark:bg-nexus-950 dark:text-nexus-100': (activePath === item.path.split('?')[0] && item.label !== 'Settings') || (item.label === 'Settings' && activePath === '/settings') }"
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <div class="lg:pl-[280px]">
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="relative w-full max-w-[400px]">
            <Search class="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
            <input class="input h-11 pl-10 pr-16" placeholder="Search or jump to..." @input="store.searchDebounced(($event.target as HTMLInputElement).value)" />
            <span class="pointer-events-none absolute right-3 top-2.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">Ctrl K</span>
          </div>
          <div class="flex items-center gap-4">
            <button class="relative rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">
              <Bell class="h-5 w-5" />
              <span class="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">25</span>
            </button>
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9eaff] text-sm font-bold text-[#2f73d8]">V</div>
          </div>
        </div>
      </header>

      <main class="p-5 sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
