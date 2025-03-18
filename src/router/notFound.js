const notFound = [
    {
        path: '/not-found',
        name: 'not-found',
        component: () => import('@/views/errors/NotFound.vue'),
        meta: {
            layout: 'auth',
            notAuthRequired: false,
        },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'catch-all',
        redirect: { name: 'not-found' },
    }


];

export default notFound;