<script setup>
import { reactive } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';

const formState = reactive({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: null,
});

const resetForm = () => {
    formState.lastName = "";
    formState.firstName = "";
    formState.email = "";
    formState.password = "";
    formState.confirmPassword = "";
    formState.phone = null;
}

const rule = {
    lastName: [
        { required: true, message: 'Please input your lastName!' },
        { min: 3, message: 'lastName phải có ít nhất 3 ký tự' },
        { max: 30, message: 'lastName phải có ít hơn 31 ký tự' },
    ],
    firstName: [
        { required: true, message: 'Please input your firstName!' },
        { min: 3, message: 'firstName phải có ít nhất 3 ký tự' },
        { max: 30, message: 'firstName phải có ít hơn 31 ký tự' },
    ],
    phone: [
        { required: true, message: 'Please input your phone!' },
        { min: 10, message: 'phone phải có ít nhất 10 ký tự' },
    ],
    email: [
        { required: true, message: 'Please input your email!' },
        { type: 'email', message: 'email không đúng định dạng' },
    ],
    password: [
        { required: true, message: 'Please input your password!' },
        { min: 6, message: 'password phải có ít nhất 6 ký tự' },
        { max: 255, message: 'password phải có ít hơn 256 ký tự' },
    ],
    confirmPassword: [
        { required: true, message: 'Please input your confirmPassword!' },
        { min: 6, message: 'confirmPassword phải có ít nhất 6 ký tự' },
        {
            validator: (rule, value, callback) => {
                if (value !== formState.password) {
                    callback(new Error('Mật khẩu không khớp'));
                } else {
                    callback();
                }
            },
        },
    ],
};

const onFinish = async (values) => {
    try {
        console.log('Success:', values);
        const res = await axios.post('http://localhost:8000/api/auth/register', values);
        if (res.status === 200) {
            message.success('Đăng ký thành công, vui lòng đăng nhập');
            resetForm();
        } else {
            message.error(res.data.message || 'Đăng ký thất bại');
        }
    } catch (e) {
        message.error(e.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau');
    }
};
</script>

<template>
    <section class="bg-white">
        <div class="flex justify-center min-h-screen">
            <div class="hidden bg-cover lg:block lg:w-2/5"
                style="background-image: url('https://images.unsplash.com/photo-1494621930069-4fd4b2e24a11?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=715&q=80')">
            </div>

            <!-- form -->
            <div class="flex items-center flex-col justify-center w-full max-w-3xl p-8 mx-auto lg:px-12 lg:w-3/5">
                <div class="flex items-center flex-col justify-center">
                    <div class="w-full">
                        <h1 class="text-2xl font-semibold tracking-wider text-gray-800 capitalize ">
                            Đăng ký Tài Khoản Miễn Phí Của Bạn Bây Giờ.
                        </h1>

                        <p class="mt-4 text-gray-500">
                            Tôi sẽ giúp bạn thiết lập bạn có thể xác minh tài khoản cá nhân của mình và bắt đầu thiết
                            lập hồ sơ của mình.
                        </p>

                        <a-form :layout="'vertical'" :model="formState" :rules="rule" name="basic" autocomplete="off"
                            @finish="onFinish" class="grid grid-cols-1 gap-x-6 gap-y-3 pt-8 md:grid-cols-2">
                            <a-form-item label="Họ" name="lastName">
                                <a-input v-model:value="formState.lastName" class="px-5 py-3" placeholder="John" />
                            </a-form-item>

                            <a-form-item label="Tên" name="firstName">
                                <a-input v-model:value="formState.firstName" class="px-5 py-3" placeholder="Snow" />
                            </a-form-item>

                            <a-form-item label="Số điện thoại" name="phone">
                                <a-input v-model:value="formState.phone" class="px-5 py-3" type="number"
                                    placeholder="XXX-XX-XXXX-XXX" />
                            </a-form-item>

                            <a-form-item label="Địa chỉ email" name="email">
                                <a-input v-model:value="formState.email" class="px-5 py-3"
                                    placeholder="johnsnow@example.com" />
                            </a-form-item>

                            <a-form-item label="Mật khẩu" name="password">
                                <a-input-password v-model:value="formState.password" class="px-5 py-3"
                                    placeholder="Nhập mật khẩu của bạn" />
                            </a-form-item>

                            <a-form-item label="Xác nhận mật khẩu" name="confirmPassword">
                                <a-input-password v-model:value="formState.confirmPassword" class="px-5 py-3"
                                    placeholder="Nhập lại mật khẩu của bạn" />
                            </a-form-item>

                            <button
                                class="boder-gray flex items-center justify-between w-full px-6 py-3 text-sm tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg">
                                <span>Đăng ký </span>

                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 rtl:-scale-x-100"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>

                            <p class="text-center block m-0 text-sm leading-10 text-gray-600">Bạn đã có tài khoản
                                <router-link to="/login" class="text-sm font-medium text-blue-500 no-underline">Đăng
                                    nhập ngay</router-link>
                            </p>

                        </a-form>
                    </div>
                </div>

                <div class="mt-4">
                    <p class="block m-0 text-sm leading-10 text-gray-600">Trải nghiệm không cần đăng ký <router-link
                            to="/" class="text-sm font-medium text-blue-500 no-underline">bấm tại đây</router-link></p>
                </div>
            </div>

        </div>
    </section>
</template>

<style lang=""></style>
