import axiosInstance from '@/utils/axios-instance';
import { reactive, ref } from 'vue';
import { LocalStorage } from '@/constants';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

const authState = reactive({
  accessToken: localStorage.getItem(LocalStorage.AccessToken) || '',
  isLoggedIn: localStorage.getItem(LocalStorage.IsLoggedIn) === 'true',
});

const userState = ref({ name: '', email: '' });
const saveAuthData = (accessToken) => {
  authState.accessToken = accessToken;
  authState.isLoggedIn = true;
  localStorage.setItem(LocalStorage.AccessToken, accessToken);
  localStorage.setItem(LocalStorage.IsLoggedIn, 'true');
};

const clearAuthData = () => {
  authState.accessToken = '';
  authState.isLoggedIn = false;
  localStorage.removeItem(LocalStorage.AccessToken);
  localStorage.removeItem(LocalStorage.IsLoggedIn);
};

const handleApiError = (error, defaultMessage = 'Có lỗi xảy ra') => {
  if (error.response) {
    const { status, data } = error.response;
    message.error(data?.message || defaultMessage);
    return Promise.reject({ status, ...data });
  }
  message.error('Không thể kết nối đến máy chủ');
  return Promise.reject(error);
};

export function useAuth() {
  const login = async (data) => {
    try {
      const { data: response } = await axiosInstance.post('/auth/login', data);
      saveAuthData(response.access_token);
      return response;
    } catch (error) {
      return handleApiError(error, 'Đăng nhập thất bại');
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      message.error('Đăng xuất thất bại');
    } finally {
      clearAuthData();
      window.location.reload();
    }
  };

  const register = async (data) => {
    try {
      return await axiosInstance.post('/auth/register', data);
    } catch (error) {
      return handleApiError(error, 'Đăng ký thất bại');
    }
  };

  const getUserInfo = async () => {
    try {
      const { data: response } = await axiosInstance.get('/auth/info');
      userState.value = response;
      return response;
    } catch (error) {
      return handleApiError(error, 'Lấy thông tin người dùng thất bại');
    }
  };

  return { login, logout, register, getUserInfo, authState, userState };
}