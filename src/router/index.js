import { createRouter, createWebHistory } from "vue-router";
import NProgress, { settings } from "nprogress";
import dashboard from "./dashboard";
import auth from "./auth";
import notFound from "./notFound";
import schedule from "./schedule";
import event from "./event";
import support from "./support";
import settingsRouter from "./settings";
import calendar from "./calendar";
import users from "./users";
import roles from "./role";
import { message } from 'ant-design-vue';


const routes = [
  ...dashboard,
  ...auth,
  ...calendar,
  ...settingsRouter,
  ...users,
  ...roles,
  ...schedule,
  ...event,
  ...support,
//   ...notFound,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
    NProgress.start();
    const isAuthenticated = Boolean(localStorage.getItem("access_token"));
    const userData = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
    const isAdmin = userData.role?.toLowerCase() === 'admin';

    // console.log('Debug Navigation:', {
    //     isAuthenticated,
    //     isAdmin,
    //     currentPath: to.path,
    //     targetRoute: to.name
    // });

    // Nếu đã đăng nhập
    if (isAuthenticated) {
        // Nếu là admin
        if (isAdmin) {
            // Nếu đang ở trang đăng nhập hoặc trang chủ, chuyển đến dashboard
            if (to.path === '/' || to.path === '/login' || to.path === '/register') {
                console.log('Redirecting admin to dashboard');
                next({ name: 'dashboard', replace: true });
                NProgress.done();
                return;
            }
        } else {
            // Nếu không phải admin và cố truy cập dashboard
            if (to.name === 'dashboard') {
                message.error("Bạn không có quyền truy cập!");
                next({ name: 'calendar', replace: true });
                NProgress.done();
                return;
            }

            // Nếu ở trang đăng nhập hoặc trang chủ, chuyển đến calendar
            if (to.path === '/' || to.path === '/login' || to.path === '/register') {
                next({ name: 'calendar', replace: true });
                NProgress.done();
                return;
            }
        }
    } else {
        // Nếu chưa đăng nhập và cố truy cập trang yêu cầu xác thực
        if (to.meta.requiresAuth) {
            message.warning("Bạn cần đăng nhập để truy cập!");
            next({ name: 'login', replace: true });
            NProgress.done();
            return;
        }
    }

    // Cho phép điều hướng
    next();
    NProgress.done();
});

// console.log(JSON.parse(localStorage.getItem("user")));

export default router;
