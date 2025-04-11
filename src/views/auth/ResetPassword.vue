<script setup>
import { ref } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const dirApi = import.meta.env.VITE_API_BASE_URL;
const isLoading = ref(false);
const resetErrors = ref({});
const formState = ref({ 
    reset_token: "",
    password: "",
    password_confirmation: "",
});

const rules = {
  reset_token:[
    {required: true, message: t("ResetPassword.validate.reset_token_required")},
  ],
  password: [
    { required: true, message: t("ResetPassword.validate.password_required") },
    { min: 8, message: t("ResetPassword.validate.password_min") },
    {
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      message: t("ResetPassword.validate.password_invalid"),
    }
],
  password_confirmation: [
    {required: true, message: t("ResetPassword.validate.password_confirm_required")},
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue("password") === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(t("ResetPassword.validate.password_mismatch")));
      },
    }),
  ]
};

const onSubmit = async () => {
  const data = {...formState.value};

  await axios.post(`${dirApi}user/reset-password`, data)
    .then(response => {
        // console.log(response.data);
        message.success(t("ResetPassword.success.password_reset_success"));
        router.push({name: 'login'});
    })
    .catch(error => {
        
        console.log(error.response);
        if(error.response.status == 422) {
          resetErrors.value = error.response.data.errors;
        }

        if(error.response.data.code == 400) {
          message.error(error.response.data.message);
        }
    })
    .finally(() => {
        isLoading.value = false;
    });
};
</script>

<template>
    <section class="bg-white min-h-screen flex flex-col items-center justify-center">
    <div class="container max-w-md mx-auto">
      <div class="text-center">
        <img class="w-16 h-14" src="../../assets/images/logo.png" alt="Logo" />
        <h1 class="mt-4 text-2xl font-semibold tracking-wide text-gray-800">{{ t("ResetPassword.title") }}</h1>
        <p class="mt-2 text-gray-500">{{ t("ResetPassword.description") }}</p>
      </div>

      <a-form class="mt-6" layout="vertical" :model="formState" :required-mark="false" :rules="rules" @finish="onSubmit">
        <a-form-item name="reset_token">
          <template #label>
            <span class="text-gray-700">{{ t('ResetPassword.label.reset_token') }}</span> <span class="text-red-500 ml-1">*</span>
          </template>
          <a-input v-model:value="formState.reset_token" 
                    type="text" 
                    class="border border-orange-300"
                    :placeholder="t('ResetPassword.placeholder.reset_token')" 
                    />
                    <span class="text-red-500" v-if="resetErrors.message">{{ resetErrors.message }}</span>
        </a-form-item>

        <a-form-item name="password">
          <template #label>
            <span class="text-gray-700">{{ t('ResetPassword.label.new_password') }}</span> <span class="text-red-500 ml-1">*</span>
          </template>
          <a-input v-model:value="formState.password" 
                    type="password" 
                    class="border border-orange-300" 
                    :placeholder="t('ResetPassword.placeholder.new_password')" 
                    :class="{'text-red-500': resetErrors.password}"
                    />
                    <span class="text-red-500" v-if="resetErrors.password">{{ resetErrors.password[0] }}</span>
        </a-form-item>

        <a-form-item name="password_confirmation">
          <template #label>
            <span class="text-gray-700">{{ t('ResetPassword.label.confirm_password') }}</span> <span class="text-red-500 ml-1">*</span>
          </template>
          <a-input v-model:value="formState.password_confirmation" 
                     type="password"
                     class="border border-orange-300"
                     :placeholder="t('ResetPassword.placeholder.confirm_password')" 
                     :class="{'text-red-500': resetErrors.password_confirmation}"
                     />
                     <span class="text-red-500" v-if="resetErrors.password_confirmation">{{ resetErrors.password_confirmation[0] }}</span>
        </a-form-item>
        
        <a-form-item>
          <a-button :loading="isLoading" type="primary" class="gradient-btn" html-type="submit" block>{{ t("change_password") }}</a-button>
        </a-form-item>
      </a-form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-gray-400 hover:underline hover:text-gray-600">
          {{ t("auth.back_to_login") }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .gradient-btn {
    width: 100%;
    font-size: 16px;
    font-weight: bold;
    color: black;
    background: linear-gradient(to right, #FFE8A3, #FF9800);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  }

  .gradient-btn:hover {
    opacity: 0.9;
  }
</style>