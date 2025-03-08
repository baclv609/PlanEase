import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: `${import.meta.env.VITE_PUSHER_BACKEND_URL}broadcasting/auth`,
    encrypted: true,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
    },
});

export default window.Echo;
