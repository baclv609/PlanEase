<script setup>
import { reactive, ref } from "vue";
import { message, Form, Input, Select, Button } from "ant-design-vue";
import { useAuth } from "@/composables";
import axios from "axios";
import router from "@/router";

// console.log(import.meta.env.VITE_API_BASE_URL);
const dirApi = import.meta.env.VITE_API_BASE_URL;

const formState = reactive({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  phone: "",
  gender: "",
  address: "",
});

const { register } = useAuth();
const isLoading = ref(false);

const resetForm = () => {
  Object.keys(formState).forEach((key) => {
    formState[key] = "";
  });
};

const rules = {
  first_name: [
    { required: true, message: "Please enter first name!" },
    { max: 255, message: "First name cannot exceed 255 characters" },
  ],
  last_name: [
    { required: true, message: "Please enter last name!" },
    { max: 255, message: "Last name cannot exceed 255 characters" },
  ],
  email: [
    { required: true, message: "Please enter email!" },
    { type: "email", message: "Email is not in correct format" },
    { max: 255, message: "Email must not exceed 255 characters" },
  ],
  password: [
    { required: true, message: "Please enter password!" },
    { min: 8, message: "Password must be at least 8 characters" },
    {
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      message: "Password must contain uppercase, lowercase, numbers and special characters",
    },
  ],
  confirm_password: [
    { required: true, message: "Please confirm password!" },
    {
      validator: (rule, value) => {
        return new Promise((resolve, reject) => {
          if (value !== formState.password) {
            reject("Passwords do not match"); // Báo lỗi
          } else {
            resolve(); // Hợp lệ
          }
        });
      },
    },
  ],
  phone: [
    { required: true, message: "Please enter phone number!" },
    {
      pattern: /^0\d{9}$/,
      message: "Invalid phone number",
    },
  ],
  gender: [{ required: true, message: "Please choose gender!" }],
  address: [
    { required: true, message: "Please enter address!" },
    { max: 255, message: "Address cannot exceed 255 characters" },
  ],
};
const storeError = ref({}); // Lưu lỗi từ backend

const onFinish = async (values) => {
  isLoading.value = true; // Bắt đầu loading
  values.password_confirmation = values.confirm_password;
  delete values.confirm_password;
  // console.log(values);

  storeError.value = {}; // Reset lỗi trước khi gọi API

  try {
    const res = await axios.post(
      `${dirApi}auth/register`,
      values
    );
    // console.log(res);
    // console.log("res.data.code", res.data.code);
    // console.log("res.status", res.status);

    if (res?.data.code === 201 && res?.status == 200) {

      const userEmail = values.email; // Lấy email đã đăng ký
      localStorage.setItem("verifyEmail", userEmail);
      message.success(res.data.message || "Registration successful, please confirm email");
      resetForm();
      router.push({name: 'verify'}); // Chuyển hướng đến trang xác minh
      
    } else {
      message.error(res.data?.message || "Registration failed");
    }
  } catch (e) {
    // console.error("Lỗi từ backend:", e.response?.data);

    if (e.response?.data?.errors) {
      storeError.value = { ...e.response.data.errors }; // Cập nhật lỗi từ backend
      message.error("Registration failed, please check again.");
    } else if (e.response?.data?.message) {
      message.error(e.response.data.message);
    } else {
      message.error("An error occurred, please try again.");
    }
  } finally {
    isLoading.value = false; // Kết thúc loading
  }
};
</script>

<template>
  <section class="bg-white">
    <div class="flex justify-center min-h-screen">
      <div
        class="hidden flex align-center my-auto mx-auto bg-cover lg:block lg:w-2/5">
          <img class="w-full" src="../../assets/images/Register-To-do-list-amico-1-removebg-preview.png" alt="">
        </div>

      <!-- form -->
      <div
        class="flex items-center flex-col justify-center w-full max-w-3xl p-8 mx-auto lg:px-12 lg:w-3/5"
      >
        <div class="flex items-center flex-col justify-center">
          <div class="w-full">
            <h1
              class="text-4xl font-bold tracking-wider text-gray-800 capitalize"
            >
              Register
            </h1>

            <p class="mt-4 text-gray-500">
              Sign up for a free account now to easily manage your schedule and never miss any important tasks!
            </p>
            <a-form
              :layout="'vertical'"
              :model="formState"
              :rules="rules"
              name="basic"
              autocomplete="off"
              @finish="onFinish"
              class="grid grid-cols-1 gap-4 pt-8 md:grid-cols-2"
            >
              <a-form-item
                label="Last name"
                name="last_name"
                status="{{storeError.last_name ? 'error' : 'success'}}"
              >
                <a-input
                  v-model:value="formState.last_name"
                  @input="storeError.last_name = ''"
                  placeholder="John"
                  class="border border-orange-300"
                  :class="{'border-red-500': storeError.last_name}"
                />
                <span v-if="storeError.last_name" class="text-red-500">
                  {{ storeError.last_name?.[0] }}
                </span>
              </a-form-item>

              <a-form-item
                label="First name"
                name="first_name"
                status="{{storeError.first_name ? 'error' : 'success'}}"
                :class="{'border-red-500': storeError.first_name}"
              >
                <a-input
                  v-model:value="formState.first_name"
                  @input="storeError.first_name = ''"
                  class="border border-orange-300"
                  placeholder="Snow"
                />
                <span v-if="storeError.first_name" class="text-red-500">
                  {{ storeError.first_name?.[0] }}
                </span>
              </a-form-item>

              <a-form-item
                label="Email"
                name="email"
                status="{{storeError.email ? 'error' : 'success'}}"
              >
                <a-input
                  v-model:value="formState.email"
                  @input="storeError.email = ''"
                  class="border border-orange-300"
                  placeholder="johnsnow@example.com"
                  :class="{'border-red-500': storeError.email}"
                />
                <span v-if="storeError.email" class="text-red-500">
                  {{ storeError.email?.[0] }}
                </span>
              </a-form-item>

              <a-form-item
                label="Phone number"
                name="phone"
                status="{{storeError.phone ? 'error' : 'success'}}"
              >
                <a-input
                  v-model:value="formState.phone"
                  @input="storeError.phone = ''"
                  class="border border-orange-300"
                  type="number"
                  placeholder="xxx-xxx-xxxx"
                  :class="{'border-red-500': storeError.phone}"
                />
                <span v-if="storeError.phone" class="text-red-500">
                  {{ storeError.phone?.[0] }}
                </span>
              </a-form-item>

              <a-form-item
                label="Password"
                name="password"
                status="{{storeError.password ? 'error' : 'success'}}"
                :class="{'border-red-500': storeError.password}"
              >
                <a-input-password
                  v-model:value="formState.password"
                  @input="storeError.password = ''"
                  class="border border-orange-300"
                  placeholder="Enter your password"
                />
                <span v-if="storeError.password" class="text-red-500">
                  {{ storeError.password?.[0] }}
                </span>
              </a-form-item>

              <a-form-item label="Confirm password" name="confirm_password">
                <a-input-password
                  v-model:value="formState.confirm_password"
                  class="border border-orange-300"
                  placeholder="Re-enter your password"
                />
              </a-form-item>

              <a-form-item
                label="Gender"
                name="gender"
                status="{{storeError.gender ? 'error' : 'warning'}}"
                :class="{'border-red-500': storeError.gender}"
              >
                <Select
                  v-model:value="formState.gender"
                  placeholder="Choose gender"
                  :style="{ border: '1.2px solid #FFCC77', borderRadius: '8px' }"
                >
                  <Select.Option value="male">Male</Select.Option>
                  <Select.Option value="female">Female</Select.Option>
                </Select>
                <span v-if="storeError.gender" class="text-red-500">
                  {{ storeError.gender?.[0] }}
                </span>
              </a-form-item>

              <a-form-item
                label="Address"
                name="address"
                status="{{storeError.address ? 'error' : 'success'}}"
                :class="{'border-red-500': storeError.address}"
              >
                <a-input
                  v-model:value="formState.address"
                  @input="storeError.address = ''"
                  class="border border-orange-300"
                  placeholder="Enter your address"
                />
                <span v-if="storeError.address" class="text-red-500">
                  {{ storeError.address?.[0] }}
                </span>
              </a-form-item>
                <a-form-item class="col-span-2">
                  <a-button
                    type="primary"
                    html-type="submit"
                    :loading="isLoading"
                    class="gradient-btn"
                    >Register</a-button
                  >
                </a-form-item>

                <p class="text-center block m-0 text-sm leading-10 text-gray-600 col-span-2">
                  You already have an account
                  <router-link
                    to="/login"
                    class="text-sm font-medium text-orange-500 no-underline"
                    >Login now</router-link>
                </p>
            </a-form>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center -my-10">
      <p class="block m-0 text-sm leading-10 text-gray-600">
        Experience without registration
        <router-link
          to="/"
          class="text-sm font-medium text-orange-500 no-underline"
          >Click here!</router-link
        >
      </p>
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
