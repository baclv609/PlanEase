import { createApp } from 'vue';
import App from './App.vue';
import { registerGlobalComponent } from '@/utils';
import Antd, { message } from 'ant-design-vue';

// Editor
import PrimeVue from 'primevue/config';
import Editor from 'primevue/editor';

import 'ant-design-vue/dist/reset.css';
import '@/assets/css/main.css';
import router from '@/router';
import '@/assets/css/main.css';
import { antdv } from "./plugins";
import i18n from "./plugins/i18n";
import axios from "axios";
import { createPinia } from 'pinia';

import { useSettings } from './composables/useSettings';
// import Echo from "@/plugins/echo";
import { useEchoStore } from "@/stores/echoStore";

// theme Editor
import Aura from '@primeuix/themes/aura';
import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';


const pinia = createPinia();

const app = createApp(App);
registerGlobalComponent(app);


document.title = import.meta.env.VITE_APP_TITLE || "Notibro";

const favicon = document.getElementById("favicon");
if (favicon) {
  favicon.href = import.meta.env.VITE_APP_FAVICON || "/vite.svg";
}

// app.use(SchedulePlugin);
app.use(i18n);
app.use(pinia);
app.use(Antd);
app.use(router);
app.use(PrimeVue,{
  theme: {
      preset: Aura
  }
});
app.config.globalProperties.$message = message;
app.config.globalProperties.$axios = axios;

const echoStore = useEchoStore();
if (localStorage.getItem("access_token")) {
    echoStore.initEcho();
    echoStore.startListening();
}
// Gọi useSettings() sau khi Pinia đã được đăng ký
useSettings();

app.use(HighchartsVue);

app.mount('#app');
