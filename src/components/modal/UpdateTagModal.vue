<template>
  <a-modal 
    :open="open" 
    :title="t('calendar.updateTag')" 
    @ok="handleUpdateOk" 
    :confirm-loading="confirmLoading"
    @update:open="$emit('update:open', $event)"
    :ok-text="t('common.save')"
    :cancel-text="t('common.cancel')"
  >
    <a-form layout="vertical" :model="formState" :rules="rules" ref="formRef">
      <div class="flex gap-4">
        <!-- Input: Chiếm phần lớn không gian -->
        <div class="flex-1">
          <a-form-item :label="t('calendar.tagName')" name="name" required>
            <a-input v-model:value="formState.name" :placeholder="t('calendar.enterTagName')" />
          </a-form-item>
        </div>

        <div class="w-[65px]">
          <a-form-item :label="t('calendar.colorHex')" name="color_code">
            <a-select v-model:value="formState.color_code" :dropdown-match-select-width="false"
              :dropdown-style="{ padding: '8px' }" style="width: 100%">
              <template #dropdownRender>
                <div class="grid grid-cols-5 gap-2 p-1">
                  <div v-for="color in colorOptions" :key="color.value"
                    class="w-6 h-6 rounded-full cursor-pointer relative border-2 transition duration-200" :class="{
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
                  <span class="w-2 h-4 rounded-full mr-2" :style="{ backgroundColor: color.value }"></span>
                </div>
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>
      </div>

      <a-form-item :label="t('common.description')" name="description">
        <a-textarea v-model:value="formState.description" :placeholder="t('calendar.enterTagDescription')" :rows="3" />
      </a-form-item>

      <div class="bg-gray-50 rounded-lg">
        <!-- Invite by Email -->
        <a-select v-if="formState.is_owner" show-search :placeholder="$t('event.guests')" :options="state.data" :filter-option="false"
          :loading="state.fetching" @search="fetchUser" @select="handleUserSelect" :value="null" class="w-full">
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
        <div class="list-user-tag" v-if="formState.shared_user && formState.shared_user.length > 0">
          <div v-for="(user, index) in formState.shared_user" :key="index"
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
              <div v-if="formState.is_owner">
                <a-dropdown  :trigger="['click']">
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="editor" @click="() => handleRoleChange(user, 'editor')">{{
                        $t('event.roles.editor') }}</a-menu-item>
                      <a-menu-item key="viewer" @click="() => handleRoleChange(user, 'viewer')">{{
                        $t('event.roles.viewer') }}</a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="text" size="small">
                    {{ user.role === 'editor' ? $t('event.roles.editor') : $t('event.roles.viewer') }}
                    <CaretDownOutlined />
                  </a-button>
                </a-dropdown>
              </div>
              <span v-else>{{ user.role === 'editor' ? $t('event.roles.editor') : $t('event.roles.viewer') }}</span>
              <a-tag :color="getStatusColor(user.status)" class="ml-2">
                {{ user.status === 'pending' ? $t('event.status.pending') : $t('event.status.yes') }}
              </a-tag>
              <a-button v-if="formState.is_owner" type="text" danger size="small" class="ml-2" @click="() => showDeleteConfirm(user)">
                 <DeleteOutlined />
               </a-button>

            </div>
          </div>
        </div>



        <div v-else class="p-4 text-center text-gray-500">
          {{ $t('event.error.fetch_shared_tags') }}
        </div>
        <!-- Invited Users List -->
        <div v-if="invitedUsers.length > 0" class="mb-6">
          <h4 class="text-sm font-medium mb-3">{{ $t('event.guests') }}</h4>
          <div class="bg-gray-50 rounded-lg list-user-invitedUsersTag">
            <div v-for="user in invitedUsers" :key="user.value" class="flex items-center p-3 border-b last:border-b-0 ">
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
                      <a-menu-item key="editor" @click="() => changeUserRole(user, 'editor')">{{
                        $t('event.roles.editor') }}</a-menu-item>
                      <a-menu-item key="viewer" @click="() => changeUserRole(user, 'viewer')">{{
                        $t('event.roles.viewer') }}</a-menu-item>
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
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, h } from 'vue';
import { CaretDownOutlined, CheckOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { message, Modal } from "ant-design-vue";
import { Form } from 'ant-design-vue';
import { debounce } from 'lodash';

const { t } = useI18n();
const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  tag: {
    type: Object,
    required: true
  }
});

const confirmLoading = ref(false);

const formRef = ref();
const formState = ref({
  id: 0,
  name: '',
  uuid: '',
  color_code: '#FF5733',
  description: '',
  shared_user: [],
  owner: {},
  is_owner: false
});

const state = ref({
  data: [],
  fetching: false,
});

const selectedUsers = ref([]);
const invitedUsers = ref([]);

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

const emit = defineEmits(['update:open', 'tagUpdated']);

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("access_token");

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
  { value: '#34495E', label: 'Dark Blue' }
];

// First, add a function to reset the state
const resetModalState = () => {
  state.value.data = [];
  state.value.fetching = false;
  invitedUsers.value = [];
};

// Update the watch function for modal open/close
watch(
  () => props.open,
  async (newVal) => {
    if (newVal && props.tag?.id) {
      try {
        const response = await axios.get(`${dirApi}tags/${props.tag.id}/show`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.code === 200) {
          const tag = response.data.data.tag;
          formState.value = {
            id: tag.id,
            name: tag.name,
            color_code: tag.color_code,
            description: tag.description,
            shared_user: tag.shared_user,
            owner: response.data.data.owner,
            is_owner: response.data.data.is_owner
          };
        } else {
          message.error(t('errors.failedToFetchTag'));
        }
      } catch (error) {
        message.error(t('errors.failedToFetchTag'));
      }
    } else {
      // Reset form and state when modal closes
      formState.value = {
        name: '',
        color_code: '#FF5733',
        description: '',
      };
      formRef.value?.resetFields();
      resetModalState();
    }
  }
);

// Update the handleUpdateOk function
const handleUpdateOk = async () => {

  if (confirmLoading.value) return; // Nếu đang xử lý thì không làm gì
  confirmLoading.value = true;

  try {
    await formRef.value.validate();

    const shared_users = [
      ...formState.value.shared_user.map(user => ({
        user_id: user.user_id,
        role: user.role,
        status: user.status
      })),
      ...invitedUsers.value.map(user => ({
        user_id: user.value,
        role: user.role,
        status: 'pending'
      }))
    ];

    const response = await axios.put(
      `${dirApi}tags/${formState.value.id}`,
      {
        name: formState.value.name,
        description: formState.value.description,
        color_code: formState.value.color_code,
        shared_user: shared_users,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.code === 200) {
      emit('tagUpdated', response.data.data);
      message.success(t("event.success.tag_updated"));
      emit('update:open', false);
      
      // Reset form and state after successful update
      formState.value = {
        name: '',
        color_code: '#FF5733',
        description: '',
      };
      resetModalState();
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 409) {
        message.error(t('errors.tagExists'));
      } else {
        message.error(t('errors.failedToUpdateTag'));
      }
    } else if (!error.errorFields) {
      message.error('Không thể kết nối đến máy chủ!');
    }
  } finally {
    confirmLoading.value = false; // Bỏ lock sau khi xử lý xong
  }
};

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
const changeUserRole = (user, newRole) => {
  const index = invitedUsers.value.findIndex(u => u.value === user.value);
  if (index !== -1) {
    invitedUsers.value[index].role = newRole;
  }
};
const handleUserSelect = (userId) => {
  const user = state.value.data.find(u => u.value === userId);
  if (!user) return;

  // Check if user is already in the tag
  const isAlreadyInTag = formState.value.shared_user.some(u => u.user_id === user.value) ||
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
      ...formState.value.shared_user.map(user => user.user_id),
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
const removeInvitedUser = (user) => {
  const index = invitedUsers.value.findIndex(u => u.value === user.value);
  if (index !== -1) {
    invitedUsers.value.splice(index, 1);
    // message.success('Đã xóa người dùng khỏi danh sách mời');
  }
};
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};
const getInitials = (firstName, lastName) => {
  return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
};
const handleRoleChange = (user, newRole) => {
    user.role = newRole;
    user.roleChanged = true;
};


const showDeleteConfirm = async (user) => {
    const contentMessage = t('tag.contentMessage');

    Modal.confirm({
        title: t('options.recurrence.delete.confirm'),
        content: contentMessage,
        okText: t('options.recurrence.delete.delete'),
        okType: 'danger',
        cancelText: t('options.recurrence.delete.cancel'),
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
                                t('tag.deleteTask')
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
                            message.warning('Vui lòng chọn một tùy chọn');
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
            `${dirApi}tags/${formState.value.id}/shared-user/${user.user_id}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                data: { keep_in_tasks: keepInTasks }
            }
        );

        if (response.data.code === 200) {
            // message.success("Xóa người dùng khỏi tag thành công");
            // Refresh the tag data
            const tagResponse = await axios.get(`${dirApi}tags/${formState.value.id}/show`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (tagResponse.data.code === 200) {
                const tag = tagResponse.data.data.tag;
                formState.value = {
                    ...formState.value,
                    shared_user: tag.shared_user,
                };
            }
        }
    } catch (error) {
        console.error('Error removing user:', error);
        message.error(t('errors.failedToRemoveUser'));
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