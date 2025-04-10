const tag = [
  {
    path: "/tag/invite/:id",
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