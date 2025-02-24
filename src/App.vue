<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { version } from '../package.json';
import { DEFAULT_LAYOUT } from '@/constants';
import { useSettings } from "@/composables/useSettings";

onMounted(() => {
  const { initSettings } = useSettings(); 
  initSettings(); // ✅ Gọi hàm khởi tạo settings
});

const route = useRoute();
const layout = computed(() => `${route?.meta?.layout || DEFAULT_LAYOUT}-layout`);
localStorage.setItem('VERSION_APP', version);
const theme = {
  token: {
    borderRadius: 6,
    controlHeight: 38,
    colorPrimary: '#0171f8',
  },
};
</script>

<template>
  <AConfigProvider :theme="theme">
    <Suspense>
      <component :is="layout">
        <router-view />
      </component>
    </Suspense>
  </AConfigProvider>
</template>
