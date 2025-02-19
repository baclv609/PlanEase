<script setup>
import { ref } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";

const dirApi = import.meta.env.VITE_API_BASE_URL;
const email = ref("");
const isLoading = ref(false);
const formState = ref({ email: "" });
const errorMail = ref({});
const rules = {
  email: [
    { required: true, message: "Please enter email", trigger: "blur" },
    { type: "email", message: "Invalid email", trigger: ["blur", "change"] },
  ],
};

// const onSubmit = async () => {
//   if (!formState.value.email) {
//     message.error("Vui lòng nhập email");
//     return;
//   }

//   try {
//     isLoading.value = true;
//     data = {...formState.value}
//     const response = await axios.post("http://notibro.lc/api/user/send-reset-password-mail", data)
//     if (response.data.code === 200) {
//       message.success("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn");
//       router.push({name: "reset-password"});
//     }
//   } catch (error) {
//     console.log(error.response);
//     message.error(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại");
//   } finally {
//     isLoading.value = false;
//   }
// };

const onSubmit = async () => {
  isLoading.value = true;
  const data = {...formState.value}
  // console.log(data);
  await axios.post(`${dirApi}user/send-reset-password-mail`, data)
    .then(response => {
      message.success(response.data.message);
      router.push({name: "reset-password"});
    })
    .catch(error => {
      message.error(error.data.message || "An error occurred");
      // console.log(error);
      errorMail.value = error.response.data.errors
      // console.log(errorMail.value);
    })
    .finally(() => {
      isLoading.value = false;     
    })
}
</script>

<template>
  <section class="bg-white min-h-screen flex flex-col items-center justify-center">
    <div class="container max-w-lg mx-auto py-10">
      <div class="text-center">
        <img class="w-16 h-14 mx-auto" src="../../assets/images/logo.png" alt="Logo" />
        <h1 class="mt-4 text-2xl font-semibold tracking-wide text-gray-800">Forgot password</h1>
        <p class="mt-2 text-gray-500">Enter your email to receive OTP code to reset password.</p>
      </div>

      <a-form class="mt-6" layout="vertical" :model="formState" :rules="rules" @finish="onSubmit">
        <a-form-item label="Email" name="email">
          <a-input v-model:value="formState.email" class="border border-orange-300" type="email" placeholder="Nhập email của bạn" :class="{'border-red-500':errorMail.email }"/>

          <span class="text-red-500" v-if="errorMail.email">{{ errorMail.email[0] }}</span>
        </a-form-item>
        
        <a-form-item>
          <a-button :loading="isLoading" type="primary" class="gradient-btn" html-type="submit" block>Send</a-button>
        </a-form-item>
      </a-form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-orange-500 hover:underline">
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
