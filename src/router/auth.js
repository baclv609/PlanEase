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
    // {
    //     path: "/forgot-password",
    //     name: "forgot-password",
    //     component: () => import("@/views/auth/ForgotPassword.vue"),
    //     meta: { layout: "auth", guest: true },
    // },
    // {
    //     path: "/reset-password",
    //     name: "reset-password",
    //     component: () => import("@/views/auth/ResetPassword.vue"),
    //     meta: { layout: "auth", guest: true },
    // }
];
export default auth;