import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
    easing: "ease",
    speed: 200,
    showSpinner: false,
    trickleSpeed: 100,
    minimum: 0.3
});

export default NProgress;
