import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

// Lấy ngôn ngữ mặc định từ localStorage hoặc mặc định là 'en'
const userLang = localStorage.getItem('user-language') || 'en';

const i18n = createI18n({
  legacy: false, // Sử dụng API hiện đại
  locale: userLang,
  fallbackLocale: 'en', // Ngôn ngữ dự phòng
  messages: {
    en,
    vi,
  },
});

// Hàm đổi ngôn ngữ và lưu vào localStorage
export const setLanguage = (lang) => {
  if (i18n.global.availableLocales.includes(lang)) {
    i18n.global.locale.value = lang;
    localStorage.setItem('user-language', lang);
  } else {
    console.warn(`Ngôn ngữ "${lang}" không được hỗ trợ.`);
  }
};

export default i18n;