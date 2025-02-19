<template>
    <a-modal v-model:open="isModalOpen" @ok="handleOk" @cancel="handleCancel" width="600px">
        <div class="p-4">
            <!-- Tiêu đề Setting -->
            <h2 class="text-2xl font-bold border-b pb-2">{{ $t('Setting') }}</h2>

            <!-- Chọn Language -->
            <div class="mt-4">
                <label for="language-select" class="text-lg font-semibold">{{ $t('select_language') }}</label>
                <a-select v-model:value="language" @change="changeLanguage" style="width: 200px" class="mt-2 m-6">
                    <a-select-option value="en">{{ $t('english') }}</a-select-option>
                    <a-select-option value="vi">{{ $t('vietnamese') }}</a-select-option>
                </a-select>
            </div>

            <!-- Chọn Timezone -->
            <div class="mt-4">
                <label for="timezone-select" class="text-lg font-semibold">{{ $t('timezone') }}</label>
                <select v-model="selectedTimezone" class="mt-2 block w-full p-2 border rounded"
                    @change="updateTimezone">
                    <option v-for="timezone in timezones" :key="timezone.id" :value="timezone.id">
                        {{ timezone.name }} ({{ timezone.utc_offset }})
                    </option>
                </select>
            </div>
        </div>
    </a-modal>
</template>

<script setup>
import { ref, watch, onMounted, h } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const props = defineProps({
    isModalOpen: Boolean,
});
const emit = defineEmits(['update:isModalOpen']);

const isModalOpen = ref(props.isModalOpen);


const { locale } = useI18n(); // Lấy đối tượng locale từ vue-i18n
const activeKey = ref('1');
const language = ref(localStorage.getItem("user-language") || 'en'); // Lấy ngôn ngữ đã lưu hoặc mặc định là 'en'

// Đồng bộ props với biến cục bộ
watch(() => props.isModalOpen, (newVal) => {
    isModalOpen.value = newVal;
});

// Đóng modal
const handleOk = () => {
    isModalOpen.value = false;
    emit('update:isModalOpen', isModalOpen.value);
};
const handleCancel = () => {
    isModalOpen.value = false;
    emit('update:isModalOpen', isModalOpen.value);
};

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

// Gọi API khi component được mount
onMounted(() => {
    fetchTimezones();
});
</script>

<style scoped>
h2 {
    font-size: 24px;
    font-weight: bold;
    border-bottom: 2px solid #ccc;
    padding-bottom: 8px;
}
</style>
