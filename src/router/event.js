const event = [
    {
        path: "/event",
        name: "event-list",
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { requiresAuth: true },
    },
    // {
    //     path: "/event/create",
    //     name: "event-create",
    //     component: () => import("@/views/event/EventCreateView.vue"),
    //     meta: { requiresAuth: true },
    // },
    // {
    //     path: "/event/:id",
    //     name: "event-detail",
    //     component: () => import("@/views/event/EventDetailView.vue"),
    //     meta: { requiresAuth: true },
    // },
    // {
    //     path: "/event/:id/edit",
    //     name: "event-edit",
    //     component: () => import("@/views/event/EventEditView.vue"),
    //     meta: { requiresAuth: true },
    // }
];
export default event;