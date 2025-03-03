<template>
  <div class="profile-container">
    <a-card>
      <div class="user-info">
        <a-avatar :src="user.avatar || 'https://via.placeholder.com/200'" :style="{
          width: '120px',
          height: '120px',
          border: '2px solid #ccc',
          borderRadius: '10%'
        }" />

        <div class="user-details">
          <div class="name-row">
            <h2>{{ user.first_name }}</h2>
            <h2>{{ user.last_name }}</h2>
          </div>
          <div class="contact-row">
            <p><strong>Email:</strong> <a :href="'mailto:' + user.email">{{ user.email }}</a></p>
            <p><strong>Phone:</strong> <a :href="'tel:' + user.phone">{{ user.phone }}</a></p>
            <p><strong>Address:</strong> {{ user.address }}</p>
          </div>
        </div>
      </div>
    </a-card>

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="1" tab="Details">
        <a-form layout="vertical">
          <div class="input-row">
            <a-form-item label="First Name" class="half-width">
              <a-input v-model:value="user.first_name" />
            </a-form-item>

            <a-form-item label="Last Name" class="half-width">
              <a-input v-model:value="user.last_name" />
            </a-form-item>
          </div>

          <a-form-item label="Gender">
            <a-select v-model:value="user.gender">
              <a-select-option value="male">Male</a-select-option>
              <a-select-option value="female">Female</a-select-option>
            </a-select>
          </a-form-item>

          <div class="input-row">
            <a-form-item label="Email" class="third-width">
              <a-input v-model:value="user.email" />
            </a-form-item>

            <a-form-item label="Phone" class="third-width">
              <a-input v-model:value="user.phone" />
            </a-form-item>

            <a-form-item label="Address" class="third-width">
              <a-input v-model:value="user.address" />
            </a-form-item>
          </div>



          <a-button type="primary" @click="saveChanges">Save changes</a-button>
          <a-button type="primary" danger @click="handleLogout">Logout</a-button>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const activeTab = ref("1");
const user = ref({});

// Gọi API lấy thông tin user khi component được mount
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("access_token");
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
    const token = localStorage.getItem("access_token");
    if (!token) {
      message.error("Vui lòng đăng nhập lại!");
      return;
    }

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
    console.log("Phản hồi từ API:", response.data.data);


    if (response.data.code === 200) {
      message.success("Cập nhật thông tin thành công!");
      await fetchUserProfile();

      console.log("User trước khi cập nhật:", user.value);
      user.value = { ...response.data.data };
      console.log("User sau khi cập nhật:", user.value);

    } else {
      message.error(response.data.message || "Cập nhật thất bại!");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin:", error);
    message.error("Có lỗi xảy ra, vui lòng thử lại!");
  }
};

// Hàm logout
const handleLogout = () => {
  const token = localStorage.getItem("access_token");
  axios
    .post(`${dirApi}auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((response) => {
      localStorage.clear();
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
  gap: 20px;
}

.user-details {
  flex: 1;
  margin: 50px;
}

.name-row {
  display: flex;
  gap: 15px;
  align-items: center;
}

.contact-row {
  display: flex;
  gap: 30px;
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
