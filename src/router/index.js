import {createRouter, createWebHistory} from "vue-router";
import NProgress from "nprogress";

const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: {
            layout: 'auth',
            notAuthRequired: false,
        },
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: {
            layout: 'auth',
            notAuthRequired: false,
        },
    },
    {
        path: '/not-found',
        name: 'not-found',
        component: () => import('@/views/errors/NotFound.vue'),
        meta: {
            layout: 'public',
            notAuthRequired: true,
        },
    },
    {
        path: '/:catchAll(.*)',
        redirect: { name: 'not-found' },
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach(async (to, _, next) => {
    NProgress.start();
    // const isAuthRequired = !to.meta.notAuthRequired;
    // const isAuthenticated = false;

    // if (to.name === 'not-found') {
    //     next();
    //     NProgress.done();
    //     return;
    // }
    //
    // if (isAuthRequired && !isAuthenticated) {
    //     NProgress.done();
    //     return next({ name: 'login' });
    // }

    next();
    NProgress.done();
});

export default router;
