<template>
    <a-modal :open="props.isModalOpen" @ok="handleOk" @cancel="handleCancel" width="600px" :maskClosable="false"
    >
        <div class="p-4">
            <h2 class="text-2xl font-bold border-b pb-2">{{ $t('Setting') }}</h2>

            <!-- Chọn Language -->
            <div class="mt-4">
                <label class="text-lg font-semibold">{{ $t('select_language') }}</label>
                <a-select v-model:value="language" @change="changeLanguage" style="width: 200px" class="mt-2 m-6">
                    <a-select-option value="en">{{ $t('english') }}</a-select-option>
                    <a-select-option value="vi">{{ $t('vietnamese') }}</a-select-option>
                </a-select>
            </div>

            <!-- Chọn Timezone -->
            <div class="mt-4">
                <label class="text-lg font-semibold">{{ $t('timezone') }}</label>
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const props = defineProps({
  isModalOpen: Boolean
});
const emit = defineEmits(['update:isModalOpen']);

const language = ref(localStorage.getItem("user-language") || 'en');
const { locale } = useI18n(); 

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
</script>

<style scoped>
h2 {
    font-size: 24px;
    font-weight: bold;
    border-bottom: 2px solid #ccc;
    padding-bottom: 8px;
}
</style>
