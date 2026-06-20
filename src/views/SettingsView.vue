<script setup lang="ts">
import { Bell, Database, LockKeyhole, Moon, ShieldCheck } from 'lucide-vue-next';
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-2">
    <section class="card p-5">
      <div class="flex items-center gap-2">
        <ShieldCheck class="h-5 w-5 text-nexus-600" />
        <h2 class="text-lg font-semibold">Article Permissions</h2>
      </div>
      <div class="mt-5 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left dark:bg-slate-800">
            <tr><th class="p-3">Role</th><th class="p-3">Access</th><th class="p-3">Publish</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr><td class="p-3 font-semibold">Admin</td><td class="p-3">Full access</td><td class="p-3">Yes</td></tr>
            <tr><td class="p-3 font-semibold">Manager</td><td class="p-3">Create, edit, publish</td><td class="p-3">Yes</td></tr>
            <tr><td class="p-3 font-semibold">Employee</td><td class="p-3">Read access</td><td class="p-3">No</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card p-5">
      <div class="flex items-center gap-2">
        <Bell class="h-5 w-5 text-amber-600" />
        <h2 class="text-lg font-semibold">Notification Center</h2>
      </div>
      <div class="mt-5 space-y-3">
        <label class="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800">Article updated <input type="checkbox" checked /></label>
        <label class="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800">Mentioned in document <input type="checkbox" checked /></label>
        <label class="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800">New category added <input type="checkbox" checked /></label>
      </div>
    </section>

    <section class="card p-5">
      <div class="flex items-center gap-2">
        <Database class="h-5 w-5 text-emerald-600" />
        <h2 class="text-lg font-semibold">Database Integrations</h2>
      </div>
      <div class="mt-5 grid gap-3">
        <div class="rounded-md border border-slate-200 p-4 dark:border-slate-800">
          <p class="font-semibold">PostgreSQL</p>
          <p class="mt-1 text-sm text-slate-500">Primary relational store for articles, versions, tags, favorites, views, and search history.</p>
        </div>
        <div class="rounded-md border border-slate-200 p-4 dark:border-slate-800">
          <p class="font-semibold">Firebase</p>
          <p class="mt-1 text-sm text-slate-500">Realtime notification fanout, attachment metadata sync, and optional activity stream mirroring.</p>
        </div>
      </div>
    </section>

    <section class="card p-5">
      <div class="flex items-center gap-2">
        <LockKeyhole class="h-5 w-5 text-violet-600" />
        <h2 class="text-lg font-semibold">Iframe & Theme</h2>
      </div>
      <div class="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <p>Designed for direct iframe embedding inside Nexus ERP with no marketing page in front of the module.</p>
        <p class="flex items-center gap-2"><Moon class="h-4 w-4" /> Light and dark mode follow local preference and can be toggled from the sidebar.</p>
      </div>
    </section>
  </div>
</template>
