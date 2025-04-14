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
import tag from "./tag";
import { message } from 'ant-design-vue';


const routes = [
    ...calendar,
  ...dashboard,
  ...auth,
  ...settingsRouter,
  ...users,
  ...roles,
  ...schedule,
  ...event,
  ...support,
  ...tag,
  ...notFound,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});


router.beforeEach(async (to, from, next) => {
    NProgress.start();

    const isAuthenticated = Boolean(localStorage.getItem("access_token"));
    const userData = isAuthenticated ? JSON.parse(localStorage.getItem("user")) : {};
    const isAdmin = userData?.role?.toLowerCase() === 'admin';

    // Nếu đã đăng nhập
    if (isAuthenticated) {
        // Nếu là admin
        if (isAdmin) {
            // Nếu vào trang login hoặc register, chuyển đến trang 404
            if (['/login', '/register', '/loginAdmin', '/verify', '/forgot-password', '/reset-password'].includes(to.path)) {
                next({ name: 'not-found', replace: true }); // Chuyển hướng đến trang 404
                NProgress.done();
                return;
            }

            // Nếu vào trang chủ, chuyển đến trang người dùng bình thường
            if (to.path === '/') {
                next({ name: 'calendar', replace: true });
                NProgress.done();
                return;
            }

            // Nếu vào dashboard, cho phép truy cập bình thường
            if (to.name === 'dashboard') {
                next();
                NProgress.done();
                return;
            }

            next();
            NProgress.done();
        } else {
            if (to.path === '/') {
                next({ name: 'calendar', replace: true });
                NProgress.done();
                return;
            }

            // Nếu không phải admin và cố truy cập dashboard
            if (to.name === 'dashboard') {
                // message.error("Bạn không có quyền truy cập!");
                next({ name: 'not-found', replace: true });
                NProgress.done();
                return;
            }

            // Nếu người dùng đã đăng nhập mà vào trang login/register, chuyển đến trang 404
            if (['/login', '/register','/loginAdmin', '/verify', '/forgot-password', '/reset-password'].includes(to.path)) {
                next({ name: 'not-found', replace: true });
                NProgress.done();
                return;
            }

            // Các trang khác cho người dùng bình thường
            next();
            NProgress.done();
            return;
        }
    } else {
        // Chưa đăng nhập mà cố vào dashboard → chuyển sang loginAdmin
        if (to.name === 'dashboard') {
            next({ name: 'loginAdmin', replace: true });
            NProgress.done();
            return;
        }

        // Nếu chưa đăng nhập và cố truy cập trang yêu cầu xác thực
        if (to.meta.requiresAuth) {
            message.warning("Bạn cần đăng nhập để truy cập!");
              next({ name: 'login', replace: true });
            NProgress.done();
            return;
        }

        // Nếu chưa đăng nhập và truy cập vào login hoặc register thì vẫn vào bình thường
        next();
        NProgress.done();
    }
});


export default router;
