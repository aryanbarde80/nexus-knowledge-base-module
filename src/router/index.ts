import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import ArticlesView from '../views/ArticlesView.vue';
import ArticleEditorView from '../views/ArticleEditorView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/articles', name: 'articles', component: ArticlesView },
  { path: '/articles/new', name: 'article-new', component: ArticleEditorView },
  { path: '/articles/:id', name: 'article-edit', component: ArticleEditorView },
  { path: '/settings', name: 'settings', component: SettingsView }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
