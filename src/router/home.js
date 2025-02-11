const home = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/home/landingpage/index.vue'),
        meta: {
            layout: 'default',
            notAuthRequired: false,
        },
    },

]

export default home