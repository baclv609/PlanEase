<template>
  <div class="profile-container">
    <a-card class="user-container">
      <div class="user-info">
        <div class="flex flex-col gap-1 justify-center">
          <a-avatar
            :src="user.avatar || unknowUser"
            :style="{
              width: '120px',
              height: '120px',
              border: '2px solid #ccc',
              borderRadius: '10%',
            }"
          />

          <a-upload
            class="m-auto"
            v-model:file-list="fileList"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          >
            <a-button class="gradient-primary-btn">
              <CloudUploadOutlined />
              {{ $t("profile.change_avatar") }}
            </a-button>
          </a-upload>
        </div>

        <div class="user-details">
          <div class="name-row">
            <h2 class="font-bold text-3xl">{{ user.first_name }}</h2>
            <h2 class="font-bold text-3xl">{{ user.last_name }}</h2>
          </div>
          <div class="contact-row">
            <p>
              <strong>{{ $t("profile.email") }}:</strong>
              <a :href="'mailto:' + user.email">{{ user.email }}</a>
            </p>
            <p>
              <strong>{{ $t("profile.phone") }}:</strong>
              <a :href="'tel:' + user.phone">{{ user.phone }}</a>
            </p>
            <p>
              <strong>{{ $t("profile.address") }}:</strong> {{ user.address }}
            </p>
          </div>
        </div>
      </div>
    </a-card>

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="1" :tab="$t('profile.general_info')">
        <a-form layout="vertical">
          <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <a-form-item :label="$t('profile.first_name')" class="flex-1">
              <a-input
                v-model:value="user.first_name"
                :class="errors.first_name ? 'border-red-500' : ''"
              />

              <span class="text-red-400 text-sm" :v-if="errors.first_name">{{
                errors.first_name[0]
              }}</span>
            </a-form-item>

            <a-form-item :label="$t('profile.last_name')" class="flex-1">
              <a-input
                v-model:value="user.last_name"
                :class="errors.last_name ? 'border-red-500' : ''"
              />

              <span class="text-red-400 text-sm" v-if="errors.last_name">{{
                errors.last_name[0]
              }}</span>
            </a-form-item>
          </div>

          <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <a-form-item :label="$t('profile.gender')" class="flex-1">
              <a-select v-model:value="user.gender">
                <a-select-option value="male">{{ $t("profile.male") }}</a-select-option>
                <a-select-option value="female">{{
                  $t("profile.female")
                }}</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item :label="$t('profile.phone')" class="flex-1">
              <a-input
                v-model:value="user.phone"
                :class="errors.phone ? 'border-red-400' : ''"
              />

              <span class="text-red-400 text-sm" v-if="errors.phone">{{
                errors.phone[0]
              }}</span>
            </a-form-item>
          </div>
          <div class="w-full">
            <a-form-item :label="$t('profile.address')">
              <a-input
                v-model:value="user.address"
                :class="errors.address ? 'border-red-400' : ''"
              />

              <span class="text-red-400 text-sm" v-if="errors.address">{{
                errors.address[0]
              }}</span>
            </a-form-item>
          </div>
        </a-form>

        <div class="flex gap-2 form-actions">
          <a-button class="gradient-primary-btn" @click="saveChanges" :loading="isLoading">{{
            $t("profile.save")
          }}</a-button>
          <a-button class="gradient-danger-btn" @click="handleLogout">{{
            $t("profile.logout")
          }}</a-button>
        </div>
      </a-tab-pane>

      <a-tab-pane key="2" :tab="$t('profile.password')">
        <a-form layout="vertical">
          <a-form-item :label="$t('profile.current_password')">
            <a-input-password
              v-model:value="password.old_password"
              :placeholder="$t('profile.enter_current_password')"
              :class="errors.old_password ? 'border-red-400' : ''"
            />
            <span class="text-red-400 text-sm" v-if="errors.old_password">{{
              errors.old_password[0]
            }}</span>
          </a-form-item>

          <a-form-item :label="$t('profile.new_password')">
            <a-input-password
              v-model:value="password.new_password"
              :placeholder="$t('profile.enter_new_password')"
              :class="errors.new_password ? 'border-red-400' : ''"
            />
            <span class="text-red-400 text-sm" v-if="errors.new_password">{{
              errors.new_password[0]
            }}</span>
          </a-form-item>

          <a-form-item :label="$t('profile.confirm_password')">
            <a-input-password
              v-model:value="password.password_confirmation"
              :placeholder="$t('profile.confirm_new_password')"
              :class="errors.password_confirmation ? 'border-red-400' : ''"
            />

            <span class="text-red-400 text-sm" v-if="errors.password_confirmation">{{
              errors.password_confirmation[0]
            }}</span>
          </a-form-item>

          <a-button
            class="gradient-primary-btn w-50"
            :loading="isLoading"
            @click="changePassword"
          >{{ $t("profile.change_password") }}</a-button>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="3" :tab="$t('profile.statistics')">
        <ProfileStatistics />
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
import unknowUser from "@/assets/images/unknow_user.jpg";
import { CloudUploadOutlined } from "@ant-design/icons-vue";
import ProfileStatistics from "./ProfileStatistics.vue";

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const activeTab = ref("1");
const user = ref({});
const token = localStorage.getItem("access_token");
const isLoading = ref(false);
const errors = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  old_password: "",
  new_password: "",
  password_confirmation: "",
});
const password = ref({
  old_password: "",
  new_password: "",
  password_confirmation: "",
});
const fileList = ref([]);

// Gọi API lấy thông tin user khi component được mount
const fetchUserProfile = async () => {
  try {
    if (!token) {
      console.error("profile.error.token_not_found");
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
      console.error(
        "profile.error.user_not_found",
        { message: response.data.message }
      );
    }
  } catch (error) {
    console.error("profile.error.fetch_error", { error });
  }
};

// Hàm cập nhật thông tin user
const saveChanges = async () => {
  try {
    if (!token) {
      message.error("profile.error.login_required");
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

    const response = await axios.put(`${dirApi}user/update-profile`, updatedUser, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.code === 200) {
      message.success("profile.success.update_success");

      Object.keys(errors).forEach((key) => (errors[key] = ""));

      await fetchUserProfile();

      user.value = { ...response.data.data };
    } else {
      message.error(response.data.message || "profile.error.update_failed");
    }
  } catch (err) {
    if (err.status == 422) {
      message.warning("profile.error.invalid_input");
      Object.assign(errors, err.response.data.errors);
    } else {
      message.error("profile.error.general_error");
    }
  } finally {
    isLoading.value = false;
  }
};

// Change password
const changePassword = async () => {
  try {
    isLoading.value = true;

    const response = await axios.put(
      `${dirApi}user/change-password`,
      {
        old_password: password.value.old_password,
        new_password: password.value.new_password,
        password_confirmation: password.value.password_confirmation,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.code == 200) {
      message.success("profile.success.password_changed");

      Object.keys(errors).forEach((key) => (errors[key] = ""));

      password.value = {};
    }
  } catch (err) {
    if (err.status == 422) {
      message.warning("profile.error.invalid_input");
      Object.assign(errors, err.response.data.errors);
    } else if (err.status == 400) {
      message.warning("profile.error.password_incorrect");
    } else {
      message.error("profile.error.general_error");
    }
  } finally {
    isLoading.value = false;
  }
};

// Hàm logout
const handleLogout = () => {
  axios
    .post(`${dirApi}auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((response) => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      const echoStore = useEchoStore();
      echoStore.stopListening();
      echoStore.destroyEcho();

      message.success(response.data.message || "profile.success.logout_success");
      router.push({ name: "home" });
    })
    .catch(() => {
      message.error("profile.error.general_error");
    });
};

// Gọi API khi component mounted
onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
:deep(.user-container) {
  background: linear-gradient(135deg, 
    rgba(255, 204, 119, 0.1) 0%,
    rgba(21, 197, 178, 0.1) 50%,
    rgba(34, 124, 160, 0.1) 100%
  ) !important;

  border-radius: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 32px;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  
}

:deep(.ant-card) {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.user-details {
  flex: 1;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.name-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(34, 124, 160, 0.1);
}

.name-row h2 {
  color: #227CA0;
  margin: 0;
  font-size: 2.2rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.contact-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.contact-row p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.contact-row p:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.contact-row strong {
  color: #227CA0;
}

.contact-row a {
  color: #15C5B2;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-row a:hover {
  color: #227CA0;
}

:deep(.ant-tabs) {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

:deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #227CA0;
}

:deep(.ant-tabs-ink-bar) {
  background: linear-gradient(70deg, #ffcc77, #15c5b2);
}

:deep(.ant-form-item-label > label) {
  color: #227CA0;
  font-weight: 600;
  font-size: 1.05rem;
}

:deep(.ant-input),
:deep(.ant-select-selector) {
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid rgba(34, 124, 160, 0.2);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
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
  gap: 16px;
  margin-top: 24px;
}

.gradient-primary-btn {
  background: linear-gradient(70deg, #ffcc77 0%, #15c5b2 50%, #227ca0 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(21, 197, 178, 0.2);
}

.gradient-primary-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.gradient-danger-btn {
  background: linear-gradient(70deg, #fe6d73 0%, #ff9b85 50%, #ff4d6d 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(254, 109, 115, 0.2);
}

.gradient-danger-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

:deep(.ant-upload) {
  margin-top: 16px;
}

:deep(.ant-upload .ant-btn) {
  background: linear-gradient(70deg, #ffcc77, #15c5b2);
  border: none;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.ant-upload .ant-btn:hover) {
  opacity: 0.9;
  transform: translateY(-1px);
}

:deep(.ant-avatar) {
  border: 4px solid #fff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.ant-avatar:hover) {
  transform: scale(1.05);
}
</style>
