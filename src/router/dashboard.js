const dashboard = [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        children: [
            {
                path: 'schedule',
                component: () => () => import('@/views/auth/LoginView.vue'),
                // a meta field
                meta: {
                    layout: 'auth',
                    notAuthRequired: false,
                },
            }
        ]
    },
    // {
    //     path: '/schedule',
    //     name: 'schedule',
    //     component: () => import('@/views/testClender/ScheduleComponent.vue'),
    // }
]

export default dashboard