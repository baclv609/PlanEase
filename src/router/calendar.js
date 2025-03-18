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
    meta: { requiresAuth: true },
    component: () => import("@/views/calendar/index.vue"),
    meta: {
      layout: "default",
      notAuthRequired: false,
      requiresAuth: true,
    },

  },
  {
    path: "/calendar/day/:year/:month/:day",
    name: "calendar-event",
    component: () => import("@/views/calendar/CalendarView.vue"),
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
    component: () => import("@/views/calendar/SearchView.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "default",
      notAuthRequired: false,
    },
  },
  {
    path: "/calendar/test-changes-calendar",
    component: () => import("@/views/testClender/EventForm.vue"),
   
  }
];

export default calendar;
