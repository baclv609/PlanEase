const users = [
    {
        path: '/dashboard/users',
        name: 'users',
        component: () => import('@/views/users/Users.vue'),
        meta: {
            // requiresAuth: true,
            layout: 'dashboard',
        }
    },
    // {
    //     path: '/users/create',
    //     name: 'users-create',
    //     component: () => import('@/views/users/UsersCreateView.vue'),
    //     meta: { requiresAuth: true },
    // },
    {
        path: '/dashboard/users/:id/detail',
        name: 'users-detail',
        component: () => import('@/views/users/UserDetailView.vue'),
        meta: {
            //  requiresAuth: true,
            layout: 'dashboard',

        },
    },

    {
        path: '/dashboard/users/ban',
        name: 'banned-users',
        component: () => import('@/views/users/BannedUsersView.vue'),
        meta: {
            layout: 'dashboard',
        }
    },

]
export default users