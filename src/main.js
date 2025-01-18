import { createApp } from 'vue';
import App from './App.vue';
import { registerGlobalComponent } from '@/utils';
import Antd, { message } from 'ant-design-vue';

import 'ant-design-vue/dist/reset.css';
import '@/assets/css/main.css';

import router from '@/router';

const app = createApp(App);
registerGlobalComponent(app);

app.use(Antd);
app.use(router);
app.config.globalProperties.$message = message;
app.mount('#app');
