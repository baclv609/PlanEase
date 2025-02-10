import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

const i18n = createI18n({
    locale: import.meta.env.VITE_DEFAULT_LANGUAGE || "vi",
    fallbackLocale: "en",
    messages: {
        en,
        vi,
    },
});

export default i18n;

{/* <template>
  <div>
    <h1>{{ $t("welcome") }}</h1>
    <button @click="changeLanguage('en')">English</button>
    <button @click="changeLanguage('vi')">Tiếng Việt</button>
  </div>
</template>

<script>
export default {
  methods: {
    changeLanguage(lang) {
      this.$i18n.locale = lang;
    },
  },
};
</script> */}
