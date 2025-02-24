const users = [
    {
        path: '/users',
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
    // {
    //     path: '/users/:id',
    //     name: 'users-detail',
    //     component: () => import('@/views/users/UsersDetailView.vue'),
    //     meta: { requiresAuth: true },
    // },
    // {
    //     path: '/users/:id/edit',
    //     name: 'users-edit',
    //     component: () => import('@/views/users/UsersEditView.vue'),
    //     meta: { requiresAuth: true },
    // },

]
export default users