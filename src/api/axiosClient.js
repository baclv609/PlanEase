// # Cấu hình axios
import axios from "axios";
import router from "@/router";

const axiosClient = axios.create({
    baseURL: "https://api.example.com",
    headers: { "Content-Type": "application/json" }
});

// Tự động gửi token nếu có
axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem("userToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý lỗi 401 (Unauthorized)
axiosClient.interceptors.response.use(
    (response) => response, // Nếu thành công, trả về response bình thường
    (error) => {
        if (error.response) {
            // 🔴 Nếu lỗi 401 - Hết hạn token, chuyển hướng về trang đăng nhập
            if (error.response.status === 401) {
                localStorage.removeItem("userToken");
                router.push("/login");
            }

            // 🟡 Nếu lỗi 403 - Không có quyền truy cập
            if (error.response.status === 403) {
                console.error("Bạn không có quyền truy cập!");
            }

            // 🔵 Nếu lỗi 500 - Lỗi từ server
            if (error.response.status === 500) {
                console.error("Lỗi server! Hãy thử lại sau.");
            }
        } else {
            console.error("Không thể kết nối đến server!");
        }

        return Promise.reject(error);
    }
);


export default axiosClient;
