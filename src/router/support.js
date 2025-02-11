const support = [
    {
        path: "/support",
        name: "support",
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { requiresAuth: true },
    },
    // {
    //     path: "/contact",
    //     name: "contact",
    //     component: () => import("@/views/support/ContactView.vue"),
    //     meta: { requiresAuth: true },
    // }
];
export default support;
