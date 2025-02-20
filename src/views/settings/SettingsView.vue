<template>
    <a-modal :open="props.isModalOpen" @ok="handleOk" @cancel="handleCancel" width="600px" :maskClosable="false">
        <div class="p-4">
            <h2 class="text-2xl font-bold border-b pb-2">{{ $t('Setting') }}</h2>

            <!-- Chọn Language -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-1/3">{{ $t('select_language') }}</label>
                <a-select v-model:value="language" @change="changeLanguage" style="width: 200px">
                    <a-select-option value="en">{{ $t('english') }}</a-select-option>
                    <a-select-option value="vi">{{ $t('vietnamese') }}</a-select-option>
                </a-select>
            </div>

            <!-- Chọn Timezone -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-1/3">{{ $t('timezone') }}</label>
                <a-select v-model:value="selectedTimezone" @change="updateTimezone" style="width: 300px">
                    <a-select-option v-for="timezone in timezones" :key="timezone.id" :value="timezone.id">
                        {{ timezone.name }} ({{ timezone.utc_offset }})
                    </a-select-option>
                </a-select>
            </div>
        </div>
    </a-modal>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const props = defineProps({
    isModalOpen: Boolean
});
const emit = defineEmits(['update:isModalOpen']);

const language = ref(localStorage.getItem("user-language") || 'en');
const { locale } = useI18n();

// Timezone
const timezones = ref([]);
const selectedTimezone = ref(localStorage.getItem("user-timezone") || null);

// const token = localStorage.getItem('access_token');
// console.log("Token hiện tại:", token);


// Đóng modal
const handleOk = () => {
    emit('update:isModalOpen', false);
};
const handleCancel = () => {
    emit('update:isModalOpen', false);
};


// Thay đổi ngôn ngữ
const changeLanguage = async () => {
    locale.value = language.value;
    localStorage.setItem("user-language", language.value);

    try {
        await axios.put('/api/change-setting', { language: language.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    } catch (error) {
        console.error("Error updating language setting:", error);
    }
};


// Gọi API để lấy danh sách Timezone
// console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

const fetchTimezones = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}timezones`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                Accept: 'application/json'
            }
        });
        // console.log("Timezones API response:", response.data);
        timezones.value = response.data.data;
    } catch (error) {
        console.error("Error fetching timezones:", error.response?.data || error.message);
    }
};

// Cập nhật timezone
const updateTimezone = async () => {
    try {
        await axios.put('/api/change-setting', { timezone_id: selectedTimezone.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        localStorage.setItem("user-timezone", selectedTimezone.value);
    } catch (error) {
        console.error("Error updating timezone setting:", error);
    }
};

// Gọi API khi component được mounted
onMounted(fetchTimezones);
</script>

<style scoped>
h2 {
    font-size: 24px;
    font-weight: bold;
    border-bottom: 2px solid #ccc;
    padding-bottom: 8px;
}
</style>
