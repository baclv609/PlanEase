<template>
    <div class="p-4">
        <!-- Avatar -->
        <div class="flex justify-center relative">
            <a-avatar :size="100" :src="user.avatar" class="shadow-md" />
            <div class="absolute bottom-0 right-0 bg-gray-200 rounded-full p-2 cursor-pointer hover:bg-gray-300 transition"
                @click="handleChangeAvatar">
                <EditOutlined class="text-gray-600" />
            </div>
        </div>

        

        <div class="text-center mt-4">
            <div class="flex justify-center gap-2">
                <h2 class="text-xl font-semibold">{{ user.last_name }}</h2>
                <h2 class="text-xl font-semibold">{{ user.first_name }}</h2>
            </div>

            <div class="mt-2 space-y-2 text-lg">
                <div class="flex justify-center items-center gap-x-4">
                    <span class="w-32 text-right font-semibold text-gray-600">{{ $t("Email") }}:</span>
                    <span class="text-gray-500">{{ user.email }}</span>
                </div>
                <div class="flex justify-center items-center gap-x-4">
                    <span class="w-30 text-right font-semibold text-gray-600">{{ $t("Gender") }}:</span>
                    <span class="text-gray-500">{{ user.gender }}</span>
                </div>
                <div class="flex justify-center items-center gap-x-4">
                    <span class="w-32 text-right font-semibold text-gray-600">{{ $t("Address") }}:</span>
                    <span class="text-gray-500">{{ user.address }}</span>
                </div>
                <div class="flex justify-center items-center gap-x-4">
                    <span class="w-32 text-right font-semibold text-gray-600">{{ $t("Phone") }}:</span>
                    <span class="text-gray-500">{{ user.phone }}</span>
                </div>
            </div>

        </div>

        <!-- Đổi MK -->
        <div class="mt-8">
            <a-button type="default" block @click="goToChangePassword">
                <KeyOutlined />{{ $t("Change Password") }}
            </a-button>
        </div>

        <!-- Nút logout -->
        <div class="mt-6">
            <a-button type="primary" danger block @click="handleLogout">
                <LogoutOutlined /> {{ $t("Logout") }}
            </a-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { LogoutOutlined, EditOutlined, KeyOutlined } from "@ant-design/icons-vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";

const dirApi = import.meta.env.VITE_API_BASE_URL;
const user = ref({
    name: "Loading...",
    email: "",
    avatar: "",
});

// Lấy thông tin user từ API
const fetchUserData = async () => {
    try {
        const token = localStorage.getItem("access_token");
        console.log("❗Token:", token); // Debug token xem có giá trị không

        const response = await axios.get(`${dirApi}user`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅User Data:", response.data); // Debug response từ server

        if (response.data.code === 200) {
            user.value = response.data.data;
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.error("Lỗi khi lấy user:", error);
        message.error("Không thể lấy thông tin user");
    }
};


// Xử lý logout
const handleLogout = async () => {
    try {
        const token = localStorage.getItem("access_token");
        await axios.post(`${dirApi}auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.clear();
        message.success("Đăng xuất thành công!");
        router.push({ name: "home" });
    } catch {
        message.error("Đăng xuất thất bại!");
    }
};

onMounted(fetchUserData);
</script>