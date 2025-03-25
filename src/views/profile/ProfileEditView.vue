<template>
  <div class="profile-edit-container">
    <a-card>
      <template #title>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ $t("edit_profile") }}</h2>
          <a-button @click="$router.back()">
            <template #icon><ArrowLeftOutlined /></template>
            {{ $t("back") }}
          </a-button>
        </div>
      </template>

      <a-form layout="vertical">
        <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <a-form-item :label="$t('profile.first_name')" class="flex-1">
            <a-input
              v-model:value="user.first_name"
              :class="errors.first_name ? 'border-red-500' : ''"
            />
            <span class="text-red-400 text-sm" v-if="errors.first_name">
              {{ errors.first_name[0] }}
            </span>
          </a-form-item>

          <a-form-item :label="$t('profile.last_name')" class="flex-1">
            <a-input
              v-model:value="user.last_name"
              :class="errors.last_name ? 'border-red-500' : ''"
            />
            <span class="text-red-400 text-sm" v-if="errors.last_name">
              {{ errors.last_name[0] }}
            </span>
          </a-form-item>
        </div>

        <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <a-form-item :label="$t('profile.gender')" class="flex-1">
            <a-select v-model:value="user.gender">
              <a-select-option value="male">{{ $t("profile.male") }}</a-select-option>
              <a-select-option value="female">{{ $t("profile.female") }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="$t('profile.phone')" class="flex-1">
            <a-input
              v-model:value="user.phone"
              :class="errors.phone ? 'border-red-400' : ''"
            />
            <span class="text-red-400 text-sm" v-if="errors.phone">
              {{ errors.phone[0] }}
            </span>
          </a-form-item>
        </div>

        <div class="w-full">
          <a-form-item :label="$t('profile.address')">
            <a-input
              v-model:value="user.address"
              :class="errors.address ? 'border-red-400' : ''"
            />
            <span class="text-red-400 text-sm" v-if="errors.address">
              {{ errors.address[0] }}
            </span>
          </a-form-item>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <a-button @click="$router.back()">{{ $t("back") }}</a-button>
          <a-button type="primary" @click="saveChanges" :loading="isLoading">
            {{ $t("profile.save") }}
          </a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import axios from "axios";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("access_token");
const isLoading = ref(false);

const user = ref({});
const errors = reactive({
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
});

const fetchUserProfile = async () => {
  try {
    if (!token) {
      message.error("profile.error.token_not_found");
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
      message.error("profile.error.user_not_found", { message: response.data.message });
    }
  } catch (error) {
    message.error("profile.error.fetch_error", { error });
  }
};

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
      router.back();
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

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.profile-edit-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
