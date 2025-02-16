<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";

const formState = reactive({
  email: "",
  password: "",
  // remember: false
});
const isLoading = ref(false);
const rule = {
  email: [
    { required: true, message: "Vui lòng nhập email" },
    { type: "email", message: "Email không đúng định dạng" },
  ],
  password: [
    { required: true, message: "Vui lòng nhập password!" },
    { min: 6, message: "password phải có ít nhất 6 ký tự" },
    { max: 255, message: "password phải có ít hơn 256 ký tự" },
  ],
};

const onFinish = async (values) => {
  try {
    isLoading.value = true;
    const res = await axios.post("http://notibro.test/api/auth/login", values);
    // const res = await login(values);
    // console.log(res.data.data.accessToken);
    console.log("res.data", res.data);
    console.log("res.data.data", res.data.data);


    // console.log(import.meta.env.BASE_URL);
    if (res.data.code === 200) {
      message.success("Đăng nhập thành công");
      console.log(res.data.data.access_token);
      console.log("user", res.data.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      localStorage.setItem("access_token", res.data.data.access_token);
      router.push("/home");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại sau";
    message.error(errorMessage);
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-[100vh]">
    <div
      class="flex w-full justify-items-center max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg lg:max-w-4xl"
    >
      <div
        class="hidden bg-cover lg:block lg:w-1/2"
        style="
          background-image: url('https://images.unsplash.com/photo-1513001900722-370f803f498d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
        "
      ></div>

      <a-form
        layout="vertical"
        :model="formState"
        :rules="rule"
        name="basic"
        @finish="onFinish"
        class="w-full px-6 py-8 md:px-8 lg:w-1/2"
      >
        <p class="mt-3 text-xl text-center text-gray-600">
          Chào mừng bạn trở lại!
        </p>

        <a
          href="#"
          class="no-underline boder-gray flex items-center justify-center mt-4 text-gray-600 transition-colors duration-300 transform border rounded-lg hover:bg-gray-50"
        >
          <div class="px-4 py-2">
            <svg class="w-6 h-6" viewBox="0 0 40 40">
              <path
                d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                fill="#FFC107"
              />
              <path
                d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                fill="#FF3D00"
              />
              <path
                d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                fill="#4CAF50"
              />
              <path
                d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                fill="#1976D2"
              />
            </svg>
          </div>

          <span class="w-5/6 px-4 py-3 font-bold text-center"
            >Đăng nhập bằng Google</span
          >
        </a>

        <div class="flex items-center justify-between mt-4">
          <span class="w-1/5 border-b lg:w-1/4"></span>

          <a
            href="#"
            class="no-underline text-xs text-center text-gray-500 uppercase hover:underline"
            >HOẶC ĐĂNG NHẬP BẰNG EMAIL
          </a>

          <span class="w-1/5 border-b lg:w-1/4"></span>
        </div>

        <a-form-item
          label="Địa chỉ
                        email"
          name="email"
          class="mt-4 block mb-2 text-sm font-medium text-gray-600"
          for="email"
        >
          <a-input
            v-model:value="formState.email"
            id="LoggingEmailAddress"
            class="px-4 py-2 text-gray-700"
            type="email"
          />
        </a-form-item>

        <a-form-item
          label="Password"
          name="password"
          class="mt-4 block mb-2 text-sm font-medium text-gray-600"
        >
          <a-input-password
            v-model:value="formState.password"
            class="px-4 py-2"
          />
        </a-form-item>

        <a-form-item name="remember">
          <!-- <a-checkbox v-model:checked="formState.remember">Giữ đăng nhập cho những lần sau</a-checkbox> -->
        </a-form-item>

        <div class="mt-6">
          <button
            class="boder-[#ccc] w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
          >
            Đăng nhập
          </button>
        </div>

        <div class="flex items-center justify-center flex-col gap-4 mt-4">
          <router-link
            to="#"
            class="no-underline text-xs text-blue-500 hover:underline"
            >Quên mật khẩu?</router-link
          >

          <router-link
            to="/register"
            class="no-underline text-xs text-gray-500 uppercase hover:underline"
            >HOẶC ĐĂNG KÝ
          </router-link>
        </div>
      </a-form>
    </div>
    <div class="absolute bottom-4">
      <p class="block m-0 text-sm leading-10 text-gray-600">
        Trải nghiệm không cần đăng ký
        <router-link
          to="/"
          class="text-sm font-medium text-blue-500 no-underline"
          >bấm tại đây</router-link
        >
      </p>
    </div>
  </div>
</template>

<style lang="scss"></style>
