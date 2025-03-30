<template>
  <div class="user-detail-container">
    <a-button class="back-button" type="primary" @click="goBack">
      <template #icon>
        <ArrowLeftOutlined />
      </template>
      Quay lại danh sách
    </a-button>

    <a-card class="user-card" :bordered="false">
      <div class="user-header" v-if="user">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <a-avatar
              :size="140"
              :src="user.avatar || defaultAvatar"
              :style="{ backgroundColor: getAvatarColor(user.email) }"
            >
              {{ getAvatarText(user.email) }}
            </a-avatar>
            <div class="status-indicator">
              <a-tag :color="user.deleted_at ? 'error' : 'success'" class="status-tag">
                <span class="status-dot"></span>
                {{ user.deleted_at ? 'Đã khóa' : 'Hoạt động' }}
              </a-tag>
            </div>
          </div>
        </div>
        
        <div class="user-info">
          <div class="user-header-content">
            <h2 class="user-name">
              {{ user.first_name || 'N/A' }} {{ user.last_name || 'N/A' }}
            </h2>
            <div class="user-role">
              <CrownOutlined /> Người dùng
            </div>
          </div>

          <div class="user-meta-grid">
            <div class="meta-item">
              <div class="meta-icon-wrapper">
                <MailOutlined class="meta-icon" />
              </div>
              <div class="meta-content">
                <span class="meta-label">Email</span>
                <a :href="'mailto:' + user.email" class="meta-value">{{ user.email }}</a>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-icon-wrapper">
                <PhoneOutlined class="meta-icon" />
              </div>
              <div class="meta-content">
                <span class="meta-label">Số điện thoại</span>
                <span class="meta-value">{{ user.phone || 'Chưa cập nhật' }}</span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-icon-wrapper">
                <HomeOutlined class="meta-icon" />
              </div>
              <div class="meta-content">
                <span class="meta-label">Địa chỉ</span>
                <span class="meta-value">{{ user.address || 'Chưa cập nhật' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a-divider style="margin: 24px 0" />

      <a-tabs v-model:activeKey="activeTab" class="custom-tabs">
        <a-tab-pane key="1">
          <template #tab>
            <span class="tab-label">
              <ProfileOutlined />
              Thông tin chi tiết
            </span>
          </template>
          <a-form layout="vertical" v-if="user" class="detail-form">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="User ID">
                  <a-input v-model:value="user.id" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="Tên">
                  <a-input v-model:value="user.first_name" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="Họ">
                  <a-input v-model:value="user.last_name" disabled />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="Email">
                  <a-input v-model:value="user.email" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="Giới tính">
                  <a-select v-model:value="user.gender" disabled>
                    <a-select-option value="male">Nam</a-select-option>
                    <a-select-option value="female">Nữ</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="Địa chỉ">
                  <a-input v-model:value="user.address" disabled />
                </a-form-item>
              </a-col>

              <a-col :span="8">
                <a-form-item label="Ngày tạo">
                  <a-input :value="formatDateTime(user.created_at)" disabled />
                </a-form-item>
              </a-col>

              <a-col :span="8">
                <a-form-item label="Ngày cập nhật">
                  <a-input :value="formatDateTime(user.updated_at)" disabled />
                </a-form-item>
              </a-col>

            </a-row>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { 
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CrownOutlined,
  ProfileOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

const dirApi = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();
const activeTab = ref('1');
const user = ref(null);
const defaultAvatar = 'https://via.placeholder.com/120';

const fetchUserDetail = async () => {
  try {
    const response = await axios.get(`${dirApi}admin/users/${route.params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });

    let userData = response.data && response.data.user ? response.data.user : response.data.data;

    if (!userData) {
      message.error('Không tìm thấy thông tin người dùng');
      router.push('/dashboard/users');
      return;
    }

    user.value = userData;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user:', error);
    message.error('Không thể lấy thông tin người dùng');
    router.push('/dashboard/users');
  }
};

const goBack = () => {
  router.push('/dashboard/users');
};

onMounted(() => {
  fetchUserDetail();
});

// Thêm các hàm mới cho avatar
const getAvatarColor = (email) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
  const index = email?.length % colors.length || 0;
  return colors[index];
};

const getAvatarText = (email) => {
  return email ? email.charAt(0).toUpperCase() : 'U';
};

const formatDateTime = (datetime) => {
  return datetime ? dayjs(datetime).format('DD/MM/YYYY HH:mm:ss') : 'N/A';
};
</script>

<style scoped>
.user-detail-container {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.back-button {
  margin-bottom: 20px;
  height: 40px;
  padding: 0 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #227CA0, #15C5B2);
  }
}

.user-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  background: white;
}

.user-header {
  display: flex;
  gap: 40px;
  padding: 24px 0;
}

.avatar-wrapper {
  position: relative;
  padding: 8px;
  background: linear-gradient(135deg, rgba(21, 197, 178, 0.1), rgba(34, 124, 160, 0.1));
  border-radius: 50%;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.user-header-content {
  margin-bottom: 24px;
}

.user-name {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 8px;
}

.user-role {
  color: #15C5B2;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;
}

.meta-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.meta-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.meta-icon {
  color: white;
  font-size: 18px;
}

.meta-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: #8c8c8c;
}

.meta-value {
  font-size: 14px;
  color: #1f1f1f;
  font-weight: 500;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-form {
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #1f1f1f;
}

:deep(.ant-input[disabled]), 
:deep(.ant-select-disabled .ant-select-selector) {
  color: #1f1f1f !important;
  background: white !important;
  border: 1px solid #e8e8e8;
  cursor: not-allowed;
  opacity: 0.8;
}

:deep(.ant-tabs-nav::before) {
  border-bottom: none;
}

:deep(.ant-tabs-tab) {
  padding: 12px 24px;
  margin: 0 8px 0 0;
}

:deep(.ant-tabs-tab-active) {
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
}
</style>
