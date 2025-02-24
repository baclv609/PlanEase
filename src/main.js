import { createApp } from 'vue';
import App from './App.vue';
import { registerGlobalComponent } from '@/utils';
import Antd, { message } from 'ant-design-vue';

import 'ant-design-vue/dist/reset.css';
import '@/assets/css/main.css';
import router from '@/router';
import '@/assets/css/main.css';
import { antdv } from "./plugins";
import i18n from "./plugins/i18n";
import axios from "axios";
import { createPinia } from 'pinia';

import { useSettings } from './composables/useSettings';

const pinia = createPinia();

const app = createApp(App);
registerGlobalComponent(app);

// app.use(SchedulePlugin);
app.use(i18n);
app.use(pinia);
app.use(Antd);
app.use(router);
app.config.globalProperties.$message = message;
app.config.globalProperties.$axios = axios;

// Gọi useSettings() sau khi Pinia đã được đăng ký
useSettings();

app.mount('#app');
