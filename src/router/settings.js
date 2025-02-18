const settingsRouter = [
    {
        path: "/settings",
        name: "settings",
        component: () => import("@/views/settings/SettingsView.vue"),
        meta: {
            layout: 'setting',
            notAuthRequired: true,
        },
    },
    // {
    //     path: "/settings/profile",
    //     name: "profile-settings",
    //     component: () => import("@/views/settings/ProfileSettings.vue"),
    //     meta: { requiresAuth: true },
    // },
    // {
    //     path: "/settings/notifications",
    //     name: "notification-settings",
    //     component: () => import("@/views/settings/NotificationSettings.vue"),
    //     meta: { requiresAuth: true },
    // }
];

export default settingsRouter;
