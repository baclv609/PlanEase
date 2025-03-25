<template>
  <a-drawer
    title="Thông tin cá nhân"
    :width="'70%'"
    :open="open"
    @close="onClose"
    placement="right"
  >
    <div class="profile-container">
      <a-card>
        <div class="user-info">
          <div class="flex flex-col gap-1 justify-center">
            <a-avatar :src="user.avatar || unknowUser" :style="{
              width: '120px',
              height: '120px',
              border: '2px solid #ccc',
              borderRadius: '10%'
            }" />

            <a-upload class="m-auto" v-model:file-list="fileList" action="https://www.mocky.io/v2/5cc8019d300000980a055e76">
              <a-button>
                <CloudUploadOutlined />
                Đổi ảnh
              </a-button>
            </a-upload>
          </div>

          <div class="user-details">
            <div class="name-row">
              <h2 class="font-bold text-3xl">{{ user.first_name }}</h2>
              <h2 class="font-bold text-3xl">{{ user.last_name }}</h2>
            </div>
            <div class="contact-row">
              <p><strong>Email:</strong> <a :href="'mailto:' + user.email">{{ user.email }}</a></p>
              <p><strong>Số điện thoại:</strong> <a :href="'tel:' + user.phone">{{ user.phone }}</a></p>
              <p><strong>Địa chỉ:</strong> {{ user.address }}</p>
            </div>
          </div>
        </div>
      </a-card>

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="1" tab="Thông tin chung">
          <a-form layout="vertical">
            <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <a-form-item label="Tên" class="flex-1">
                <a-input v-model:value="user.first_name" :class="errors.first_name ? 'border-red-500' : ''" />
                <span class="text-red-400 text-sm" v-if="errors.first_name">{{ errors.first_name[0] }}</span>
              </a-form-item>

              <a-form-item label="Họ" class="flex-1">
                <a-input v-model:value="user.last_name" :class="errors.last_name ? 'border-red-500' : ''" />
                <span class="text-red-400 text-sm" v-if="errors.last_name">{{ errors.last_name[0] }}</span>
              </a-form-item>
            </div>
            
            <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <a-form-item label="Giới tính" class="flex-1">
                <a-select v-model:value="user.gender">
                  <a-select-option value="male">Nam</a-select-option>
                  <a-select-option value="female">Nữ</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="Số điện thoại" class="flex-1">
                <a-input v-model:value="user.phone" :class="errors.phone ? 'border-red-400' : ''" />
                <span class="text-red-400 text-sm" v-if="errors.phone">{{ errors.phone[0] }}</span>
              </a-form-item>
            </div>

            <a-form-item label="Địa chỉ">
              <a-input v-model:value="user.address" :class="errors.address ? 'border-red-400' : ''" />
              <span class="text-red-400 text-sm" v-if="errors.address">{{ errors.address[0] }}</span>
            </a-form-item>

            <a-button class="bg-[#227C9D] text-white hover:!text-white transition rounded-lg" @click="saveChanges" :loading="isLoading">
              Lưu thay đổi
            </a-button>
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
import { CloudUploadOutlined } from '@ant-design/icons-vue';
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
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
  margin: 50px;
}

.name-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.contact-row {
  display: flex;
  gap: 25px;
  margin-top: 10px;
}

.contact-row p {
  margin: 0;
}
</style>
