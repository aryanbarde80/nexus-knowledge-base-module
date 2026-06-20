<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import { AlignLeft, Archive, Bold, Code2, Heading1, Heading2, ImageIcon, Italic, Link2, List, ListChecks, Quote, Save, Send, Table2 } from 'lucide-vue-next';
import { useKnowledgeStore } from '../stores/knowledge';

const route = useRoute();
const router = useRouter();
const store = useKnowledgeStore();
const existing = computed(() => store.articles.find((article) => article.id === route.params.id));

const title = ref(existing.value?.title || 'Untitled Document');
const categoryId = ref(existing.value?.categoryId || 'sops');
const status = ref(existing.value?.status || 'Draft');
const visibility = ref(existing.value?.visibility || 'Company');
const tags = ref((existing.value?.tags || ['SOP']).join(', '));

const templates = [
  { name: 'SOP Template', content: '<h1>SOP Title</h1><h2>Purpose</h2><p>Describe the operational goal.</p><h2>Steps</h2><ol><li>Owner confirms request.</li><li>Team completes task.</li><li>Manager verifies outcome.</li></ol>' },
  { name: 'Onboarding Template', content: '<h1>Onboarding Plan</h1><p>Role, first week checklist, systems, manager handoff, and success criteria.</p>' },
  { name: 'Meeting Notes', content: '<h1>Meeting Notes</h1><h2>Agenda</h2><ul><li>Topic</li></ul><h2>Decisions</h2><p></p><h2>Action Items</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false">Owner and due date</li></ul>' },
  { name: 'Incident Report', content: '<h1>Incident Report</h1><h2>Impact</h2><p></p><h2>Timeline</h2><p></p><h2>Root Cause</h2><p></p><h2>Preventive Actions</h2><p></p>' },
  { name: 'Technical Documentation', content: '<h1>Technical Documentation</h1><h2>Overview</h2><p></p><h2>Architecture</h2><pre><code>// paste sample code</code></pre>' },
  { name: 'HR Policy', content: '<h1>HR Policy</h1><h2>Policy Statement</h2><p></p><h2>Eligibility</h2><p></p><h2>Approval Workflow</h2><p></p>' }
];

const editor = useEditor({
  content: existing.value?.content || templates[0].content,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Image,
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Youtube,
    Placeholder.configure({ placeholder: 'Write the company knowledge here...' })
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-slate max-w-none dark:prose-invert'
    }
  }
});

watch(existing, (article) => {
  if (!article || !editor.value) return;
  title.value = article.title;
  categoryId.value = article.categoryId;
  status.value = article.status;
  visibility.value = article.visibility;
  tags.value = article.tags.join(', ');
  editor.value.commands.setContent(article.content);
});

function applyTemplate(content: string) {
  editor.value?.commands.setContent(content);
}

function addLink() {
  const href = window.prompt('URL');
  if (href) editor.value?.chain().focus().setLink({ href }).run();
}

function addImage() {
  const src = window.prompt('Image URL');
  if (src) editor.value?.chain().focus().setImage({ src }).run();
}

async function save(nextStatus = status.value) {
  const id = await store.saveArticle({
    id: existing.value?.id,
    title: title.value,
    categoryId: categoryId.value,
    status: nextStatus,
    visibility: visibility.value,
    tags: tags.value.split(',').map((tag) => tag.trim()).filter(Boolean),
    content: editor.value?.getHTML() || ''
  });
  if (id) router.push(`/articles/${id}`);
}

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[1fr_320px]">
    <section class="card overflow-hidden">
      <div class="border-b border-slate-200 p-4 dark:border-slate-800">
        <input v-model="title" class="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-slate-400" placeholder="Article title" />
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button class="btn-secondary" @click="editor?.chain().focus().toggleBold().run()"><Bold class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().toggleItalic().run()"><Italic class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"><Heading1 class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"><Heading2 class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().toggleBulletList().run()"><List class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().toggleTaskList().run()"><ListChecks class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().toggleBlockquote().run()"><Quote class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().toggleCodeBlock().run()"><Code2 class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"><Table2 class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="editor?.chain().focus().setHorizontalRule().run()"><AlignLeft class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="addLink"><Link2 class="h-4 w-4" /></button>
          <button class="btn-secondary" @click="addImage"><ImageIcon class="h-4 w-4" /></button>
        </div>
      </div>
      <EditorContent :editor="editor" />
    </section>

    <aside class="space-y-4">
      <div class="card p-4">
        <h2 class="font-semibold">Publish Controls</h2>
        <div class="mt-4 space-y-3">
          <label class="block text-sm">
            <span class="text-slate-500">Category</span>
            <select v-model="categoryId" class="input mt-1">
              <option v-for="category in store.categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </label>
          <label class="block text-sm">
            <span class="text-slate-500">Status</span>
            <select v-model="status" class="input mt-1">
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
          </label>
          <label class="block text-sm">
            <span class="text-slate-500">Visibility</span>
            <select v-model="visibility" class="input mt-1">
              <option>Company</option>
              <option>Managers</option>
              <option>Private</option>
            </select>
          </label>
          <label class="block text-sm">
            <span class="text-slate-500">Tags</span>
            <input v-model="tags" class="input mt-1" />
          </label>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <button class="btn-secondary" @click="save('Draft')"><Save class="h-4 w-4" />Save</button>
          <button class="btn-primary" @click="save('Published')"><Send class="h-4 w-4" />Publish</button>
        </div>
        <button v-if="existing" class="btn-secondary mt-2 w-full" @click="store.archiveArticle(existing.id)"><Archive class="h-4 w-4" />Archive</button>
      </div>

      <div class="card p-4">
        <h2 class="font-semibold">Article Templates</h2>
        <div class="mt-3 grid gap-2">
          <button v-for="template in templates" :key="template.name" class="rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800" @click="applyTemplate(template.content)">
            {{ template.name }}
          </button>
        </div>
      </div>

      <div class="card p-4">
        <h2 class="font-semibold">Version History</h2>
        <div class="mt-3 space-y-2">
          <div v-for="version in store.versions.filter((item) => item.articleId === existing?.id)" :key="version.id" class="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <p class="font-semibold">Version {{ version.version }}</p>
            <p class="text-xs text-slate-500">{{ version.summary }}</p>
            <button class="mt-2 text-xs font-semibold text-nexus-600">Restore previous version</button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
