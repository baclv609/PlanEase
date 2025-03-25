const roles = [
    {
        path: '/roles',
        name: 'roles',
        component: () => import('@/views/roles/Roles.vue'),
        meta: {
            layout: 'dashboard',
        }
    },

    {
        path: '/roles/:id',
        name: 'role-detail',
        component: () => import('@/views/roles/RoleDetailView.vue'),
        meta: {
            layout: 'dashboard',
        }
    },

    {
        path: '/roles/create',
        name: 'role-create',
        component: () => import('@/views/roles/CreateRoleView.vue'),
        meta: {
            layout: 'dashboard',
        }
    },

    {
        path: '/roles/trashed',
        name: 'role-trashed',
        component: () => import('@/views/roles/TrashedRoleView.vue'),
        meta: {
            layout: 'dashboard',
        }
    }
]

export default roles