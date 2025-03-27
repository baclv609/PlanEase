const dashboard = [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: {
            requiresAuth: true,
            layout: 'dashboard',
        }
    }
]

export default dashboard;
