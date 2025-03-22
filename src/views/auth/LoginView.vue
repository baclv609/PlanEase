<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";
import { useEchoStore } from "@/stores/echoStore";
import { useSettingsStore } from "@/stores/settingsStore";

const settingsStore = useSettingsStore();
const echoStore = useEchoStore();

// const { transformSettings } = useSettings();

const formState = reactive({
    email: "",
    password: "",
    // remember: false
});
const dirApi = import.meta.env.VITE_API_BASE_URL;
const isLoading = ref(false);
const rule = {
    email: [
        { required: true, message: "Please enter email" },
        { type: "email", message: "Email is not in correct format" },
    ],
    password: [
        { required: true, message: "Please enter password" },
    ],
};

const onFinish = async (values) => {
    try {
        isLoading.value = true;
        const res = await axios.post(`${dirApi}auth/login`, values);

        if (res.data.code === 200) {
            message.success(res.data.message || "Login successfully");

            // Khởi tạo settings từ API response
            if (res.data.data.setting) {
                console.log("res.data.data.setting", res.data.data.setting);
                settingsStore.initializeFromApi(res.data.data.setting);
            } else {
                settingsStore.setDefaultSettings();
            }

            // Xử lý thông tin user trước khi lưu
            const userData = res.data.data.user ? {
                ...res.data.data.user,
                id: Number(res.data.data.user.id),
                role: String(res.data.data.user.role || 'user')
            } : null;

            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("access_token", res.data.data.access_token);

            echoStore.initEcho();
            echoStore.startListening();

            router.push("/calendar");
        }
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || "An error occurred, please try again";
        message.error(errorMessage);
        console.error('Login error:', error);
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
        theme: String(settings.theme) || 'light',
        language: String(settings.language) || 'en',
        timezone_code: String(settings.timezone_code) || 'UTC',
        time_format: String(settings.time_format) || 'H:mm',
        date_format: String(settings.date_format) || 'Y-m-d'
    };
};

// Hàm helper để lấy setting mặc định
const getDefaultSettings = () => ({
    theme: 'light',
    language: 'en',
    timezone_code: 'UTC',
    time_format: 'H:mm',
    date_format: 'Y-m-d'
});

const loginWithGoogle = async () => {
    try {
        const { data } = await axios.get(`${dirApi}auth/google/redirect`);
        window.location.href = data.url;
    } catch (error) {
        console.log('Error:', error);
    }
};
</script>

<template>
    <div class="flex justify-center items-center h-[100vh]">
        <div
            class="flex p-20 w-full justify-items-center max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-xl lg:max-w-6xl">
            <div class="hidden bg-cover lg:block lg:w-1/2 mx-auto my-auto">
                <img src="../../assets/images/login-calendar-cuate_1-removebg-preview.png" alt="">
            </div>

            <a-form layout="vertical" :model="formState" :rules="rule" name="basic" @finish="onFinish"
                class="w-full px-6 py-8 md:px-8 lg:w-1/2">
                <h2 class="mt-3 text-4xl font-bold text-gray-600">
                    Login
                </h2>
                <p>Welcome to Notibro! Please login to have the best experience.</p>

                <div class="flex items-center justify-between mt-4">
                    <span class="w-1/5 border-b lg:w-1/4"></span>

                    <span class="w-1/5 border-b lg:w-1/4"></span>
                </div>

                <a-form-item label="Email" name="email" class="mt-4 block mb-2 text-sm font-medium text-gray-600"
                    for="email">
                    <a-input v-model:value="formState.email" id="LoggingEmailAddress"
                        class="px-4 py-2 border border-orange-300 text-gray-700" type="email" />
                </a-form-item>

                <a-form-item label="Password" name="password" class="mt-4 block mb-2 text-sm font-medium text-gray-600">
                    <a-input-password v-model:value="formState.password"
                        class="px-4 py-2 border border-orange-300 text-gray-700" />
                </a-form-item>
                <div class="flex justify-end">
                    <router-link to="/forgot-password"
                        class="underline decoration-orange-300 text-xs font-medium text-gray-500 hover:underline">Forgot
                        password?</router-link>
                </div>

                <!-- <a-form-item name="remember"> -->
                <!-- <a-checkbox v-model:checked="formState.remember">Giữ đăng nhập cho những lần sau</a-checkbox> -->
                <!-- </a-form-item> -->

                <div class="mt-3">
                    <button class="gradient-btn">
                        Login
                    </button>
                </div>

                <div class="text-center my-3">
                    <p class="text-sm font-medium">Or login with google</p>
                </div>

                <button @click.prevent="loginWithGoogle"
                    class="no-underline border-google flex items-center justify-center mt-4 text-gray-600 transition-colors duration-300 transform rounded-lg hover:bg-gray-50">

                    <div class="px-4 py-2 flex">
                        <svg class="w-6 h-6" viewBox="0 0 40 40">
                            <path
                                d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                                fill="#FFC107" />
                            <path
                                d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                                fill="#FF3D00" />
                            <path
                                d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                                fill="#4CAF50" />
                            <path
                                d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                                fill="#1976D2" />
                        </svg>
                        <span class="w-5/6 font-bold align-center mx-1">Google</span>
                    </div>

                </button>

                <div class="flex items-center justify-center flex-col gap-4 mt-4">
                    <router-link to="/register"
                        class="underline decoration-orange-300 text-sm text-gray-500 hover:underline">don't have an
                        Account?
                    </router-link>
                </div>
            </a-form>
        </div>
        <div class="absolute bottom-4">
            <p class="block m-0 text-sm leading-10 text-gray-600">
                Experience without registration
                <router-link to="/"
                    class="text-sm text-gray-500 font-medium underline decoration-orange-300 transform hover:text-orange-300">Click
                    here!</router-link>
            </p>
        </div>
    </div>
</template>

<style scoped>
.gradient-btn {
    width: 100%;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    color: black;
    background: linear-gradient(to right, #FFE8A3, #FF9800);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}

.gradient-btn:hover {
    opacity: 0.9;
}

.border-google {
    border: 0.9px solid orange;
    width: 100%;
    cursor: pointer;
}
</style>
