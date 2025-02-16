<script setup>
import { ref } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";

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
    {required: true, message: "Vui lòng nhập mã OTP"}
  ],
  password: [
    { required: true, message: "Vui lòng nhập mật khẩu!" },
    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
    {
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      message: "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt",
    }
],
  password_confirmation: [
    {required: true, message: "Vui lòng nhập xác nhận mật khẩu"},
  ]
};

const onSubmit = async () => {
  const data = {...formState.value};

  await axios.post(`${dirApi}user/reset-password`, data)
    .then(response => {
        // console.log(response.data);
        message.success(response.data.message);
        router.push({name: 'login'});
    })
    .catch(error => {
        message.error("Có lỗi xảy ra");
        // console.log(error.response.data.message);
        resetErrors.value = error.response.data.errors
        if(error.response.data.code == 400) {
            resetErrors.value = error.response.data;
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
        <img class="w-auto h-7 sm:h-8 mx-auto" src="https://merakiui.com/images/logo.svg" alt="Logo" />
        <h1 class="mt-4 text-2xl font-semibold tracking-wide text-gray-800">Mật khẩu mới</h1>
        <p class="mt-2 text-gray-500">Nhập mật khẩu mới của bạn.</p>
      </div>

      <a-form class="mt-6" layout="vertical" :model="formState" :rules="rules" @finish="onSubmit">
        <a-form-item label="Mã khôi phục mật khẩu" name="reset_token">
          <a-input v-model:value="formState.reset_token" 
                    type="text" 
                    placeholder="Nhập mã khôi phục" 
                    />
                    <span class="text-red-500" v-if="resetErrors.message">{{ resetErrors.message }}</span>
        </a-form-item>

        <a-form-item label="Mật khẩu mới" name="password">
          <a-input v-model:value="formState.password" 
                    type="password" 
                    placeholder="Nhập mật khẩu mới" 
                    :class="{'text-red-500': resetErrors.password}"
                    />
                    <span class="text-red-500" v-if="resetErrors.password">{{ resetErrors.password[0] }}</span>
        </a-form-item>

        <a-form-item label="Xác nhận mật khẩu" name="password_confirmation">
          <a-input v-model:value="formState.password_confirmation" 
                     type="password"
                     placeholder="Nhập xác nhận mật khẩu" 
                     :class="{'text-red-500': resetErrors.password_confirmation}"
                     />
                     <span class="text-red-500" v-if="resetErrors.password_confirmation">{{ resetErrors.password_confirmation[0] }}</span>
        </a-form-item>
        
        <a-form-item>
          <a-button :loading="isLoading" type="primary" html-type="submit" block>Cập nhật mật khẩu</a-button>
        </a-form-item>
      </a-form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-blue-500 hover:underline">
          Quay lại đăng nhập
        </router-link>
      </div>
    </div>
  </section>
</template>