<script setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";
import router from "@/router";

const otp = ref(["", "", "", "", "", ""]);
const isLoading = ref(false);
const isResending = ref(false);
const email = ref(localStorage.getItem("verifyEmail") || ""); // Lấy email đã lưu
const inputs = ref([]);
const dirApi = import.meta.env.VITE_API_BASE_URL;

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
    message.error("Please enter full OTP code.");
    return;
  }

  isLoading.value = true;

  try {
    const res = await axios.post(`${dirApi}auth/verify`, {
      otp: code,
      email: email.value
    });
    if (res.data.code == 200) {
      message.success("Verification successful!");
      // Redirect hoặc xử lý tiếp theo nếu cần
      router.push({ name: "login" });
    } else {
      message.error(res.data.message || "Invalid OTP code.");
    }
  } catch (error) {
    message.error("Authentication error, please try again.");
  } finally {
    isLoading.value = false;
  }
};

const resendOTP = async () => {
  if (!email.value) {
    message.error("Registration email not found.");
    return;
  }

  isResending.value = true;
  message.loading("Resending code...");

  try {
    await axios.post(`${dirApi}auth/send-otp`, { email: email.value });

    // Reset OTP input
    otp.value = ["", "", "", "", "", ""]; // Reset lại giá trị của OTP
    inputs.value[0]?.focus()

    message.success("OTP code has been resent!");
  } catch (error) {
    message.error("Unable to resend code, please try again.");
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
                  class="w-12 h-12 text-center text-lg font-semibold border border-orange-300 rounded-md outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  type="text" maxlength="1" v-model="otp[index]" @input="handleInput(index, $event)"
                  @keydown="handleBackspace(index, $event)" />
              </div>

              <!-- Buttons -->
              <div class="flex flex-col space-y-4">
                <a-button type="primary" class="gradient-btn" html-type="submit" :loading="isLoading">Verify Account</a-button>

                <a-button type="link" class="font-bold text-lg text-orange-300" @click="resendOTP" :loading="isResending">Resend Code</a-button>

                <router-link to="/login" class="text-gray-400 font-medium text-sm flex items-center justify-center hover:text-gray-600">
                  Back to Login</router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
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