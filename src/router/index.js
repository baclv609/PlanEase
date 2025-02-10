import { createRouter, createWebHistory } from "vue-router";
import NProgress, { settings } from "nprogress";
import dashboard from "./dashboard";
import auth from "./auth";
import notFound from "./notFound";
import schedule from "./schedule";
import event from "./event";
import support from "./support";
import settingsRouter from "./settings";
import home from "./home";


const routes = [
    ...home,
    ...auth,
    ...dashboard,
    ...schedule,
    ...event,
    ...settingsRouter,
    ...support,
    ...notFound,];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach(async (to, _, next) => {
    NProgress.start();
    // const isAuthRequired = !to.meta.notAuthRequired;
    // const isAuthenticated = false;

    // if (to.name === 'not-found') {
    //     next();
    //     NProgress.done();
    //     return;
    // }

    // if (isAuthRequired && !isAuthenticated) {
    //     NProgress.done();
    //     return next({ name: 'login' });
    // }

    next();
    NProgress.done();
});


// router.beforeEach((to, _, next) => {
//     NProgress.start();
//     const isAuthenticated = !!localStorage.getItem("userToken");

//     if (to.meta.requiresAuth && !isAuthenticated) {
//         NProgress.done();
//         return next({ name: "login" });
//     }

//     if (to.meta.guest && isAuthenticated) {
//         return next({ name: "dashboard" });
//     }

//     next();
//     NProgress.done();
// });
export default router;
