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
        // children: [
        //     {
        //         path: '/list',
        //         name: 'calendar-list',
        //         component: () => import('@/views/calendar/index.vue'),
        //     },
        //     {
        //         path: '/create',
        //         name: 'calendar-create',
        //         component: () => import('@/views/calendar/create.vue'),
        //     },
        //     {
        //         path: '/:id',
        //         name: 'calendar-detail',
        //         component: () => import('@/views/calendar/detail.vue'),
        //     },
        // ],
    }

]

export default calendar