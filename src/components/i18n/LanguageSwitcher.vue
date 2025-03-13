<template>
  <div class="language-switcher">
    <button 
      v-for="lang in languages" 
      :key="lang.code" 
      @click="changeLanguage(lang.code)"
      :class="{ active: lang.code === currentLocale }"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { setLanguage } from "@/plugins/i18n";

const { locale } = useI18n();
const languages = ref([
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
]);

const currentLocale = locale.value;

const changeLanguage = (langCode: string) => {
  setLanguage(langCode); // Gọi hàm setLanguage đã tạo trong i18n.js
};
</script>

<style>
.language-switcher button {
  margin: 5px;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #0171f8;
  color: white;
}

.language-switcher button.active {
  background-color: #005bb5;
  font-weight: bold;
}

.language-switcher button:hover {
  background-color: #00408d;
}
</style>
