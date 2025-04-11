<template>
    <a-modal :open="open" :title="t('calendar.addTag')" @ok="handleOk" @update:open="$emit('update:open', $event)">
        <a-form layout="vertical" :model="formState" :rules="rules" ref="formRef">
            <div class="flex gap-4">
                <!-- Input: Chiếm phần lớn không gian -->
                <div class="flex-1">
                    <a-form-item :label="t('calendar.tagName')" name="name" required>
                        <a-input v-model:value="formState.name" :placeholder="t('calendar.enterTagName')" />
                    </a-form-item>
                </div>

                <div class="w-[65px]">
                    <a-form-item label="Màu sắc" name="color_code">
                        <a-select v-model:value="formState.color_code" :dropdown-match-select-width="false"
                            :dropdown-style="{ padding: '8px' }" style="width: 100%">
                            <template #dropdownRender>
                                <div class="grid grid-cols-5 gap-2 p-1">
                                    <div v-for="color in colorOptions" :key="color.value"
                                        class="w-6 h-6 rounded-full cursor-pointer relative border-2 transition duration-200"
                                        :class="{
                                            'border-gray-300': formState.color_code !== color.value,
                                            'border-blue-500 ring-2 ring-blue-300': formState.color_code === color.value
                                        }" :style="{ backgroundColor: color.value }" @click="formState.color_code = color.value">
                                        <CheckOutlined v-if="formState.color_code === color.value"
                                            class="text-white text-xs absolute inset-0 flex items-center justify-center" />
                                    </div>
                                </div>
                            </template>

                            <!-- Hiển thị danh sách màu dưới dạng icon -->
                            <a-select-option v-for="color in colorOptions" :key="color.value" :value="color.value">
                                <div class="flex items-center">
                                    <span class="w-2 h-4 rounded-full mr-2"
                                        :style="{ backgroundColor: color.value }"></span>
                                </div>
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </div>
            </div>
            

            <a-form-item :label="t('common.description')" name="description">
                <a-textarea v-model:value="formState.description" :placeholder="t('calendar.enterTagDescription')"
                    :rows="3" />
            </a-form-item>

            <!-- Invite by Email -->
            <!-- <div class="my-1 w-full pb-2">
                <a-select show-search :placeholder="$t('event.guests')" :options="state.data" :filter-option="false"
                    :loading="state.fetching" @search="fetchUser" @select="handleUserSelect" :value="null"
                    class="w-full">
                    <template #option="{ label, value, first_name, last_name, avatar }">
                        <div class="flex items-center">
                            <a-avatar :src="avatar" :size="24" class="mr-2">
                                {{ !avatar ? getInitials(first_name, last_name) : '' }}
                            </a-avatar>
                            <div>
                                <div class="font-medium">{{ first_name }} {{ last_name }}</div>
                                <div class="text-xs text-gray-500">{{ label }}</div>
                            </div>
                        </div>
                    </template>
                </a-select>
            </div>

            <div v-if="selectedUsers.length > 0" class="mt-4">
                <div v-for="user in selectedUsers" :key="user.id"
                    class="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded">
                    <div class="flex items-center">
                        <a-avatar :src="user.avatar" :size="32" class="mr-3">
                            {{ !user.avatar ? getInitials(user.first_name, user.last_name) : '' }}
                        </a-avatar>
                        <div>
                            <div class="font-medium">{{ user.first_name }} {{ user.last_name }}</div>
                            <div class="text-xs text-gray-500">{{ user.email }}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <a-radio-group v-model:value="user.role"
                            @change="(e) => updateUserRole(user.id, e.target.value)">
                            <a-radio value="viewer">{{ t('event.roles.viewer') }}</a-radio>
                            <a-radio value="editor">{{ t('event.roles.editor') }}</a-radio>
                        </a-radio-group>
                        <a-button type="text" danger @click="removeUser(user.id)">
                            <template #icon>
                                <CloseOutlined />
                            </template>
                        </a-button>
                    </div>
                </div>
            </div> -->
        </a-form>
    </a-modal>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue';
import { CheckOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { message } from 'ant-design-vue';
import debounce from 'lodash/debounce';
import { Form } from 'ant-design-vue';

const { t } = useI18n();
const props = defineProps({
    open: {
        type: Boolean,
        required: true,
    },
});

const formRef = ref();
const formState = ref({
    name: '',
    color_code: '#FF5733',
    description: '',
});

const rules = {
    name: [
        { required: true, message: t('validation.tagNameRequired'), trigger: 'blur' },
        { min: 3, message: t('validation.tagNameMinLength'), trigger: 'blur' },
        { max: 50, message: t('validation.tagNameMaxLength'), trigger: 'blur' },
    ],
    color_code: [
        { required: true, message: t('validation.colorRequired'), trigger: 'change' },
    ],
    description: [
        { max: 500, message: t('validation.descriptionMaxLength'), trigger: 'blur' },
    ],
};

watch(
    () => props.open,
    (newVal) => {
        if (!newVal) {
            // Reset form khi đóng modal
            formState.value = {
                name: '',
                color_code: '#FF5733',
                description: '',
            };
            formRef.value?.resetFields();
            selectedUsers.value = [];
        }
    }
);

const emit = defineEmits(['update:open', 'tagAdded']);

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

const showEmailInput = ref(false);
const selectedUsers = ref([]);
const colorOptions = [
    { value: '#FF5733', label: 'Red' },
    { value: '#33FF57', label: 'Green' },
    { value: '#3357FF', label: 'Blue' },
    { value: '#F1C40F', label: 'Yellow' },
    { value: '#8E44AD', label: 'Purple' },
    { value: '#E74C3C', label: 'Coral' },
    { value: '#3498DB', label: 'Sky Blue' },
    { value: '#2ECC71', label: 'Emerald' },
    { value: '#9B59B6', label: 'Amethyst' },
    { value: '#1ABC9C', label: 'Turquoise' },
    { value: '#E67E22', label: 'Orange' },
    { value: '#34495E', label: 'Dark Blue' },
];

const state = ref({
    data: [],
    fetching: false,
});

let lastFetchId = 0;

const fetchUser = debounce(async (value) => {
    if (!value) {
        state.value.data = [];
        return;
    }

    lastFetchId += 1;
    const fetchId = lastFetchId;

    state.value.fetching = true;

    try {
        const response = await axios.get(`${dirApi}guest?search=${value}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (fetchId !== lastFetchId) return;

        state.value.data = response.data.data.map((user) => ({
            label: `${user.email}`,
            value: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        state.value.data = [];
    } finally {
        state.value.fetching = false;
    }
}, 300);

const handleUserSelect = (value, option) => {
    const existingUser = selectedUsers.value.find((user) => user.id === value);
    if (!existingUser) {
        selectedUsers.value.push({
            id: value,
            email: option.label,
            first_name: option.first_name,
            last_name: option.last_name,
            avatar: option.avatar,
            role: 'viewer',
        });
    }
    showEmailInput.value = false;
};

const removeUser = (userId) => {
    selectedUsers.value = selectedUsers.value.filter((user) => user.id !== userId);
};

const updateUserRole = (userId, newRole) => {
    const userIndex = selectedUsers.value.findIndex((user) => user.id === userId);
    if (userIndex !== -1) {
        selectedUsers.value[userIndex].role = newRole;
    }
};

const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

const handleOk = async () => {
    try {
        await formRef.value.validate();
        
        const response = await axios.post(
            `${dirApi}tags`,
            {
                name: formState.value.name,
                description: formState.value.description,
                color_code: formState.value.color_code,
                shared_user: [],
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 201) {
            emit('tagAdded', response.data.data);
            message.success(t('success.tagAdded', { name: formState.value.name }));
            emit('update:open', false);

            formState.value = {
                name: '',
                color_code: '#FF5733',
                description: '',
            };
        }
    } catch (error) {
        if (error.response) {
            if (error.response.status === 409) {
                message.error(t('errors.tagExists'));
            } else {
                message.error(t('errors.failedToAddTag'));
            }
        } else if (!error.errorFields) {
            message.error('Không thể kết nối đến máy chủ!');
        }
    }
};
</script>

<style scoped>
.color-option {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border: 2px solid transparent;
}

.color-option:hover {
    transform: scale(1.1);
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px #e0e0e0;
}

.color-selected {
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px #e0e0e0;
}

.check-icon {
    color: white;
    font-size: 16px;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
}

:deep(.ant-select-selector) {
    height: 40px !important;
    padding: 4px 11px !important;
    display: flex;
    align-items: center;
}

:deep(.ant-select-selection-item) {
    display: flex;
    align-items: center;
}

:deep(.ant-select-selection-item span) {
    width: 24px;
    height: 24px;
}
</style>
