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
          <a-avatar
            :size="120"
            :src="user.avatar || defaultAvatar"
            :style="{ backgroundColor: getAvatarColor(user.email) }"
          >
            {{ getAvatarText(user.email) }}
          </a-avatar>
          <a-tag :color="user.deleted_at ? 'error' : 'success'" class="status-tag">
            {{ user.deleted_at ? 'Đã khóa' : 'Hoạt động' }}
          </a-tag>
        </div>
        
        <div class="user-info">
          <h2 class="user-name">
            {{ user.first_name || 'N/A' }} {{ user.last_name || 'N/A' }}
          </h2>
          <div class="user-meta-grid">
            <div class="meta-item">
              <MailOutlined class="meta-icon" />
              <span class="meta-label">Email:</span>
              <a :href="'mailto:' + user.email">{{ user.email }}</a>
            </div>
            <div class="meta-item">
              <PhoneOutlined class="meta-icon" />
              <span class="meta-label">Phone:</span>
              <span>{{ user.phone || 'N/A' }}</span>
            </div>
            <div class="meta-item">
              <HomeOutlined class="meta-icon" />
              <span class="meta-label">Address:</span>
              <span>{{ user.address || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <a-divider />

      <a-tabs v-model:activeKey="activeTab" class="custom-tabs">
        <a-tab-pane key="1" tab="Thông tin chi tiết">
          <a-form layout="vertical" v-if="user" class="detail-form">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="User ID">
                  <a-input v-model:value="user.id" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="First Name">
                  <a-input v-model:value="user.first_name" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="Last Name">
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
                <a-form-item label="Gender">
                  <a-select v-model:value="user.gender" disabled>
                    <a-select-option value="male">Nam</a-select-option>
                    <a-select-option value="female">Nữ</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="Address">
                  <a-input v-model:value="user.address" disabled />
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
  HomeOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

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
</script>

<style scoped>
.user-detail-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.back-button {
  margin-bottom: 16px;
}

.user-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.user-header {
  display: flex;
  gap: 32px;
  padding: 16px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.status-tag {
  font-size: 12px;
  padding: 2px 12px;
}

.user-info {
  flex-grow: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f1f1f;
}

.user-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-icon {
  color: #1890ff;
  font-size: 16px;
}

.meta-label {
  color: #8c8c8c;
  font-weight: 500;
  margin-right: 4px;
}

.custom-tabs {
  margin-top: 24px;
}

.detail-form {
  padding: 24px 0;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
}

:deep(.ant-input[disabled]), 
:deep(.ant-select-disabled .ant-select-selector) {
  color: #1f1f1f !important;
  background: #f5f5f5 !important;
  cursor: not-allowed;
  opacity: 0.8;
}

:deep(.ant-select-disabled .ant-select-selection-item) {
  color: #1f1f1f !important;
}

:deep(.ant-select-selector) {
  border-radius: 6px !important;
}

:deep(.ant-input) {
  border-radius: 6px;
}
</style>
