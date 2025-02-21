const auth = [
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
        path: '/verify',
        name: 'verify',
        component: () => import('@/views/auth/Verify.vue'),
        meta: {
            layout: 'auth',
            notAuthRequired: false,
        },
    },
    {
        path: "/forgot-password",
        name: "forgot-password",
        component: () => import("@/views/auth/ForgotPassword.vue"),
        meta: { layout: "auth", guest: true },
    },
    {
        path: "/reset-password",
        name: "reset-password",
        component: () => import("@/views/auth/ResetPassword.vue"),
        meta: { layout: "auth", guest: true },
        beforeEnter: (to, from, next) => {
            if (from.name !== 'forgot-password') {
                next({name: 'not-found'});
            } else {
                next();
            }
        }
    },
    {
        path: '/auth/google/callback',
        component: () => import('@/views/auth/GoogleCallback.vue'),
        meta: {
            layout: 'auth',
            notAuthRequired: false,
        },
    },
    {
        path: '/auth/google/error',
        component: () => import('@/views/auth/GoogleCallback.vue'),
        meta: {
            layout: 'auth',
            notAuthRequired: false,
        }, 
    }
];
export default auth;