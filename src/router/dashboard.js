const dashboard = [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: {
            requiresAuth: true,
            layout: 'dashboard',
            roles: ['admin']
        }
    }
]

export default dashboard;
