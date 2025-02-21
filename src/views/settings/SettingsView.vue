<template>
    <a-modal :open="props.isModalOpen" @ok="handleOk" @cancel="handleCancel" width="600px" :maskClosable="false">
        <div class="p-4">
            <h2 class="text-2xl font-bold border-b pb-2">Cài đặt</h2>

            <!-- Chọn Language -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-40">Ngôn ngữ</label>
                <a-select v-model:value="language" @change="changeLanguage" style="width: 200px">
                    <a-select-option value="en">English</a-select-option>
                    <a-select-option value="vi">Tiếng Việt</a-select-option>
                </a-select>
            </div>

            <!-- Chọn Timezone -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-40">Múi giờ</label>
                <a-select v-model="selectedTimezone" @change="updateTimezone" style="width: 200px">
                    <a-select-option v-for="timezone in timezones" :key="timezone.id" :value="timezone.id">
                        {{ timezone.name }} ({{ timezone.utc_offset }})
                    </a-select-option>
                </a-select>
            </div>

            <!-- Chọn Date Format -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-40">Định dạng ngày</label>
                <a-select v-model="selectedDateFormat" @change="updateDateFormat" style="width: 200px">
                    <a-select-option v-for="format in dateFormats" :key="format.value" :value="format.value">
                        {{ format.label }}
                    </a-select-option>
                </a-select>
            </div>

            <!-- Chọn Time Format -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-40">Định dạng giờ</label>
                <a-select v-model="selectedTimeFormat" @change="updateTimeFormat" style="width: 200px">
                    <a-select-option v-for="format in timeFormats" :key="format.value" :value="format.value">
                        {{ format.label }}
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

// Date & Time Format
const dateFormats = ref([
    { value: 'd/m/Y', label: 'DD/MM/YYYY' },
    { value: 'm/d/Y', label: 'MM/DD/YYYY' },
    { value: 'Y-m-d', label: 'YYYY-MM-DD' }
]);

const timeFormats = ref([
    { value: 'h:mmA', label: '12-hour (hh:mm AM/PM)' },
    { value: 'HH:mm', label: '24-hour (HH:mm)' }
]);

const selectedDateFormat = ref(localStorage.getItem("user-date-format") || 'd/m/Y');
const selectedTimeFormat = ref(localStorage.getItem("user-time-format") || 'h:mmA');

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
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        // console.log("Cập nhật ngôn ngữ:", language.value);
    } catch (error) {
        console.error("Lỗi cập nhật ngôn ngữ:", error);
    }
};

// Lấy danh sách Timezone từ API
const fetchTimezones = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}timezones`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                Accept: 'application/json'
            }
        });
        timezones.value = response.data.data;
        console.log("✅ Timezones đã tải:", timezones.value);
    } catch (error) {
        console.error("❌ Lỗi tải Timezones:", error);
    }
};

// Cập nhật timezone
const updateTimezone = async () => {
    try {
        await axios.put('/api/change-setting', { timezone_id: selectedTimezone.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        localStorage.setItem("user-timezone", selectedTimezone.value);
        console.log("✅ Cập nhật Timezone:", selectedTimezone.value);
    } catch (error) {
        console.error("❌ Lỗi cập nhật Timezone:", error);
    }
};

// Cập nhật Date Format
const updateDateFormat = async () => {
    try {
        await axios.put('/api/change-setting', { date_format: selectedDateFormat.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        localStorage.setItem("user-date-format", selectedDateFormat.value);
        console.log("✅ Cập nhật Date Format:", selectedDateFormat.value);
    } catch (error) {
        console.error("❌ Lỗi cập nhật Date Format:", error);
    }
};

// Cập nhật Time Format
const updateTimeFormat = async () => {
    try {
        await axios.put('/api/change-setting', { time_format: selectedTimeFormat.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        localStorage.setItem("user-time-format", selectedTimeFormat.value);
        console.log("✅ Cập nhật Time Format:", selectedTimeFormat.value);
    } catch (error) {
        console.error("❌ Lỗi cập nhật Time Format:", error);
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
