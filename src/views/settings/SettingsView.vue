<template>
    <router-link to="/calendar" aria-label="logo" class="flex items-center space-x-2 mb-6">
        <div aria-hidden="true" class="flex space-x-1">
            <div class="size-4 rounded-full bg-gray-900 dark:bg-white"></div>
            <div class="h-6 w-2 bg-primary"></div>
        </div>

        <a-button type="default" :icon="h(ArrowLeftOutlined)" class="text-lg">{{ $t('back') }}</a-button>
    </router-link>

    <a-tabs v-model:activeKey="activeKey" tab-position="left" animated class="settings-tabs">
        <a-tab-pane key="1" :tab="$t('edit_profile')" class="tab-pane">hihi</a-tab-pane>
        <a-tab-pane key="2" :tab="$t('change_password')" class="tab-pane"></a-tab-pane>
        <a-tab-pane key="3" :tab="$t('language')" class="tab-pane">
            <div class="p-4">
                <label for="language-select" class="text-lg font-semibold">{{ $t('select_language') }}</label>
                <a-select v-model:value="language" @change="changeLanguage" style="width: 200px" class="mt-2">
                    <a-select-option value="en">{{ $t('english') }}</a-select-option>
                    <a-select-option value="vi">{{ $t('vietnamese') }}</a-select-option>
                </a-select>
            </div>
        </a-tab-pane>
        <a-tab-pane key="4" :tab="$t('time_zone')" class="tab-pane"></a-tab-pane>
    </a-tabs>
</template>

<script setup>
import { ref, h } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const { locale } = useI18n(); // Lấy đối tượng locale từ vue-i18n
const activeKey = ref('1');
const language = ref(localStorage.getItem("user-language") || 'en'); // Lấy ngôn ngữ đã lưu hoặc mặc định là 'en'

// Hàm thay đổi ngôn ngữ
const changeLanguage = async () => {
    locale.value = language.value;  // Cập nhật ngôn ngữ trong vue-i18n
    localStorage.setItem("user-language", language.value);  // Lưu ngôn ngữ vào localStorage

    // Gửi yêu cầu API để lưu cài đặt ngôn ngữ người dùng
    try {
        await axios.put('/api/change-setting', { language: language.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    } catch (error) {
        console.error("Error updating language setting:", error);
    }
};
</script>

