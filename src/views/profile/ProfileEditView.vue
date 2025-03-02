<template>
    <a-drawer v-model:open="isVisible" title="Chỉnh sửa thông tin" placement="right" width="520">
        <a-form layout="vertical">
            <div class="flex justify-center mb-4">
                <a-upload :show-upload-list="false" accept="image/*" @change="handleAvatarChange">
                    <img v-if="avatarPreview || userData.avatar"
                        :src="avatarPreview || userData.avatar"
                        class="rounded-full w-24 h-24 object-cover cursor-pointer" />
                    <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                        <span>Tải ảnh</span>
                    </div>
                </a-upload>
            </div>

            <div class="flex gap-4">
                <div class="w-1/2">
                    <a-form-item label="Họ">
                        <a-input v-model:value="userData.last_name" />
                    </a-form-item>
                </div>
                <div class="w-1/2">
                    <a-form-item label="Tên">
                        <a-input v-model:value="userData.first_name" />
                    </a-form-item>
                </div>
            </div>

            <a-form-item label="Giới tính">
                <a-select v-model:value="userData.gender">
                    <a-select-option value="male">Nam</a-select-option>
                    <a-select-option value="female">Nữ</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="Địa chỉ">
                <a-input v-model:value="userData.address" />
            </a-form-item>
            <a-form-item label="Số điện thoại">
                <a-input v-model:value="userData.phone" />
            </a-form-item>

            <div class="flex justify-end gap-2">
                <a-button @click="isVisible = false">Hủy</a-button>
                <a-button type="primary" @click="updateProfile">Lưu</a-button>
            </div>
        </a-form>
    </a-drawer>
</template>

<script setup>
import { ref, defineExpose } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";

const dirApi = import.meta.env.VITE_API_BASE_URL;

const isVisible = ref(false);
const avatarPreview = ref(null);
const selectedAvatar = ref(null);
const userData = ref({
    last_name: "",
    first_name: "",
    gender: "male",
    address: "",
    phone: "",
    avatar: ""
});

const openDrawer = (user) => {
    if (!user) return;
    userData.value = {
        last_name: user.last_name || "",
        first_name: user.first_name || "",
        gender: user.gender || "male",
        address: user.address || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
    };
    avatarPreview.value = null;
    selectedAvatar.value = null;
    isVisible.value = true;
};

const handleAvatarChange = (event) => {
    const file = event.file.originFileObj;
    if (file) {
        selectedAvatar.value = file;
        avatarPreview.value = URL.createObjectURL(file);
    }
};

const updateProfile = async () => {
    try {
        const token = localStorage.getItem("access_token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            return;
        }

        // Kiểm tra dữ liệu trước khi gửi
        console.log("Dữ liệu trước khi gửi:", userData.value);

        const formData = new FormData();
        formData.append("first_name", userData.value.first_name?.trim() || "");
        formData.append("last_name", userData.value.last_name?.trim() || "");
        formData.append("gender", userData.value.gender || "male");
        formData.append("address", userData.value.address?.trim() || "");
        formData.append("phone", userData.value.phone?.trim() || "");

        // Nếu có ảnh đại diện mới, thêm vào formData
        if (selectedAvatar.value) {
            formData.append("avatar", selectedAvatar.value);
        }

        const response = await axios.put(`${dirApi}user/update-profile`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            },
        });

        message.success("Cập nhật thông tin thành công!");

        // Cập nhật lại dữ liệu hiển thị
        userData.value = response.data;
        avatarPreview.value = null;
        selectedAvatar.value = null;
        isVisible.value = false;
    } catch (error) {
        console.error("Lỗi cập nhật:", error.response?.data || error);
        message.error("Cập nhật thất bại!");

        // Hiển thị lỗi từ API nếu có
        if (error.response?.data?.errors) {
            Object.values(error.response.data.errors).forEach((err) => {
                message.error(err[0]);
            });
        }
    }
};

defineExpose({ openDrawer });
</script>
