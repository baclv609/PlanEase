<template>
    <a-modal :open="open" title="Tag Details" @cancel="handleCancel" :footer="null" :maskClosable="false"
        class="tag-detail-modal" :width="600">
        <div class="p-4">
            <!-- Tag Header -->
            <div class="flex items-center mb-6">
                <div class="flex items-center px-3 py-1.5 rounded-full"
                    :style="{ backgroundColor: tagData.color_code + '20', borderColor: tagData.color_code }">
                    <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: tagData.color_code }"></div>
                    <span :style="{ color: tagData.color_code }" class="font-medium">{{ tagData.name }}</span>
                </div>
                <div class="ml-auto">
                    <a-button type="primary" size="small" @click="handleEdit">
                        <template #icon>
                            <EditOutlined />
                        </template>
                        Edit
                    </a-button>
                </div>
            </div>

            <!-- Tag Information -->
            <div class="grid grid-cols-1 gap-6 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium mb-3 flex items-center">
                        <TagOutlined class="mr-1" />
                        Tag Information
                    </h4>

                    <div class="mt-3">
                        <div class="text-xs text-gray-500">Color</div>
                    </div>

                    <div class="mt-3">
                        <div class="text-xs text-gray-500">Description</div>
                        <div class="text-sm font-medium mt-1">
                            {{ tagData.description || 'No description provided' }}
                        </div>
                    </div>

                </div>
            </div>

            <!-- Shared Users -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium flex items-center">
                        <TeamOutlined class="mr-1" />
                        Shared With
                    </h4>
                    <div class="flex items-center gap-2">
                        <a-button type="link" size="small" @click="handleInviteLink">
                            <template #icon>
                                <LinkOutlined />
                            </template>
                            Invite via Link
                        </a-button>
                        <a-button type="link" size="small" @click="handleShare">
                            <template #icon>
                                <UserAddOutlined />
                            </template>
                            Share
                        </a-button>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg">
                    <div v-if="tagData.shared_user && tagData.shared_user.length > 0">
                        <div v-for="(user, index) in tagData.shared_user" :key="index"
                            class="flex items-center p-3 border-b last:border-b-0">
                            <a-avatar :src="user.avatar ? `${user.avatar}` : null"
                                :style="{ backgroundColor: !user.avatar ? '#1890ff' : 'transparent' }">
                                {{ !user.avatar ? getInitials(user.first_name, user.last_name) : '' }}
                            </a-avatar>

                            <div class="ml-3">
                                <div class="font-medium">{{ user.first_name }} {{ user.last_name }}</div>
                                <div class="text-xs text-gray-500">{{ user.email }}</div>
                            </div>

                            <div class="ml-auto flex items-center gap-2">
                                <a-dropdown :trigger="['click']">
                                    <template #overlay>
                                    <a-menu @click="({ key }) => onSelectRole(user, key)">
                                        <a-menu-item key="admin">Admin</a-menu-item>
                                        <a-menu-item key="editor">Editor</a-menu-item>
                                        <a-menu-item key="viewer">Viewer</a-menu-item>
                                    </a-menu>
                                    </template>
                                    <a-button size="small">
                                    {{ getSelectedRole(user.user_id) }}
                                    <DownOutlined />
                                    </a-button>
                                </a-dropdown>

                                 <!-- Trạng thái -->
                                <a-tag :color="getStatusColor(user.status)">
                                    {{ capitalizeFirstLetter(user.status) }}
                                </a-tag>

                                <!-- Nút Lưu khi có thay đổi -->
                                <a-button
                                    v-if="hasRoleChanged(user)"
                                    type="primary"
                                    size="small"
                                    @click="saveRoleChange(user)"
                                >
                                    Lưu
                                </a-button>

                                <!-- Nút Xoá người dùng -->
                                <a-button type="text" size="small" @click="removeUser(user)">
                                    <DeleteOutlined />
                                </a-button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="p-4 text-center text-gray-500">
                        This tag is not shared with anyone
                    </div>
                </div>
            </div>

        </div>
    </a-modal>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref, reactive } from 'vue';
import axios from 'axios';
import {
    EditOutlined,
    TagOutlined,
    TeamOutlined,
    UserAddOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    DownOutlined
} from '@ant-design/icons-vue';

const tempRoles = reactive({});

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("access_token");

const props = defineProps({
    open: Boolean,  // changed from `visible` to `open`
    selectedCalendarId: Number
});

const emit = defineEmits(['update:open', 'edit', 'delete', 'share', 'changeRole', 'removeUser']); // changed from 'update:visible' to 'update:open'
const tagData = ref({
    id: 0,
    uuid: '',
    user_id: 0,
    name: '',
    description: null,
    color_code: '#1890ff',
    shared_user: [],
    created_at: '',
    updated_at: ''
});

watch(
    () => [props.selectedCalendarId, props.open],
    async ([id, open]) => {
        if (id && open) {
            await fetchCalendarDetail(id);
        }
    },
    { immediate: true }
);

const onSelectRole = (user, selectedRole) => {
  tempRoles[user.user_id] = selectedRole;
};

const hasRoleChanged = (user) => {
  return tempRoles[user.user_id] && tempRoles[user.user_id] !== user.role;
};

const getSelectedRole = (userId) => {
//   return tempRoles[userId] || getUserById(userId)?.role || 'viewer';
};
const saveRoleChange = (user) => {
  const newRole = tempRoles[user.user_id];
  emit('changeRole', {
    tagId: tagData.value.id,
    userId: user.user_id,
    newRole,
  });

  delete tempRoles[user.user_id];
};

const fetchCalendarDetail = async (calendarId) => {
    try {
        const res = await axios.get(`${dirApi}tags/${calendarId}/show`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        tagData.value = res.data.data.tag;
        console.log("Chi tiết tag calendar:", tagData.value);
    } catch (error) {
        console.log("Lỗi khi lấy chi tiết tag calendar:", error);
    }
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const getInitials = (firstName, lastName) => {
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Get role color
const getRoleColor = (role) => {
    switch (role) {
        case 'admin':
            return 'red';
        case 'editor':
            return 'blue';
        case 'viewer':
            return 'green';
        default:
            return 'default';
    }
};

// Get status color
const getStatusColor = (status) => {
    switch (status) {
        case 'active':
            return 'green';
        case 'pending':
            return 'orange';
        case 'rejected':
            return 'red';
        default:
            return 'default';
    }
};

// Handle cancel
const handleCancel = () => {
    emit('update:open', false);  // changed from `update:visible`
};

// Handle edit
const handleEdit = () => {
    emit('edit', props.tagData);
};

// Handle delete
const handleDelete = () => {
    emit('delete', props.tagData.id);
    emit('update:open', false);  // changed from `update:visible`
};

// Handle share
const handleShare = () => {
    emit('share', props.tagData);
};

// Change role
const changeRole = (user) => {
    emit('changeRole', { tagId: props.tagData.id, userId: user.user_id, currentRole: user.role });
};

// Remove user
const removeUser = (user) => {
    emit('removeUser', { tagId: props.tagData.id, userId: user.user_id });
};
</script>

<style scoped>
.tag-detail-modal :deep(.ant-modal-content) {
    border-radius: 12px;
    overflow: hidden;
}

.tag-detail-modal :deep(.ant-modal-header) {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
}

.tag-detail-modal :deep(.ant-modal-body) {
    padding: 0;
}
</style>
