const tag = [
  {
    path: "/calendar/tag/:id/invite",
    name: "tag-invite",
    component: () => import("@/views/tag/TagInviteView.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      layout: "auth",
      notAuthRequired: false,
    },
  },
];

export default tag; 