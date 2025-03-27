<template>
  <a-drawer
    :width="980"
    :open="open"
    @close="onClose"
    placement="right"
    class="profile-drawer"
    :closable="false"
  >
    <template #title>
      <div class="drawer-title">
        <div class="title-left">
          <UserOutlined />
          <span>Thông tin cá nhân</span>
        </div>
        <a-button type="text" @click="onClose" class="close-button">
          <CloseOutlined />
        </a-button>
  </div>
</template>

    <div class="profile-container">
      <a-card :bordered="false" class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <a-avatar 
                :src="user.avatar || unknowUser" 
                class="user-avatar"
              />
              <div class="avatar-overlay">
                <a-upload 
                  v-model:file-list="fileList" 
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  :show-upload-list="false"
                >
                  <CameraOutlined class="camera-icon" />
                </a-upload>
              </div>
            </div>
            <div class="user-status">
              <a-badge status="success" text="Online" />
            </div>
          </div>

          <div class="user-details">
            <div class="name-section">
              <h2>{{ user.first_name }} {{ user.last_name }}</h2>
              <a-tag color="blue" class="role-tag">
                <CrownOutlined /> Administrator
              </a-tag>
            </div>
            <div class="contact-info">
              <div class="info-item">
                <div class="info-icon">
                  <MailOutlined />
                </div>
                <div class="info-content">
                  
                  <a :href="'mailto:' + user.email">{{ user.email }}</a>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <PhoneOutlined />
                </div>
                <div class="info-content">
                  
                  <a :href="'tel:' + user.phone">{{ user.phone || 'Chưa cập nhật' }}</a>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <HomeOutlined />
                </div>
                <div class="info-content">
                  
                  <span>{{ user.address || 'Chưa cập nhật' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <a-tabs v-model:activeKey="activeTab" class="profile-tabs">
        <a-tab-pane key="1">
          <template #tab>
            <span class="tab-label">
              <ProfileOutlined />
              Thông tin chung
            </span>
          </template>
          <a-form layout="vertical" class="profile-form">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Tên" class="form-item">
                  <a-input 
                    v-model:value="user.first_name" 
                    :class="{'error-input': errors.first_name}"
                    placeholder="Nhập tên"
                  />
                  <div class="error-message" v-if="errors.first_name">
                    {{ errors.first_name[0] }}
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Họ" class="form-item">
                  <a-input 
                    v-model:value="user.last_name" 
                    :class="{'error-input': errors.last_name}"
                    placeholder="Nhập họ"
                  />
                  <div class="error-message" v-if="errors.last_name">
                    {{ errors.last_name[0] }}
                  </div>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Giới tính" class="form-item">
                  <a-select 
                    v-model:value="user.gender"
                    placeholder="Chọn giới tính"
                  >
                    <a-select-option value="male">Nam</a-select-option>
                    <a-select-option value="female">Nữ</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Số điện thoại" class="form-item">
                  <a-input 
                    v-model:value="user.phone" 
                    :class="{'error-input': errors.phone}"
                    placeholder="Nhập số điện thoại"
                  />
                  <div class="error-message" v-if="errors.phone">
                    {{ errors.phone[0] }}
                  </div>
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="Địa chỉ" class="form-item">
              <a-input 
                v-model:value="user.address" 
                :class="{'error-input': errors.address}"
                placeholder="Nhập địa chỉ"
              />
              <div class="error-message" v-if="errors.address">
                {{ errors.address[0] }}
              </div>
            </a-form-item>

            <div class="form-actions">
              <a-button 
                type="default" 
                @click="onClose"
                class="cancel-button"
              >
                <template #icon><CloseOutlined /></template>
                Hủy
              </a-button>
              <a-button 
                type="primary" 
                @click="saveChanges" 
                :loading="isLoading"
                class="save-button"
              >
                <template #icon><SaveOutlined /></template>
                Lưu thay đổi
              </a-button>
            </div>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { message } from 'ant-design-vue';
import axios from 'axios';
import { 
  CloudUploadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  SaveOutlined,
  CloseOutlined,
  CameraOutlined,
  CrownOutlined,
  ProfileOutlined
} from '@ant-design/icons-vue';
import unknowUser from '@/assets/images/unknow_user.jpg';

const open = ref(false);
const activeTab = ref('1');
const user = ref({});
const isLoading = ref(false);
const fileList = ref([]);
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

const errors = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
});

const openDrawer = () => {
  open.value = true;
  fetchUserProfile();
};

const onClose = () => {
  open.value = false;
};

const fetchUserProfile = async () => {
  try {
    const response = await axios.get(`${dirApi}user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.code === 200) {
      user.value = response.data.data;
    }
  } catch (error) {
    message.error('Không thể lấy thông tin người dùng');
  }
};

const saveChanges = async () => {
  try {
    isLoading.value = true;
    const response = await axios.put(`${dirApi}user/update-profile`,
      {
        first_name: user.value.first_name,
        last_name: user.value.last_name,
        gender: user.value.gender,
        address: user.value.address,
        phone: user.value.phone,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.code === 200) {
      message.success('Cập nhật thông tin thành công!');
      Object.keys(errors).forEach((key) => errors[key] = '');
      await fetchUserProfile();
    }
  } catch (err) {
    if (err.response?.status === 422) {
      message.warning('Vui lòng nhập chính xác đầy đủ thông tin');
      Object.assign(errors, err.response.data.errors);
    } else {
      message.error('Có lỗi xảy ra');
    }
  } finally {
    isLoading.value = false;
  }
};

defineExpose({ openDrawer });
</script>

<style scoped>
.profile-drawer {
  :deep(.ant-drawer-header) {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 204, 119, 0.2);
  }

  :deep(.ant-drawer-body) {
    padding: 0;
    background: #fff;
  }
}

.drawer-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #227CA0;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-button:hover {
  background: #f5f5f5;
  color: #ff4d4f;
}

.profile-container {
  padding: 32px;
}

.profile-card {
  margin-bottom: 32px;
  border-radius: 16px;
  box-shadow: none;
  overflow: hidden;
  background: transparent;
}

.profile-header {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
  padding: 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: none;
  background: transparent;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: transparent;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: linear-gradient(to top, rgba(34, 124, 160, 0.8), transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  color: white;
  font-size: 18px;
}

.user-details {
  padding-top: 8px;
}

.name-section {
  margin-bottom: 20px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #227CA0;
    margin-bottom: 8px;
  }
}

.role-tag {
  padding: 4px 10px;
  font-size: 12px;
  background: rgba(21, 197, 178, 0.1);
  color: #15C5B2;
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

.contact-info {
  display: flex;
  flex-direction: row;
  gap: 16px;
  flex-wrap: nowrap;
}

.info-item {
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s;
  border: 1px solid rgba(255, 204, 119, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  background: transparent;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #FFCC77;
}

.info-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.info-content {
  .info-label {
    font-size: 11px;
    color: #8c8c8c;
    margin-bottom: 2px;
  }
  
  a, span {
    font-size: 13px;
    color: #227CA0;
    font-weight: 500;
  }
}

.user-status {
  margin-top: 8px;
  text-align: center;
}

.profile-tabs {
  :deep(.ant-tabs-nav) {
    margin-bottom: 24px;
  }
}

.profile-form {
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  max-width: 100%;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-input),
:deep(.ant-select-selector) {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 204, 119, 0.3);
  
  &:hover, &:focus {
    border-color: #15C5B2;
    box-shadow: 0 0 0 2px rgba(21, 197, 178, 0.1);
  }
}

.error-input {
  border-color: #ff4d4f !important;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 204, 119, 0.2);
}

.cancel-button,
.save-button {
  min-width: 130px;
  height: 42px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.save-button {
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #227CA0, #15C5B2);
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
