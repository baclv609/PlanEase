import { defineStore } from "pinia";
import { ref } from "vue";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import LogoIcon from "@/assets/images/logo.png";
export const useEchoStore = defineStore("echo", () => {
    const echo = ref(null);
    const isListening = ref(false);

    function initEcho() {
        const token = localStorage.getItem("access_token");
        if (!token || echo.value) return;

        echo.value = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            authEndpoint: `${import.meta.env.VITE_PUSHER_BACKEND_URL}broadcasting/auth`,
            encrypted: true,
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        // console.log("✅ Echo đã khởi tạo!");
    }

    function startListening() {
        if (isListening.value || !echo.value) return;

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        echo.value.private(`App.Models.User.${user.id}`)
            .listen(".task.reminder", async (event) => {
                if (!("Notification" in window)) {
                    // console.log("Trình duyệt này không hỗ trợ thông báo");
                    alert("🔔🔔 Nhắc nhở sự kiện sắp đến")
                    return;
                }

                if (Notification.permission === "granted") {
                    new Notification("🔔🔔 Nhắc nhở sự kiện", {
                        body: "Có một sự kiện sắp đến!",
                        icon: LogoIcon
                    });
                } else if (Notification.permission !== "denied") {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        new Notification("🔔🔔 Nhắc nhở sự kiện", {
                            body: "Có một sự kiện sắp đến!",
                            icon: LogoIcon
                        });
                    }
                }
            });

        isListening.value = true;
        // console.log(`🎧 Đã lắng nghe kênh App.Models.User.${user.id}`);
    }

    function stopListening() {
        if (!echo.value) return;

        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            echo.value.leave(`App.Models.User.${user.id}`);
        }

        isListening.value = false;
        console.log("🚪 Đã rời khỏi kênh.");
    }

    function destroyEcho() {
        if (echo.value) {
            echo.value.disconnect();
            echo.value = null;
            console.log("❌ Echo đã bị dừng.");
        }
    }

    return { echo, initEcho, startListening, stopListening, destroyEcho };
});

