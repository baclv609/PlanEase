<template>
    <a-modal :open="props.isModalOpen" @ok="handleOk" @cancel="handleCancel" width="600px" :maskClosable="false">
        <div class="p-4">
            <h2 class="text-2xl font-bold border-b pb-2">{{ $t('Setting') }}</h2>

            <!-- Chọn Language -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-40">{{ $t('language') }}</label>
                <a-select v-model:value="language" @change="changeLanguage" style="width: 200px">
                    <a-select-option value="en">{{ $t('english') }}</a-select-option>
                    <a-select-option value="vi">{{ $t('vietnamese') }}</a-select-option>
                </a-select>
            </div>

            <!-- Chọn Timezone -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-40">{{ $t('timezone') }}</label>
                <a-select v-model="selectedTimezone" @change="updateTimezone" style="width: 200px">
                    <a-select-option v-for="timezone in timezones" :key="timezone.id" :value="timezone.id">
                        {{ timezone.name }} ({{ timezone.utc_offset }})
                    </a-select-option>
                </a-select>
            </div>

            <!-- Chọn Date Format -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-40">{{ $t('date_format') }}</label>
                <a-select v-model="selectedDateFormat" @change="updateDateFormat" style="width: 200px">
                    <a-select-option v-for="format in dateFormats" :key="format.value" :value="format.value">
                        {{ format.label }}
                    </a-select-option>
                </a-select>
            </div>

            <!-- Chọn Time Format -->
            <div class="mt-4 flex items-center">
                <label class="text-lg font-semibold w-40">{{ $t('time_format') }}</label>
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
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const dirApi = import.meta.env.VITE_API_BASE_URL;

const props = defineProps({
    isModalOpen: Boolean
});
const emit = defineEmits(['update:isModalOpen']);

const { locale } = useI18n();

// Ngôn ngữ
const language = ref(localStorage.getItem("user-language") || navigator.language || 'en');

// Timezone
const timezones = ref([]);
const selectedTimezone = ref(null);

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

const selectedDateFormat = ref(null);
const selectedTimeFormat = ref(null);

// Đóng modal
const handleOk = () => {
    emit('update:isModalOpen', false);
};
const handleCancel = () => {
    emit('update:isModalOpen', false);
};

// Chuẩn hóa Timezone
const normalizeTimezone = (tz) => {
    return tz.includes("Saigon") ? "Asia/Ho_Chi_Minh" : tz;
};


// Lấy dữ liệu user settings từ API
const fetchUserSettings = async () => {
    try {
        const response = await axios.get(`${dirApi}user-settings`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                Accept: 'application/json'
            }
        });

        const settings = response.data.data;

        // Cập nhật giá trị từ API vào state
        language.value = settings.language || 'en';
        selectedTimezone.value = normalizeTimezone(settings.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
        selectedDateFormat.value = settings.date_format || dateFormats.value[0].value;
        selectedTimeFormat.value = settings.time_format || timeFormats.value[0].value;

        // Kiểm tra nếu giá trị không hợp lệ
        if (!dateFormats.value.some(f => f.value === selectedDateFormat.value)) {
            selectedDateFormat.value = dateFormats.value[0].value;
        }
        if (!timeFormats.value.some(f => f.value === selectedTimeFormat.value)) {
            selectedTimeFormat.value = timeFormats.value[0].value;
        }

        localStorage.setItem("user-language", language.value);
        localStorage.setItem("user-timezone", selectedTimezone.value);
        localStorage.setItem("user-date-format", selectedDateFormat.value);
        localStorage.setItem("user-time-format", selectedTimeFormat.value);

        console.log("User settings:", settings);
    } catch (error) {
        console.error("Lỗi tải User Settings:", error);
    }
};

// Lấy danh sách Timezones
const fetchTimezones = async () => {
    try {
        const response = await axios.get(`${dirApi}timezones`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                Accept: 'application/json'
            }
        });

        timezones.value = response.data.data;

        // Gán timezone nếu chưa có giá trị hoặc không hợp lệ
        if (!timezones.value.some(tz => tz.id === selectedTimezone.value)) {
            selectedTimezone.value = timezones.value.length ? timezones.value[0].id : null;
        }
    } catch (error) {
        console.error("Lỗi tải Timezones:", error);
    }
};

// Khi trang tải, lấy dữ liệu từ API
onMounted(async () => {
    await fetchUserSettings();
    await fetchTimezones();
});

// Cập nhật dữ liệu
const changeLanguage = async () => {
    locale.value = language.value;
    localStorage.setItem("user-language", language.value);

    try {
        await axios.put(`${dirApi}change-setting`, { language: language.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
    } catch (error) {
        console.error("Lỗi cập nhật ngôn ngữ:", error);
    }
};

const updateTimezone = async () => {
    try {
        await axios.put(`${dirApi}change-setting`, { timezone_id: selectedTimezone.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        localStorage.setItem("user-timezone", selectedTimezone.value);
    } catch (error) {
        console.error("Lỗi cập nhật Timezone:", error);
    }
};
</script>
