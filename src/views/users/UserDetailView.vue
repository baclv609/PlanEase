<template>
  <div class="user-detail-container">
    <a-button class="back-button" type="text" @click="goBack">
      <template #icon>
        <ArrowLeftOutlined />
      </template>
      Quay lại danh sách
    </a-button>

    <a-card class="user-card">
      <div class="user-header" v-if="user">
        <a-image
          class="user-avatar"
          :width="120"
          :height="120"
          :style="{ borderRadius: '10%' }"
          :src="user.avatar || defaultAvatar"
        />
        <div class="user-info">
          <h2 class="user-name">{{ user.first_name || 'N/A' }} {{ user.last_name || 'N/A' }}</h2>
          <div class="user-details">
            <p class="user-meta">
              Email: <a v-if="user.email" :href="'mailto:' + user.email">{{ user.email }}</a>
            </p>
            <p class="user-meta">Phone: {{ user.phone || 'N/A' }}</p>
            <p class="user-meta">Address: {{ user.address || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="1" tab="Details">
          <a-form layout="vertical" v-if="user">
            <a-form-item label="User ID">
              <a-input v-model:value="user.id" disabled />
            </a-form-item>

            <div class="form-row">
              <a-form-item label="First Name" class="half-width">
                <a-input v-model:value="user.first_name" />
              </a-form-item>
              <a-form-item label="Last Name" class="half-width">
                <a-input v-model:value="user.last_name" />
              </a-form-item>
            </div>

            <div class="form-row">
              <a-form-item label="Email" class="third-width">
                <a-input v-model:value="user.email" />
              </a-form-item>
              <a-form-item label="Gender" class="third-width">
                <a-input v-model:value="user.gender" />
              </a-form-item>
              <a-form-item label="Address" class="third-width">
                <a-input v-model:value="user.address" />
              </a-form-item>
            </div>
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
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
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
</script>

<style scoped>
.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  margin-bottom: 8px;
  font-size: 22px;
  font-weight: bold;
}

.user-details {
  display: flex;
  justify-content: space-around;
  margin-top: 8px;
  font-size: 16px;
}

.user-meta {
  margin: 0;
  opacity: 0.7; 
}

.form-row {
  display: flex;
  gap: 16px;
}

.half-width {
  flex: 1; 
}

.third-width {
  flex: 1; 
}
</style>
