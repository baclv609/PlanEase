<script setup lang="ts">
import { computed, onMounted, watchEffect, watch } from "vue";
import { useRoute } from "vue-router";
import { version } from "../package.json";
import { DEFAULT_LAYOUT } from "@/constants";
import { useSettings } from "@/composables/useSettings";
import { useSettingsStore } from "@/stores/settingsStore";
import syncService from '@/services/syncService';
import googleCalendarService from '@/services/googleCalendarService';

const settingsStore = useSettingsStore();

onMounted(async () => {
  const { initSettings } = useSettings(); 
  initSettings(); // Gọi hàm khởi tạo settings

  settingsStore.loadFromLocalStorage();

  // Initialize Google Calendar sync
  await settingsStore.loadGoogleCalendarSettings();
  if (settingsStore.googleCalendar.autoSync) {
    syncService.startAutoSync();
  }
});

// Watch tự động cập nhật localStorage khi store thay đổi
watchEffect(() => {
  settingsStore.saveToLocalStorage();
});

// Watch for changes in auto sync setting
watch(
  () => settingsStore.googleCalendar.autoSync,
  (newValue) => {
    if (newValue) {
      syncService.startAutoSync();
    } else {
      syncService.stopAutoSync();
    }
  }
);

// Watch for changes in Google token
watch(
  () => localStorage.getItem('google_token'),
  (newToken) => {
    if (newToken) {
      // Khi có token mới, khởi tạo lại Google Calendar service
      googleCalendarService.initializeGoogleApi().then(() => {
        googleCalendarService.setToken(newToken);
      });
    } else {
      // Khi token bị xóa (đăng xuất), dừng đồng bộ và xóa token
      syncService.stopAutoSync();
      if (googleCalendarService.isInitialized) {
        googleCalendarService.clearToken();
      }
    }
  }
);

const route = useRoute();
const layout = computed(() => `${route?.meta?.layout || DEFAULT_LAYOUT}-layout`);
localStorage.setItem("VERSION_APP", version);

const theme = {
  token: {
    borderRadius: 6,
    controlHeight: 38,
    colorPrimary: "#0171f8",
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
