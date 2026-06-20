<script setup lang="ts">
import { onMounted } from 'vue';
import AppShell from './components/AppShell.vue';
import { useKnowledgeStore } from './stores/knowledge';

const store = useKnowledgeStore();
onMounted(() => store.refresh());
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
