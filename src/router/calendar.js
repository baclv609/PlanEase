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
    // children: [
    //   {
    //     path: ":year/:month/:day", // Thay đổi cấu trúc URL
    //     name: "calendar-date",
    //     component: () => import("@/views/calendar/CalendarView.vue"),
    //     props: true,
    //     beforeEnter: (to, from, next) => {
    //       console.log("to.params:", to.params); // Kiểm tra log

    //       const { year, month, day } = to.params;
    //       const isValidDate =
    //         /^\d{4}$/.test(year) &&
    //         /^\d{2}$/.test(month) &&
    //         /^\d{2}$/.test(day);

    //       if (!isValidDate) {
    //         const today = new Date();
    //         next({
    //           name: "calendar-date",
    //           params: {
    //             year: today.getFullYear(),
    //             month: String(today.getMonth() + 1).padStart(2, "0"),
    //             day: String(today.getDate()).padStart(2, "0"),
    //           },
    //         });
    //       } else {
    //         next();
    //       }
    //     },
      // },
    // ],
  
     
    
  },
  {
    path: "/calendar/day/:year/:month/:day",
    name: "calendar-event",
    component: () => import("@/views/calendar/CalendarView.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "auth",
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
];

export default calendar;
