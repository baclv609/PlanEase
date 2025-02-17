<script setup>
import { reactive, ref } from "vue";
import { message, Form, Input, Select, Button } from "ant-design-vue";
import { useAuth } from "@/composables";
import axios from "axios";
import router from "@/router";

// console.log(import.meta.env.VITE_API_BASE_URL);


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
    { required: true, message: "Vui lòng nhập tên!" },
    { max: 255, message: "Tên không được quá 255 ký tự" },
  ],
  last_name: [
    { required: true, message: "Vui lòng nhập họ!" },
    { max: 255, message: "Họ không được quá 255 ký tự" },
  ],
  email: [
    { required: true, message: "Vui lòng nhập email!" },
    { type: "email", message: "Email không đúng định dạng" },
    { max: 255, message: "Email không được quá 255 ký tự" },
  ],
  password: [
    { required: true, message: "Vui lòng nhập mật khẩu!" },
    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
    {
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      message: "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt",
    },
  ],
  confirm_password: [
    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
    {
      validator: (rule, value, callback) => {
        if (value !== formState.password) {
          callback(new Error("Mật khẩu không khớp"));
        } else {
          callback();
        }
      },
    },
  ],
  phone: [
    { required: true, message: "Vui lòng nhập số điện thoại!" },
    {
      pattern: /^0\d{9}$/,
      message: "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0",
    },
  ],
  gender: [{ required: true, message: "Vui lòng chọn giới tính!" }],
  address: [
    { required: true, message: "Vui lòng nhập địa chỉ!" },
    { max: 255, message: "Địa chỉ không được quá 255 ký tự" },
  ],
};
const storeError = ref({}); // Lưu lỗi từ backend

const onFinish = async (values) => {
  isLoading.value = true; // Bắt đầu loading
  values.password_confirmation = values.confirm_password;
  delete values.confirm_password;
  console.log(values);

  storeError.value = {}; // Reset lỗi trước khi gọi API

  try {
    const res = await axios.post(
      "http://notibro.test/api/auth/register",
      values
    );
    // console.log(res);
    console.log("res.data.code", res.data.code);
    console.log("res.status", res.status);

    if (res?.data.code === 201 && res?.status == 200) {

      const userEmail = values.email; // Lấy email đã đăng ký
      localStorage.setItem("verifyEmail", userEmail);
      message.success("Đăng ký thành công, vui lòng đăng nhập");
      resetForm();
      router.push("/verify"); // Chuyển hướng đến trang xác minh
      
    } else {
      message.error(res.data?.message || "Đăng ký thất bại");
    }
  } catch (e) {
    console.error("Lỗi từ backend:", e.response?.data);

    if (e.response?.data?.errors) {
      storeError.value = { ...e.response.data.errors }; // Cập nhật lỗi từ backend
      message.error("Đăng ký thất bại, vui lòng kiểm tra lỗi.");
    } else if (e.response?.data?.message) {
      message.error(e.response.data.message);
    } else {
      message.error("Đã xảy ra lỗi, vui lòng thử lại.");
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
        class="hidden bg-cover lg:block lg:w-2/5"
        style="
          background-image: url('https://images.unsplash.com/photo-1494621930069-4fd4b2e24a11?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=715&q=80');
        "
      ></div>

      <!-- form -->
      <div
        class="flex items-center flex-col justify-center w-full max-w-3xl p-8 mx-auto lg:px-12 lg:w-3/5"
      >
        <div class="flex items-center flex-col justify-center">
          <div class="w-full">
            <h1
              class="text-2xl font-semibold tracking-wider text-gray-800 capitalize"
            >
              Đăng ký Tài Khoản Miễn Phí Của Bạn Bây Giờ.
            </h1>

            <p class="mt-4 text-gray-500">
              Tôi sẽ giúp bạn thiết lập bạn có thể xác minh tài khoản cá nhân
              của mình và bắt đầu thiết lập hồ sơ của mình.
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
                label="Họ"
                name="last_name"
                :validate-status="storeError.last_name ? 'error' : ''"
                :help="storeError.last_name?.[0]"
              >
                <a-input
                  v-model:value="formState.last_name"
                  @input="storeError.last_name = ''"
                  placeholder="John"
                  class="px-5 py-3"
                />
              </a-form-item>

              <a-form-item
                label="Tên"
                name="first_name"
                :validate-status="storeError.first_name ? 'error' : ''"
                :help="storeError.first_name?.[0]"
              >
                <a-input
                  v-model:value="formState.first_name"
                  @input="storeError.first_name = ''"
                  class="px-5 py-3"
                  placeholder="Snow"
                />
              </a-form-item>

              <a-form-item
                label="Email"
                name="email"
                :validate-status="storeError.email ? 'error' : ''"
                :help="storeError.email?.[0]"
              >
                <a-input
                  v-model:value="formState.email"
                  @input="storeError.email = ''"
                  class="px-5 py-3"
                  placeholder="johnsnow@example.com"
                />
              </a-form-item>

              <a-form-item
                label="Số điện thoại"
                name="phone"
                :validate-status="storeError.phone ? 'error' : ''"
                :help="storeError.phone?.[0]"
              >
                <a-input
                  v-model:value="formState.phone"
                  @input="storeError.phone = ''"
                  class="px-5 py-3"
                  type="number"
                  placeholder="XXX-XX-XXXX-XXX"
                />
              </a-form-item>

              <a-form-item
                label="Mật khẩu"
                name="password"
                :validate-status="storeError.password ? 'error' : ''"
                :help="storeError.password?.[0]"
              >
                <a-input-password
                  v-model:value="formState.password"
                  @input="storeError.password = ''"
                  class="px-5 py-3"
                  placeholder="Nhập mật khẩu của bạn"
                />
              </a-form-item>

              <a-form-item label="Xác nhận mật khẩu" name="confirm_password">
                <a-input-password
                  v-model:value="formState.confirm_password"
                  class="px-5 py-3"
                  placeholder="Nhập lại mật khẩu của bạn"
                />
              </a-form-item>

              <a-form-item
                label="Giới tính"
                name="gender"
                :validate-status="storeError.gender ? 'error' : ''"
                :help="storeError.gender?.[0]"
              >
                <Select
                  v-model:value="formState.gender"
                  placeholder="Chọn giới tính"
                >
                  <Select.Option value="male">Nam</Select.Option>
                  <Select.Option value="female">Nữ</Select.Option>
                </Select>
              </a-form-item>

              <a-form-item
                label="Địa chỉ"
                name="address"
                :validate-status="storeError.address ? 'error' : ''"
                :help="storeError.address?.[0]"
              >
                <a-input
                  v-model:value="formState.address"
                  @input="storeError.address = ''"
                />
              </a-form-item>
              <a-form-item class="col-span-2">
                <a-button
                  type="primary"
                  html-type="submit"
                  :loading="isLoading"
                  class="flex items-center justify-center w-full px-6 py-3 text-sm tracking-wide text-white bg-blue-500 rounded-lg transition-colors duration-300 transform hover:bg-blue-600"
                  >Đăng ký</a-button
                >
              </a-form-item>

              <p
                class="text-center block m-0 text-sm leading-10 text-gray-600 col-span-2"
              >
                Bạn đã có tài khoản
                <router-link
                  to="/login"
                  class="text-sm font-medium text-blue-500 no-underline"
                  >Đăng nhập ngay</router-link
                >
              </p>
            </a-form>
          </div>
        </div>

        <div class="mt-4">
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
    </div>
  </section>
</template>

<style lang=""></style>
