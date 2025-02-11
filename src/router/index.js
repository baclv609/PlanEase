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
import users from "./users";


const routes = [
    ...home,
    ...auth,
    ...settingsRouter,
    ...users,
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
    const isAuthenticated = !!localStorage.getItem("userToken");

    // Nếu là trang dashboard thì cho phép vào mà không cần login
    if (to.name === 'dashboard') {
        next();
        NProgress.done();
        return;
    }

    // Nếu trang yêu cầu đăng nhập mà chưa login thì chuyển về login
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
        NProgress.done();
    } else {
        next();
        NProgress.done();
    }
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
