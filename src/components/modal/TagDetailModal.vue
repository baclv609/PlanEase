<template>
    <a-modal :open="open" :title="$t('event.tag_name')" @cancel="handleCancel" :maskClosable="false"
        class="tag-detail-modal" :width="600">
        <div class="px-4 pt-4">
            <!-- Tag Header -->
            <div class="flex items-center mb-6">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full" :style="{ backgroundColor: tagData.color_code }"></div>
                    <div class="text-xl font-medium">{{ tagData.name }}</div>
                </div>
                <!-- <div class="ml-auto">
                    <a-button type="primary" size="small" @click="handleEdit">
                        <template #icon>
                            <EditOutlined />
                        </template>
                        {{ $t('event.edit') }}
                    </a-button>
                </div> -->
            </div>
            <div class="space-y-2 mb-6" v-if="tagData.description">
                <div class="font-medium">Mô tả:</div>
                <p class="text-sm text-muted-foreground">{{tagData.description || 'No description provided'}}</p>
            </div>
         
            <!-- Shared Users -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium flex items-center">
                        <TeamOutlined class="mr-1" />
                        {{ $t('event.invitees') }}
                    </h4>
                    <div>
                        <a-button v-if="tagData.is_owner" type="text" @click="toggleEmailInput">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                        </a-button>

                        <!-- <a-button type="link" @click="shareViaLink">
                            <CopyOutlined />
                        </a-button> -->
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg">
                    <!-- Invite by Email -->
                    <div v-if="showEmailInput" class="my-1 w-full pb-2">
                        <a-select show-search :placeholder="$t('event.guests')" :options="state.data"
                            :filter-option="false" :loading="state.fetching" @search="fetchUser" 
                            @select="handleUserSelect" :value="null" class="w-full mb-2"
                            :autofocus="true">
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


                <div class="list-user-tag">
                    <!-- chủ sở hữu -->
                    <div class="flex items-center p-3 border-b bg-gray-50 rounded-t">
                        <a-avatar
                            :src="tagData.owner.avatar ? tagData.owner.avatar : null"
                            :style="{ backgroundColor: !tagData.owner.avatar ? '#1890ff' : 'transparent' }"
                        >
                            {{ !tagData.owner.avatar ? getInitials(tagData.owner.first_name, tagData.owner.last_name) : '' }}
                        </a-avatar>

                        <div class="ml-3">
                            <div class="font-medium text-sm">
                            {{ tagData.owner.first_name }} {{ tagData.owner.last_name }}
                            <span class="ml-1 text-xs text-blue-500">({{ $t('tag.owner') }})</span>
                            </div>
                            <div class="text-xs text-gray-500">{{ tagData.owner.email }}</div>
                        </div>
                        <a-tag v-if="tagData.is_owner" class="ml-auto" color="blue">
                            {{ tagData.owner.user_id === user.id ?  $t('tag.you') : $t('tag.owner') }}
                        </a-tag>
                    </div>

                    <div v-if="tagData.shared_user && tagData.shared_user.length > 0">
                    
                        <div v-for="(user, index) in tagData.shared_user" :key="index"
                            class="flex items-center p-3 border-b last:border-b-0">
                            <a-avatar :src="user.avatar ? `${user.avatar}` : null"
                                :style="{ backgroundColor: !user.avatar ? '#1890ff' : 'transparent' }">
                                {{ !user.avatar ? getInitials(user.first_name, user.last_name) : '' }}
                            </a-avatar>

                            <div class="ml-3">
                                <div class="font-medium">
                                    {{ user.first_name }} {{ user.last_name }}
                                    <span v-if="user.user_id === currentUser.id" class="ml-1">
                                        <!-- <a-tag size="small" color="green">{{ $t('tag.you') }}</a-tag> -->
                                        <span class="ml-1 text-xs text-blue-500">({{ $t('tag.you') }})</span>
                                    </span>
                                </div>
                                <div class="text-xs text-gray-500">{{ user.email }}</div>
                            </div>
                            

                            <div class="ml-auto flex items-center">
                                <a-dropdown v-if="tagData.is_owner" :trigger="['click']">
                                    <template #overlay>
                                        <a-menu>
                                            <a-menu-item key="editor"
                                                @click="() => handleRoleChange(user, 'editor')">{{ $t('event.roles.editor') }}</a-menu-item>
                                            <a-menu-item key="viewer"
                                                @click="() => handleRoleChange(user, 'viewer')">{{ $t('event.roles.viewer') }}</a-menu-item>
                                        </a-menu>
                                    </template>
                                    <a-button v-if="tagData.is_owner" type="text" size="small">
                                        {{ user.role === 'editor' ? $t('event.roles.editor') : $t('event.roles.viewer') }}
                                        <CaretDownOutlined />
                                    </a-button>
                                </a-dropdown>
                                <a-tag :color="getStatusColor(user.status)" class="ml-2">
                                    {{ user.status === 'pending' ? $t('event.status.pending') : $t('event.status.yes') }}
                                </a-tag>

                                <!-- <a-dropdown v-if="tagData.is_owner" :trigger="['click']">
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
                                </a-dropdown> -->

                                <a-button v-if="tagData.is_owner" type="text" danger size="small" class="ml-2" @click="() => showDeleteConfirm(user)">
                                        <DeleteOutlined />
                                </a-button>
                            </div>
                        </div>
                    </div>
                </div>

                      

                    <div v-if="!tagData.shared_user && tagData.shared_user.length == 0" class="p-4 text-center text-gray-500">
                        {{ $t('event.error.fetch_shared_tags') }}
                    </div>
                      <!-- Invited Users List -->
                      <div v-if="invitedUsers.length > 0" class="mb-6">
                        <h4 class="text-sm font-medium mb-3">{{ $t('event.guests') }}</h4>
                        <div class="bg-gray-50 rounded-lg list-user-invitedUsersTag">
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
                                            {{ user.role === 'editor' ? $t('event.roles.editor') : $t('event.roles.viewer') }}
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
            <div v-if="tagData.is_owner && hasChanges" class="flex justify-end">
                <a-button type="primary" size="small" @click="saveChanges">
                    {{ $t('profile.save') }}
                </a-button>
            </div>
        </template>
    </a-modal>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref, computed, reactive, h } from 'vue';
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
const user = JSON.parse(localStorage.getItem('user') || '{}');
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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
    updated_at: '',
    is_owner: false,
    owner: []
});
const is_owner = ref()
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
    // const user = JSON.parse(localStorage.getItem('user'));
    // console.log("user", user);

    try {
        const res = await axios.get(`${dirApi}tags/${calendarId}/show`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("res.data.data", res.data.data);
        tagData.value = {
            ...res.data.data.tag,
            invite_link: res.data.data.invite_link,
            is_owner: res.data.data.is_owner,
            owner: res.data.data.owner
        };
        // console.log(tagData.value.owner);
        originalTagData.value = JSON.parse(JSON.stringify(tagData.value));
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
        case 'yes':
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
            message.success(t('tag.invite.userRemoved'));
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
    if (tagData.value && tagData.value.uuid) {
        const inviteLink = `${window.location.origin}/calendar/tag/${tagData.value.uuid}/invite`;
        
        navigator.clipboard.writeText(inviteLink)
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
            message.info(t('tag.noNewUsers'));
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
        message.warning(t('tag.userAlreadyInTag'));
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
        if(response.data.code === 409){
            message.error('Chủ sở hữu đã có thẻ có tên này');
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
            // message.success("Xóa người dùng khỏi tag thành công");
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
    Modal.confirm({
        title: t('tag.deleteConfirm'),
        content: t('tag.deleteWarning'),
        okText: t('common.delete'),
        okType: 'danger',
        cancelText: t('common.cancel'),
        async onOk() {
            try {
                Modal.confirm({
                    title: t('tag.keepTasksTitle'),
                    content: h('div', [
                        h('div', { class: 'mb-3' }, [
                            h('label', { class: 'flex items-center cursor-pointer' }, [
                                h('input', {
                                    type: 'radio',
                                    name: 'taskOption',
                                    value: 'keep',
                                    class: 'mr-2'
                                }),
                                t('tag.keepTasks')
                            ])
                        ]),
                        h('div', [
                            h('label', { class: 'flex items-center cursor-pointer' }, [
                                h('input', {
                                    type: 'radio',
                                    name: 'taskOption',
                                    value: 'delete',
                                    class: 'mr-2'
                                }),
                                t('tag.deleteTasks')
                            ])
                        ])
                    ]),
                    okText: t('common.confirm'),
                    cancelText: t('common.cancel'),
                    async onOk() {
                        const selectedOption = document.querySelector('input[name="taskOption"]:checked')?.value;
                        if (selectedOption === 'keep') {
                            await deleteSharedUser(user, true);
                        } else if (selectedOption === 'delete') {
                            await deleteSharedUser(user, false);
                        } else {
                            message.warning(t('tag.selectOption', 'Please select an option'));
                            return Promise.reject();
                        }
                    }
                });
            } catch (error) {
                console.error('Error showing keep tasks confirm:', error);
            }
        }
    });
};


const deleteSharedUser = async (user, keepInTasks) => {
    try {
        const response = await axios.delete(
            `${dirApi}tags/${props.selectedCalendarId}/shared-user/${user.user_id}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                data: { keep_in_tasks: keepInTasks }  // gửi kèm body
            }
        );

        if (response.data.code === 200) {
            // message.success("Xóa người dùng khỏi tag thành công");
            message.success(t('tag.invite.userRemoved'));
            await fetchCalendarDetail(props.selectedCalendarId);
        }
    } catch (error) {
        console.error('Error removing user:', error);
        message.error(t('errors.failedToRemoveUser'));
    }
};


// Function to remove user from invited list
const removeInvitedUser = (user) => {
    const index = invitedUsers.value.findIndex(u => u.value === user.value);
    if (index !== -1) {
        invitedUsers.value.splice(index, 1);
        // message.success('Đã xóa người dùng khỏi danh sách mời');
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
.list-user-tag {
    border: 1px solid #f0f0f0;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 8px;
    /* overflow: hidden; */
}
.list-user-invitedUsersTag {
    max-height: 200px;
    overflow-y: auto; 
}

/* scoll */
.list-user-tag,
.list-user-invitedUsersTag {
    border: 1px solid #f0f0f0;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 8px;
    scrollbar-width: thin;
    scrollbar-color: #d1d5db transparent;
}

/* Webkit browsers (Chrome, Safari, etc.) */
.list-user-tag::-webkit-scrollbar,
.list-user-invitedUsersTag::-webkit-scrollbar {
    width: 6px;
}

.list-user-tag::-webkit-scrollbar-track,
.list-user-invitedUsersTag::-webkit-scrollbar-track {
    background: transparent;
}

.list-user-tag::-webkit-scrollbar-thumb,
.list-user-invitedUsersTag::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 3px;
}

.list-user-tag::-webkit-scrollbar-thumb:hover,
.list-user-invitedUsersTag::-webkit-scrollbar-thumb:hover {
    background-color: #9ca3af;
}

/* Smooth scrolling */
.list-user-tag,
.list-user-invitedUsersTag {
    scroll-behavior: smooth;
}

/* Hover effect for list items */
.list-user-tag > div:hover,
.list-user-invitedUsersTag > div:hover {
    background-color: #f9fafb;
}
</style>
