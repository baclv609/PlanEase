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
    { required: true, message: "Vui lòng nhập email", trigger: "blur" },
    { type: "email", message: "Email không hợp lệ", trigger: ["blur", "change"] },
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
      message.error("Có lỗi xảy ra");
      console.log(error);
      errorMail.value = error.response.data.errors
      console.log(errorMail.value);
    })
    .finally(() => {
      isLoading.value = false;     
    })
}
</script>

<template>
  <section class="bg-white min-h-screen flex flex-col items-center justify-center">
    <div class="container max-w-md mx-auto">
      <div class="text-center">
        <img class="w-auto h-7 sm:h-8 mx-auto" src="https://merakiui.com/images/logo.svg" alt="Logo" />
        <h1 class="mt-4 text-2xl font-semibold tracking-wide text-gray-800">Quên mật khẩu</h1>
        <p class="mt-2 text-gray-500">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
      </div>

      <a-form class="mt-6" layout="vertical" :model="formState" :rules="rules" @finish="onSubmit">
        <a-form-item label="Email" name="email">
          <a-input v-model:value="formState.email" type="email" placeholder="Nhập email của bạn" :class="{'border-red-500':errorMail.email }"/>

          <span class="text-red-500" v-if="errorMail.email">{{ errorMail.email[0] }}</span>
        </a-form-item>
        
        <a-form-item>
          <a-button :loading="isLoading" type="primary" html-type="submit" block>Gửi yêu cầu</a-button>
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

<style scoped>
</style>
