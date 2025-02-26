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
        <a-image class="user-avatar" :width="120" :height="120" :style="{ borderRadius: '50%' }"
          :src="user.avatar || defaultAvatar" />
        <div class="user-info">
          <h2>{{ user.first_name || 'N/A' }} {{ user.last_name || 'N/A' }}</h2>
          <p>Email: <a v-if="user.email" :href="'mailto:' + user.email">{{ user.email }}</a></p>
          <p>Phone: {{ user.phone || 'N/A' }}</p>
          <p>Address: {{ user.address || 'N/A' }}</p>
        </div>
      </div>

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="1" tab="Details">
          <a-form layout="vertical" v-if="user">
            <a-form-item label="User ID">
              <a-input v-model:value="user.id" disabled />
            </a-form-item>
            <div class="form-row">
              <a-form-item label="First Name">
                <a-input v-model:value="user.first_name" />
              </a-form-item>
              <a-form-item label="Last Name">
                <a-input v-model:value="user.last_name" />
              </a-form-item>
            </div>

            <div class="form-row-wide">
              <a-form-item label="Email" class="email-field">
                <a-input v-model:value="user.email" />
              </a-form-item>
              <a-form-item label="Gender">
                <a-input v-model:value="user.gender" />
              </a-form-item>
              <a-form-item label="Address">
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

const dirApi = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();
const activeTab = ref('1');
const user = ref(null); // Để tránh lỗi `undefined` khi render
const defaultAvatar = 'https://via.placeholder.com/120';

// Gọi API lấy thông tin chi tiết user
const fetchUserDetail = async () => {
  try {

    const response = await axios.get(`${dirApi}admin/users/${route.params.id}`, {

      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    console.log("User ID từ route:", route.params.id);


    // Kiểm tra dữ liệu từ API
    if (response.data && response.data.user) {
      user.value = response.data.user;
    } else {
      user.value = response.data.data; // Nếu API trả về object user trực tiếp
    }

    console.log("User sau khi set:", user.value);


  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    user.value = null;
  }

};

// Quay lại danh sách người dùng
const goBack = () => {
  router.push('/users');
};

// Gọi API khi trang được load
onMounted(() => {
  // console.log("Component UserDetail mounted");
  fetchUserDetail();
});
</script>
