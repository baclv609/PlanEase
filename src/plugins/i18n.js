import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

// Lấy ngôn ngữ từ localStorage hoặc mặc định là 'en'
const userLang = JSON.parse(localStorage.getItem("userSettings")).language || "en";

const i18n = createI18n({
    legacy: false,
    locale: userLang, // Ngôn ngữ mặc định
    fallbackLocale: "en",
    messages: {
        en,
        vi
    }
});

export default i18n;
