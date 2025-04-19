<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";
import { useEchoStore } from "@/stores/echoStore";
import { useSettingsStore } from "@/stores/settingsStore";


const settingsStore = useSettingsStore();
const echoStore = useEchoStore();


const formState = reactive({
    email: "",
    password: "",
    remember: false
});
const dirApi = import.meta.env.VITE_API_BASE_URL;
const isLoading = ref(false);
const rule = {
    email: [
        { required: true, message: "Please enter email" },
        { type: "email", message: "Email is not in correct format" },
    ],
    password: [{ required: true, message: "Please enter password" }],
};

const onFinish = async (values) => {
    try {
        isLoading.value = true;
        const res = await axios.post(`${dirApi}auth/login-admin`, values);

        if(res.data.code == 401){
            message.warning(res.data.message);
        }

        if(res.data.code == 403){
            message.warning(res.data.message);
        }

        if (res.data.code === 200) {
            // Kiểm tra role của user
            const userRole = res.data.data.user?.role?.toLowerCase();
            
            if (userRole !== 'admin') {
                message.error("Bạn không có quyền truy cập trang admin!");
                return;
            }

            message.success(res.data.message || "Login successfully");

            if (res.data.data.setting) {
                // console.log("res.data.data.setting", res.data.data.setting);
                settingsStore.initializeFromApi(res.data.data.setting);
            } else {
                settingsStore.setDefaultSettings();
            }

            // Xử lý thông tin user trước khi lưu
            const userData = res.data.data.user
                ? {
                    ...res.data.data.user,
                    id: Number(res.data.data.user.id),
                    role: String(res.data.data.user.role || "user"),
                }
                : null;

            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("access_token", res.data.data.access_token);

            echoStore.initEcho();
            echoStore.startListening();

            router.push("/dashboard");
        }
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || "An error occurred, please try again";
        message.error(errorMessage);
        console.error("Login error:", error);
    } finally {
        isLoading.value = false;
    }
};

// Hàm helper để validate và convert setting
const validateAndConvertSettings = (settings) => {
    return {
        ...settings,
        id: Number(settings.id) || 0,
        user_id: Number(settings.user_id) || 0,
        theme: String(settings.theme) || "light",
        language: String(settings.language) || "en",
        timezone_code: String(settings.timezone_code) || "UTC",
        time_format: String(settings.time_format) || "H:mm",
        date_format: String(settings.date_format) || "Y-m-d",
    };
};

// Hàm helper để lấy setting mặc định
const getDefaultSettings = () => ({
    theme: "light",
    language: "en",
    timezone_code: "UTC",
    time_format: "H:mm",
    date_format: "Y-m-d",
});

</script>

<template>
    <div class="flex justify-center items-center h-[100vh] bg-gray-50">
        <div class="flex p-8 w-full justify-items-center max-w-5xl mx-auto overflow-hidden rounded-lg shadow-xl">
            <div class="hidden lg:block lg:w-1/2 mx-auto my-auto p-4">
                <img src="../../assets/images/Admin-amico.png" alt="Admin Illustration" 
                    class="w-full h-auto object-contain max-h-[500px] transform hover:scale-105 transition-transform duration-300" />
            </div>

            <a-form layout="vertical" :model="formState" :rules="rule" name="basic" @finish="onFinish"
                class="w-full px-6 py-8 md:px-8 lg:w-1/2 flex flex-col justify-center">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                    <p class="text-gray-600">Please login to your admin account</p>
                </div>

                <a-form-item label="Email" name="email" class="mb-6">
                    <a-input v-model:value="formState.email" id="LoggingEmailAddress"
                        class="custom-input" type="email" placeholder="Enter your email" />
                </a-form-item>

                <a-form-item label="Password" name="password" class="mb-6">
                    <a-input-password v-model:value="formState.password"
                        class="custom-input" placeholder="Enter your password" />
                </a-form-item>

                <div class="flex items-center justify-between mb-6">
                    <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
                    <a href="#" class="text-orange-500 hover:text-orange-600">Forgot password?</a>
                </div>

                <div class="mt-4">
                    <button class="gradient-btn">Login</button>
                </div>

                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        Don't have an account? 
                        <router-link to="/register" class="text-orange-500 hover:text-orange-600 font-medium">
                            Sign up
                        </router-link>
                    </p>
                </div>
            </a-form>
        </div>
    </div>
</template>

<style scoped>
.gradient-btn {
    width: 100%;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(45deg, #FF9800, #FF5722);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
    transition: all 0.3s ease;
}

.gradient-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.gradient-btn:active {
    transform: translateY(0);
}

:deep(.custom-input) {
    height: 45px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    padding: 10px 15px;
    font-size: 15px;
    transition: all 0.3s ease;
    background-color: #f8fafc;
}

:deep(.custom-input:hover) {
    border-color: #FF9800;
    box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.1);
}

:deep(.custom-input:focus) {
    border-color: #FF9800;
    box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
}

:deep(.ant-form-item-label > label) {
    font-size: 14px;
    font-weight: 500;
    color: #4a5568;
}

:deep(.ant-checkbox-wrapper) {
    color: #4a5568;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: #FF9800;
    border-color: #FF9800;
}
</style>
