const calendar = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/home/landingpage/index.vue'),
        meta: {
            layout: 'public',
            notAuthRequired: false,
        },
    },
    {
        path: '/calendar',
        name: 'calendar',
        meta: { requiresAuth: true },
        component: () => import('@/views/calendar/index.vue'),
        meta: {
            layout: 'default',
            notAuthRequired: false,
        },
    }

]

export default calendar