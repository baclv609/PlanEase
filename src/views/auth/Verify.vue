<script setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";

const otp = ref(["", "", "", "", "", ""]);
const isLoading = ref(false);
const isResending = ref(false);
const email = ref(localStorage.getItem("verifyEmail") || ""); // Lấy email đã lưu
const inputs = ref([]);

const handleInput = (index, event) => {
  const value = event.target.value;
  if (/^\d$/.test(value)) {
    otp.value[index] = value;
    if (index < 5) {
      inputs.value[index + 1]?.focus();
    }
  } else {
    otp.value[index] = "";
  }
};

const handleBackspace = (index, event) => {
  if (event.key === "Backspace" && index > 0 && !otp.value[index]) {
    inputs.value[index - 1]?.focus();
  }
};

const verifyOTP = async () => {
  const code = otp.value.join("");
  if (code.length < 6) {
    message.error("Vui lòng nhập đầy đủ mã OTP.");
    return;
  }

  isLoading.value = true;

  try {
    const res = await axios.post("http://notibro.test/api/auth/verify", {
      otp: code,
    });
    if (res.data.success) {
      message.success("Xác thực thành công!");
      // Redirect hoặc xử lý tiếp theo nếu cần
    } else {
      message.error(res.data.message || "Mã OTP không hợp lệ.");
    }
  } catch (error) {
    message.error("Lỗi xác thực, vui lòng thử lại.");
  } finally {
    isLoading.value = false;
  }
};

const resendOTP = async () => {
  if (!email.value) {
    message.error("Không tìm thấy email đăng ký.");
    return;
  }

  isResending.value = true;
  message.loading("Đang gửi lại mã...");

  try {
    await axios.post("http://notibro.test/api/auth/send-otp", { email: email.value });
    message.success("Mã OTP đã được gửi lại!");
  } catch (error) {
    message.error("Không thể gửi lại mã, vui lòng thử lại.");
  } finally {
    isResending.value = false;
  }
};

</script>

<template>
  <div class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
    <div class="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
      <div class="mx-auto flex w-full max-w-md flex-col space-y-10">
        <!-- Header -->
        <div class="flex flex-col items-center text-center space-y-2">
          <h2 class="font-semibold text-3xl">Email Verification</h2>
          <p class="text-sm font-medium text-gray-400">
            We have sent a code to your email <br />
            <span class="font-semibold text-gray-600">{{ email }}</span>
          </p>
        </div>

        <!-- OTP Input -->
        <div>
          <form @submit.prevent="verifyOTP">
            <div class="flex flex-col space-y-8">
              <!-- OTP Input Boxes -->
              <div class="flex flex-row items-center justify-center gap-2">
                <input v-for="(num, index) in otp" :key="index" ref="inputs"
                  class="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  type="text" maxlength="1" v-model="otp[index]" @input="handleInput(index, $event)"
                  @keydown="handleBackspace(index, $event)" />
              </div>

              <!-- Buttons -->
              <div class="flex flex-col space-y-4">
                <a-button type="primary" html-type="submit" :loading="isLoading">Verify Account</a-button>

                <router-link to="/login" class="text-blue-600 font-medium text-sm flex items-center justify-center"> Back to Login</router-link>

                <a-button type="link" @click="resendOTP" :loading="isResending">Resend Code</a-button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
