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
    {required: true, message: "Please enter OTP code"}
  ],
  password: [
    { required: true, message: "Please enter password!" },
    { min: 8, message: "Password must be at least 8 characters" },
    {
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      message: "Password must contain uppercase, lowercase, numbers and special characters",
    }
],
  password_confirmation: [
    {required: true, message: "Please enter password confirmation"},
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
        message.error("An error occurred");
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
        <img class="w-16 h-14" src="../../assets/images/logo.png" alt="Logo" />
        <h1 class="mt-4 text-2xl font-semibold tracking-wide text-gray-800">Password change</h1>
        <p class="mt-2 text-gray-500">Enter your new password.</p>
      </div>

      <a-form class="mt-6" layout="vertical" :model="formState" :rules="rules" @finish="onSubmit">
        <a-form-item label="Password recovery code" name="reset_token">
          <a-input v-model:value="formState.reset_token" 
                    type="text" 
                    class="border border-orange-300"
                    placeholder="Enter recovery code" 
                    />
                    <span class="text-red-500" v-if="resetErrors.message">{{ resetErrors.message }}</span>
        </a-form-item>

        <a-form-item label="New Password" name="password">
          <a-input v-model:value="formState.password" 
                    type="password" 
                    class="border border-orange-300" 
                    placeholder="Enter new password" 
                    :class="{'text-red-500': resetErrors.password}"
                    />
                    <span class="text-red-500" v-if="resetErrors.password">{{ resetErrors.password[0] }}</span>
        </a-form-item>

        <a-form-item label="Confirm Password" name="password_confirmation">
          <a-input v-model:value="formState.password_confirmation" 
                     type="password"
                     class="border border-orange-300"
                     placeholder="Enter password confirmation" 
                     :class="{'text-red-500': resetErrors.password_confirmation}"
                     />
                     <span class="text-red-500" v-if="resetErrors.password_confirmation">{{ resetErrors.password_confirmation[0] }}</span>
        </a-form-item>
        
        <a-form-item>
          <a-button :loading="isLoading" type="primary" class="gradient-btn" html-type="submit" block>Change password</a-button>
        </a-form-item>
      </a-form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-gray-400 hover:underline hover:text-gray-600">
          Back to login
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