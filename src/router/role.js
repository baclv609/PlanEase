const roles = [
    {
        path: '/dashboard/roles',
        name: 'roles',
        component: () => import('@/views/roles/Roles.vue'),
        meta: {
            layout: 'dashboard',
        }
    },

    {
        path: '/dashboard/roles/:id/detail',
        name: 'role-detail',
        component: () => import('@/views/roles/RoleDetailView.vue'),
        meta: {
            layout: 'dashboard',
        }
    },

    {
        path: '/dashboard/roles/create',
        name: 'role-create',
        component: () => import('@/views/roles/CreateRoleView.vue'),
        meta: {
            layout: 'dashboard',
        }
    },

    {
        path: '/dashboard/roles/trashed',
        name: 'role-trashed',
        component: () => import('@/views/roles/TrashedRoleView.vue'),
        meta: {
            layout: 'dashboard',
        }
    },

    {
        path: '/dashboard/roles/:id/edit',
        name: 'role-update',
        component: () => import('@/views/roles/UpdateRoleView.vue'),
        meta: {
            layout: 'dashboard',
        }
    }
]

export default roles