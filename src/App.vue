<script setup lang="ts">
import { computed, onMounted, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { version } from "../package.json";
import { DEFAULT_LAYOUT } from "@/constants";
import { useSettings } from "@/composables/useSettings";
import { useSettingsStore } from "@/stores/settingsStore";
import { useI18n } from "vue-i18n";
import EventSidebar from "@/components/layout/EventSidebar.vue";
import LanguageSwitcher from "./components/i18n/LanguageSwitcher.vue";

const settingsStore = useSettingsStore();

const { t } = useI18n(); // Sử dụng i18n để dịch văn bản

onMounted(() => {
  const { initSettings } = useSettings();
  initSettings();

  settingsStore.loadFromLocalStorage();
});

watchEffect(() => {
  settingsStore.saveToLocalStorage();
});

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

  <!-- <div class="flex">
    <EventSidebar />
    <Calendar /> 
  </div>

  <div class="i18n-container">
    <LanguageSwitcher />
    <h2>{{ $t('app.title') }}</h2> 
  </div> -->
</template>

<style>
.i18n-container {
  margin-top: 20px;
  padding: 10px;
  border-top: 1px solid #ccc;
  text-align: center;
}

button {
  margin: 10px;
  padding: 10px 15px;
  background-color: #0171f8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #005bb5;
}
</style>
