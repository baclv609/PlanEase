import { defineAsyncComponent } from 'vue';
export function registerGlobalComponent(app) {
    app.component(
        'DefaultLayout',
        defineAsyncComponent(() => import('@/layouts/DefaultLayout.vue')),
    );
    app.component(
        'AuthLayout',
        defineAsyncComponent(() => import('@/layouts/AuthLayout.vue')),
    );

    app.component(
        'PublicLayout',
        defineAsyncComponent(() => import('@/layouts/PublicLayout.vue')),
    );
    app.component(
        'DashboardLayout',
        defineAsyncComponent(() => import('@/layouts/DashboardLayout.vue')),
    );
    app.component(
        'SettingLayout',
        defineAsyncComponent(() => import('@/layouts/SettingLayout.vue')),
    );
}
