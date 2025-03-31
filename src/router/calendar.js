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
    redirect: (to) => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      return {
        name: "calendar-view",
        params: {
          view: "month",
          year,
          month,
          day
        }
      };
    },
    meta: {
      layout: "default",
      notAuthRequired: false,
      requiresAuth: true,
    },
  },
  {
    path: "/calendar/:view/:year/:month/:day?",
    name: "calendar-view",
    component: () => import("@/views/calendar/index.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "default",
      notAuthRequired: false,
    },
    beforeEnter: (to, from, next) => {
      const validViews = ['day', 'week', 'month', 'agenda', 'schedule', 'year', 'custom'];
      const { view, year, month, day } = to.params;
      
      // Validate view
      if (!validViews.includes(view)) {
        next('/calendar/month');
        return;
      }
      
      // Validate year
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        next('/calendar/month');
        return;
      }
      
      // Validate month
      const monthNum = parseInt(month);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        next('/calendar/month');
        return;
      }
      
      // Validate day if present
      if (day) {
        const dayNum = parseInt(day);
        const maxDays = new Date(yearNum, monthNum, 0).getDate();
        if (isNaN(dayNum) || dayNum < 1 || dayNum > maxDays) {
          next('/calendar/month');
          return;
        }
      }
      
      // Validate date combinations based on view
      if (view === 'week' && !day) {
        // For week view, we need the day parameter
        const today = new Date();
        next({
          name: 'calendar-view',
          params: {
            view: 'week',
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            day: today.getDate()
          }
        });
        return;
      }
      
      next();
    }
  },
  {
    path: "/calendar/u/0/r/custom/:days/d/:year/:month/:day",
    name: "calendar-custom",
    component: () => import("@/views/calendar/index.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "default",
      notAuthRequired: false,
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
