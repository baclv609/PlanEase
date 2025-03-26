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
  ...calendar,
  ...auth,
  ...settingsRouter,
  ...users,
  ...roles,
  ...dashboard,
  ...schedule,
  ...event,
  ...settingsRouter,
  ...support,
  ...notFound,
  
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, _, next) => {
    NProgress.start();
    const isAuthenticated = Boolean(localStorage.getItem("access_token"));
  
    // Lấy thông tin user từ localStorage, nếu chưa có thì gán object rỗng
    const userData = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
    const userRole = userData.role || ""; // Nếu không có role thì gán ""
  
    // Nếu đã đăng nhập và vào trang "/", chuyển hướng về "calendar"
    if (isAuthenticated && to.path === "/") {
      next({ name: "calendar" });
      NProgress.done();
      return;
    }
  
    // Nếu đã đăng nhập và cố vào login/register -> Chuyển hướng về calendar
    if (isAuthenticated && (to.name === "login" || to.name === "register")) {
        message.info("Bạn đã đăng nhập!");
      next({ name: "calendar" });
      NProgress.done();
      return;
    }
  
    // Nếu trang yêu cầu đăng nhập mà chưa login -> Chuyển về login
    if (to.meta.requiresAuth && !isAuthenticated) {
        message.warning("Bạn cần đăng nhập để truy cập!");
      next({ name: "login" });
      NProgress.done();
      return;
    }
  
    // ⚡️ Phân quyền Dashboard: Chỉ admin mới được vào dashboard
    if (to.name === "dashboard") {
      if (!isAuthenticated) {
        message.warning("Bạn cần đăng nhập để truy cập!");
        next({ name: "login" }); // Nếu chưa login, chuyển về login
      } else if (userRole !== "admin") {
        message.error("Bạn không có quyền truy cập!");
        next({ name: "not-found" }); // Nếu không phải admin, chặn truy cập
      } else {
        next(); // Nếu là admin, cho phép vào
      }
      NProgress.done();
      return;
    }
  
    next();
    NProgress.done();
  });
export default router;
