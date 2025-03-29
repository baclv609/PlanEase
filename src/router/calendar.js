const calendar = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/home/landingpage/index.vue"),
    meta: {
      layout: "public",
      notAuthRequired: false,
    },
  },
  {
    path: "/calendar",
    name: "calendar",
    redirect: "/calendar/month",
    meta: {
      layout: "default",
      notAuthRequired: false,
      requiresAuth: true,
    },
  },
  {
    path: "/calendar/:view/:date",
    name: "calendar-view",
    component: () => import("@/views/calendar/index.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "default",
      notAuthRequired: false,
    },
    beforeEnter: (to, from, next) => {
      const validViews = ['day', 'week', 'month', 'agenda', 'schedule', 'year'];
      if (!validViews.includes(to.params.view)) {
        next('/calendar/month');
      } else {
        next();
      }
    }
  },
  {
    path: "/calendar/event/:id",
    name: "calendar-event",
    component: () => import("@/views/calendar/index.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "default",
      notAuthRequired: false,
    },
  },
  {
    path: "/calendar/event/:id/invite",
    name: "calendar-invite",
    component: () => import("@/views/calendar/invite/InviteCalendarView.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "auth",
      notAuthRequired: false,
    },
  },
  {
    path: "/calendar/search",
    name: "calendar-search",
    component: () => import("@/views/calendar/SearchView.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "default",
      notAuthRequired: false,
    },
  },
  {
    path: "/calendar/upcoming",
    name: "calendar-upcoming",
    component: () => import("@/views/calendar/upcoming/index.vue"),
    meta: {
      requiresAuth: true,
      layout: "default",
      notAuthRequired: false,
    },
  },
  {
    path: "/calendar/test-changes-calendar",
    component: () => import("@/views/testClender/EventForm.vue"),
  },
  {
    path: "/calendar/trash",
    name: "calendar-trash",
    component: () => import("@/views/calendar/TrashView.vue"),
    meta: {
      requiresAuth: true,
      layout: "default",
      notAuthRequired: false,
    },
  },
];

export default calendar;
