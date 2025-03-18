<template>
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
              <a-input v-model:value="user.first_name"
                :class="errors.first_name ? 'border-red-500' : ''"
              />

              <span class="text-red-400 text-sm" :v-if="errors.first_name">{{ errors.first_name[0] }}</span>
            </a-form-item>

            <a-form-item label="Họ" class="flex-1">
              <a-input v-model:value="user.last_name"
              :class="errors.last_name ? 'border-red-500' : ''"
              />

              <span class="text-red-400 text-sm" v-if="errors.last_name">{{ errors.last_name[0] }}</span>
            </a-form-item>
          </div>
          
          <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <a-form-item label="Giới tính" class="flex-1">
              <a-select v-model:value="user.gender">
                <a-select-option value="male">Male</a-select-option>
                <a-select-option value="female">Female</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Số điện thoại" class="flex-1">
              <a-input v-model:value="user.phone" 
              :class="errors.phone ? 'border-red-400' : ''"
              />

              <span class="text-red-400 text-sm" v-if="errors.phone">{{ errors.phone[0] }}</span>
            </a-form-item>
          </div>
          <div class="w-full">
            <a-form-item label="Địa chỉ">
              <a-input v-model:value="user.address" 
                :class="errors.address ? 'border-red-400' : ''"
              />

              <span class="text-red-400 text-sm" v-if="errors.address">{{ errors.address[0] }}</span>
            </a-form-item>
          </div>
        </a-form>

        <div class="flex gap-2">
          <a-button type="primary" @click="saveChanges" :loading="isLoading">Lưu</a-button>
          <a-button type="primary" danger @click="handleLogout">Đăng xuất</a-button>
        </div>
      </a-tab-pane>

      <a-tab-pane key="2" tab="Mật khẩu">
        <a-form layout="vertical">
          <a-form-item label="Nhập mật khẩu hiện tại">
            <a-input-password v-model:value="password.old_password" placeholder="Nhập mật khẩu cũ" 
            :class="errors.old_password ? 'border-red-400' : ''"
            />
            <span class="text-red-400 text-sm" v-if="errors.old_password">{{ errors.old_password[0] }}</span>
          </a-form-item>

          <a-form-item label="Nhập mật khẩu mới">
            <a-input-password v-model:value="password.new_password" placeholder="Nhập mật khẩu mới"
            :class="errors.new_password ? 'border-red-400' : ''"
            />
            <span class="text-red-400 text-sm" v-if="errors.new_password">{{ errors.new_password[0] }}</span>
          </a-form-item>

          <a-form-item label="Xác nhận mật khẩu">
            <a-input-password v-model:value="password.password_confirmation" placeholder="Xác nhận mật khẩu mới" 
            :class="errors.password_confirmation ? 'border-red-400' : ''"
            />

            <span class="text-red-400 text-sm" v-if="errors.password_confirmation">{{ errors.password_confirmation[0] }}</span>
          </a-form-item>

          <a-button type="primary" :loading="isLoading" @click="changePassword" class="w-50">Change Password</a-button>
        </a-form>
      </a-tab-pane>

      <a-tab-pane  key="3" tab="Thống kê">

      </a-tab-pane>
      
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useEchoStore } from "@/stores/echoStore";
import unknowUser from "@/assets/images/unknow_user.jpg"
import { CloudUploadOutlined } from "@ant-design/icons-vue";

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const activeTab = ref("1");
const user = ref({});
const token = localStorage.getItem("access_token");
const isLoading = ref(false);
const errors = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  old_password: '',
  new_password: '',
  password_confirmation: '',
});
const password = ref({
  old_password: '',
  new_password: '',
  password_confirmation: '',
});
const fileList = ref([]);

// Gọi API lấy thông tin user khi component được mount
const fetchUserProfile = async () => {
  try {
    if (!token) {
      console.error("Không tìm thấy token, user chưa đăng nhập!");
      return;
    }

    const response = await axios.get(`${dirApi}user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.code === 200) {
      user.value = response.data.data;
    } else {
      console.error("Không tìm thấy user:", response.data.message);
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
  }
};

// Hàm cập nhật thông tin user
const saveChanges = async () => {
  try {
    if (!token) {
      message.error("Vui lòng đăng nhập lại!");
      return;
    }

    isLoading.value = true;

    const updatedUser = {
      first_name: user.value.first_name,
      last_name: user.value.last_name,
      gender: user.value.gender,
      address: user.value.address,
      phone: user.value.phone,
    };
    console.log("Dữ liệu gửi lên API:", updatedUser);


    const response = await axios.put(`${dirApi}user/update-profile`, updatedUser, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.code === 200) {
      message.success("Cập nhật thông tin thành công!");

      Object.keys(errors).forEach((key) => errors[key] = "");

      await fetchUserProfile();

      console.log("User trước khi cập nhật:", user.value);
      user.value = { ...response.data.data };
      console.log("User sau khi cập nhật:", user.value);

    } else {
      message.error(response.data.message || "Cập nhật thất bại!");
    }
  } catch (err) {
    if(err.status == 422) {
      message.warning('Vui lòng nhập chính xác đầy đủ thông tin');
      Object.assign(errors, err.response.data.errors);
    } else {
      message.error('Có lỗi xảy ra');
    }
  } finally {
    isLoading.value = false;
  }
};

// Change password
const changePassword = async () => {
  try {
    isLoading.value = true;

    const response = await axios.put(`${dirApi}user/change-password`, {
        old_password: password.value.old_password,
        new_password: password.value.new_password,
        password_confirmation: password.value.password_confirmation,
      }, 
      {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if(response.data.code == 200) {
      message.success('Thay đổi mật khẩu thành công');

      Object.keys(errors).forEach((key) => errors[key] = "");

      password.value = {};
    }
  } catch (err) {
    if(err.status == 422) {
      message.warning('Vui lòng nhập chính xác và đầy đủ thông tin');
      Object.assign(errors, err.response.data.errors);
    } else if (err.status == 400) {
      message.warning('Mật khẩu không chính xác');
    } else {
      message.error('Có lỗi xảy ra');
    }
  } finally {
    isLoading.value = false;
  }
}

// Hàm logout
const handleLogout = () => {
  axios
    .post(`${dirApi}auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((response) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      const echoStore = useEchoStore();
      echoStore.stopListening();
      echoStore.destroyEcho();

      message.success(response.data.message || "Logout successfully");
      router.push({ name: "home" });
    })
    .catch(() => {
      message.error("Fail");
    });
};

// Gọi API khi component mounted
onMounted(() => {
  fetchUserProfile();
});
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

/* Form chỉnh sửa */
.input-row {
  display: flex;
  gap: 15px;
}

.half-width {
  width: 48%;
}

.third-width {
  width: 32%;
}

a-button {
  margin: 10px;
}
</style>
