<template>
    <a-modal :open="open" :title="$t('event.tag_name')" @cancel="handleCancel" :maskClosable="false"
        class="tag-detail-modal" :width="600">
        <div class="px-4 pt-4">
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
                        {{ $t('event.edit') }}
                    </a-button>
                </div>
            </div>

            <!-- Tag Information
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
            </div>  -->

            <!-- Shared Users -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium flex items-center">
                        <TeamOutlined class="mr-1" />
                        {{ $t('event.invitees') }}
                    </h4>
                    <div>
                        <a-button type="text" @click="toggleEmailInput">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                        </a-button>

                        <a-button type="link" @click="shareViaLink">
                            <CopyOutlined />
                        </a-button>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg">
                    <!-- Invite by Email -->
                    <div v-if="showEmailInput" class="my-1 w-full pb-2">
                        <a-select show-search :placeholder="$t('event.guests')" :options="state.data"
                            :filter-option="false" :loading="state.fetching" @search="fetchUser"
                            @select="handleUserSelect" :value="null" class="w-full">
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

                            <div class="ml-auto flex items-center">
                                <a-dropdown :trigger="['click']">
                                    <template #overlay>
                                        <a-menu>
                                            <a-menu-item key="editor"
                                                @click="() => handleRoleChange(user, 'editor')">{{ $t('event.roles.editor') }}</a-menu-item>
                                            <a-menu-item key="viewer"
                                                @click="() => handleRoleChange(user, 'viewer')">{{ $t('event.roles.viewer') }}</a-menu-item>
                                        </a-menu>
                                    </template>
                                    <a-button type="text" size="small">
                                        {{ capitalizeFirstLetter(user.role) }}
                                        <CaretDownOutlined />
                                    </a-button>
                                </a-dropdown>
                                <a-tag :color="getStatusColor(user.status)" class="ml-2">{{
                                    capitalizeFirstLetter(user.status)
                                }}</a-tag>
                                <!-- <a-button type="text" danger size="small" class="ml-2"
                                    @click="() => showDeleteConfirm(user)">
                                    <DeleteOutlined />
                                </a-button> -->

                                <a-dropdown :trigger="['click']">
                                    <template #overlay>
                                        <a-menu>
                                            <a-menu-item key="transfer" @click="() => handleTransferOwnership(user)">
                                                {{ $t('options.participants.leave.title') }}
                                            </a-menu-item>
                                            <a-menu-divider />
                                            <a-menu-item key="remove" danger @click="() => showDeleteConfirm(user)">
                                                {{ $t('event.delete') }}
                                            </a-menu-item>
                                        </a-menu>
                                    </template>
                                    <a-button type="text" size="small">
                                        <MoreOutlined />
                                    </a-button>
                                </a-dropdown>
                            </div>
                        </div>
                    </div>

                      

                    <div v-else class="p-4 text-center text-gray-500">
                        {{ $t('event.error.fetch_shared_tags') }}
                    </div>
                      <!-- Invited Users List -->
                      <div v-if="invitedUsers.length > 0" class="mb-6">
                        <h4 class="text-sm font-medium mb-3">{{ $t('event.guests') }}</h4>
                        <div class="bg-gray-50 rounded-lg">
                            <div v-for="user in invitedUsers" :key="user.value"
                                class="flex items-center p-3 border-b last:border-b-0">
                                <a-avatar :src="user.avatar" :size="32"
                                    :style="{ backgroundColor: !user.avatar ? '#1890ff' : 'transparent' }">
                                    {{ !user.avatar ? getInitials(user.first_name, user.last_name) : '' }}
                                </a-avatar>

                                <div class="ml-3">
                                    <div class="font-medium">{{ user.first_name }} {{ user.last_name }}</div>
                                    <div class="text-xs text-gray-500">{{ user.label }}</div>
                                </div>

                                <div class="ml-auto flex items-center">
                                    <a-dropdown :trigger="['click']">
                                        <template #overlay>
                                            <a-menu>
                                                <a-menu-item key="editor"
                                                    @click="() => changeUserRole(user, 'editor')">{{ $t('event.roles.editor') }}</a-menu-item>
                                                <a-menu-item key="viewer"
                                                    @click="() => changeUserRole(user, 'viewer')">{{ $t('event.roles.viewer') }}</a-menu-item>
                                            </a-menu>
                                        </template>
                                        <a-button type="text" size="small">
                                            {{ capitalizeFirstLetter(user.role) }}
                                            <CaretDownOutlined />
                                        </a-button>
                                    </a-dropdown>
                                    <a-button type="text" danger size="small" class="ml-2" @click="() => removeInvitedUser(user)">
                                        <DeleteOutlined />
                                    </a-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <template #footer>
            <div v-show="hasChanges" class="flex justify-end">
                <a-button type="primary" size="small" @click="saveChanges">
                    {{ $t('profile.save') }}
                </a-button>
            </div>
        </template>
    </a-modal>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { PlusOutlined, MoreOutlined, CaretDownOutlined , CopyOutlined} from '@ant-design/icons-vue';

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
import { debounce } from 'lodash';
import { message, Modal } from 'ant-design-vue';

const { t } = useI18n();

const tempRoles = reactive({});

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("access_token");

const props = defineProps({
    open: Boolean,  
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
    invite_link: '',
    created_at: '',
    updated_at: ''
});

// Track original data for comparison
const originalTagData = ref(null);

const showEmailInput = ref(false);
const inviteEmail = ref('');

const anyRoleChanged = computed(() => tagData.value.shared_user.some(user => user.roleChanged));

const state = ref({
    data: [],
    fetching: false,
});

const selectedUsers = ref([]);
const invitedUsers = ref([]);

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
        console.log("API Response:", res.data);
        tagData.value = {
            ...res.data.data.tag,
            invite_link: res.data.data.invite_link
        };
        // Store original data when fetching
        originalTagData.value = JSON.parse(JSON.stringify(tagData.value));
        console.log("Tag data after fetch:", tagData.value);
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


// Change role
const handleRoleChange = (user, newRole) => {
    user.role = newRole;
    user.roleChanged = true;
};

const saveAllRoleChanges = () => {
    tagData.value.shared_user.forEach(user => {
        if (user.roleChanged) {
            emit('changeRole', { tagId: props.tagData.id, userId: user.user_id, newRole: user.role });
            user.roleChanged = false;
        }
    });
};
const handleEdit = () => {
    console.log("Edit tag");
};
// Remove user
const removeUser = async (user) => {
    try {
        // Create new shared_users array without the removed user
        const shared_users = tagData.value.shared_user
            .filter(u => u.user_id !== user.user_id)
            .map(u => ({
                user_id: u.user_id,
                role: u.role,
                status: u.status
            }));

        const response = await axios.put(
            `${dirApi}tags/${props.selectedCalendarId}`,
            {
                name: tagData.value.name,
                color_code: tagData.value.color_code,
                description: tagData.value.description,
                shared_user: shared_users
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data.code === 200) {
            message.success('Đã xóa người dùng thành công');
            // Refresh the tag data
            await fetchCalendarDetail(props.selectedCalendarId);
        }
    } catch (error) {
        console.error('Error removing user:', error);
        message.error('Xóa người dùng thất bại');
    }
};

const toggleEmailInput = () => {
    showEmailInput.value = !showEmailInput.value;
};

const shareViaLink = () => {
    console.log("Current tag data:", tagData.value);
    if (tagData.value && tagData.value.invite_link) {
        navigator.clipboard.writeText(tagData.value.invite_link)
            .then(() => {
                message.success(t('share.link.copySuccess'));
            })
            .catch(() => {
                message.error(t('share.link.copyError'));
            });
    } else {
        message.warning(t('event.error.fetch_shared_tags'));
    }
};

const fetchUser = debounce(async (value) => {
    if (!value) {
        state.value.data = [];
        return;
    }

    state.value.fetching = true;

    try {
        const response = await axios.get(`${dirApi}guest?search=${value}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Filter out users who are already in the tag
        const existingUserIds = new Set([
            ...tagData.value.shared_user.map(user => user.user_id),
            ...invitedUsers.value.map(user => user.value)
        ]);

        state.value.data = response.data.data
            .filter(user => !existingUserIds.has(user.id))
            .map((user) => ({
                label: user.email,
                value: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                avatar: user.avatar
            }));

        if (state.value.data.length === 0) {
            message.info('No new users found or all users are already in this tag');
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        state.value.data = [];
    } finally {
        state.value.fetching = false;
    }
}, 300);

const handleUserSelect = (userId) => {
    const user = state.value.data.find(u => u.value === userId);
    if (!user) return;

    // Check if user is already in the tag
    const isAlreadyInTag = tagData.value.shared_user.some(u => u.user_id === user.value) ||
        invitedUsers.value.some(u => u.value === user.value);

    if (isAlreadyInTag) {
        message.warning('This user is already in the tag');
        return;
    }

    const alreadyAdded = invitedUsers.value.some(u => u.value === user.value);
    if (!alreadyAdded) {
        invitedUsers.value.push({
            ...user,
            role: 'viewer',
            status: 'pending'
        });
    }
};

const changeUserRole = (user, newRole) => {
    const index = invitedUsers.value.findIndex(u => u.value === user.value);
    if (index !== -1) {
        invitedUsers.value[index].role = newRole;
    }
};

const saveChanges = async () => {
    try {
        // Combine existing users and new invited users
        const shared_users = [
            ...tagData.value.shared_user.map(user => ({
                user_id: user.user_id,
                role: user.role,
                status: user.status
            })),
            ...invitedUsers.value.map(user => ({
                user_id: user.value,
                role: user.role,
                status: user.status
            }))
        ];

        console.log('Saving shared users:', shared_users);

        const response = await axios.put(
            `${dirApi}tags/${props.selectedCalendarId}`,
            {
                name: tagData.value.name,
                color_code: tagData.value.color_code,
                description: tagData.value.description,
                shared_user: shared_users
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log('Update response:', response.data);

        if (response.data.code === 200) {
            message.success('Cập nhật thành công');
            
            // Refresh the tag data after successful update
            await fetchCalendarDetail(props.selectedCalendarId);
            
            // Clear the invited users list and hide the email input
            invitedUsers.value = [];
            showEmailInput.value = false;
            
            // Reset any role changes
            tagData.value.shared_user.forEach(user => {
                if (user.roleChanged) {
                    user.roleChanged = false;
                }
            });

            // Update original data after successful save
            originalTagData.value = JSON.parse(JSON.stringify(tagData.value));
        }
    } catch (error) {
        console.error('Error saving invitations:', error);
        message.error('Failed to update tag');
    }
};

// Track changes in the modal
const hasChanges = computed(() => {
    if (!originalTagData.value) return false;

    // Check for role changes in existing users
    const hasRoleChanges = tagData.value.shared_user.some(user => user.roleChanged);

    // Check for new invited users
    const hasNewUsers = invitedUsers.value.length > 0;

    // Check for removed users
    const hasRemovedUsers = originalTagData.value.shared_user.length !== tagData.value.shared_user.length;

    return hasRoleChanges || hasNewUsers || hasRemovedUsers;
});

// Watch for modal open to store original data
watch(() => props.open, async (newVal) => {
    if (newVal) {
        // Store original data when modal opens
        originalTagData.value = JSON.parse(JSON.stringify(tagData.value));
    } else {
        // Reset everything when modal closes
        invitedUsers.value = [];
        showEmailInput.value = false;
        originalTagData.value = null;
        tagData.value.shared_user.forEach(user => {
            if (user.roleChanged) {
                user.roleChanged = false;
            }
        });
    }
});

// Hàm lấy danh sách sự kiện của người dùng trong tag
const getUserEventsInTag = async (user, tagId) => {
    try {
        const res = await axios.get(`${dirApi}events/tag/${tagId}/user/${user.user_id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.code === 200) {
            return res.data.data.events || [];
        }

        return [];
    } catch (err) {
        console.error("Lỗi khi lấy danh sách sự kiện:", err);
        return [];
    }
};
// Hàm xoá user khỏi tag
const removeUserFromTag = async (user, tagId) => {
    try {
        const shared_users = tagData.value.shared_user
            .filter(u => u.user_id !== user.user_id)
            .map(u => ({
                user_id: u.user_id,
                role: u.role,
                status: u.status
            }));

        const res = await axios.put(
            `${dirApi}tags/${tagId}`,
            {
                name: tagData.value.name,
                color_code: tagData.value.color_code,
                description: tagData.value.description,
                shared_user: shared_users
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (res.data.code === 200) {
            message.success("Xóa người dùng khỏi tag thành công");
            await fetchCalendarDetail(tagId);
        }
    } catch (err) {
        console.error("Lỗi khi xoá user khỏi tag:", err);
        message.error("Xóa người dùng thất bại");
    }
};

// Hàm xóa user khỏi các sự kiện liên quan
const removeUserFromEvents = async (user, events = []) => {
    try {
        const promises = events.map(event =>
            axios.put(`${dirApi}events/${event.id}/remove-user`, {
                user_id: user.user_id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
        );

        await Promise.all(promises);

        message.success(`Đã gỡ ${user.first_name} khỏi ${events.length} sự kiện liên quan`);
    } catch (err) {
        console.error("Lỗi khi xoá user khỏi các sự kiện:", err);
        message.error("Gỡ khỏi sự kiện thất bại");
    }
};



const showDeleteConfirm = async (user) => {
    const relatedEvents = await getUserEventsInTag(user, props.selectedCalendarId);

    let contentMessage = t('options.recurrence.delete.confirm_content');
    if (relatedEvents.length > 0) {
        contentMessage += '\n\n' + t('options.recurrence.delete.confirm_content');
    }

    Modal.confirm({
        title: t('options.recurrence.delete.confirm'),
        content: contentMessage,
        okText: t('options.recurrence.delete.delete'),
        okType: 'danger',
        cancelText: t('options.recurrence.delete.cancel'),
        async onOk() {
            await removeUserFromTag(user, props.selectedCalendarId);

            if (relatedEvents.length > 0) {
                await removeUserFromEvents(user, relatedEvents);
            }
        }
    });
};

// Function to remove user from invited list
const removeInvitedUser = (user) => {
    const index = invitedUsers.value.findIndex(u => u.value === user.value);
    if (index !== -1) {
        invitedUsers.value.splice(index, 1);
        message.success('Đã xóa người dùng khỏi danh sách mời');
    }
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
