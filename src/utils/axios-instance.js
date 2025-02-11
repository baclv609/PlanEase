// import axios from 'axios';
import { useAuth } from '@/composables';
import { LocalStorage } from '@/constants';
import { message as $message } from 'ant-design-vue';
import router from '@/router';
import axios from 'axios';

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_API_ENDPOINT });

const loginEndpoint = '/api/login';
const refreshTokenEndpoint = '/api/refresh-token';
const registerEndpoint = '/api/register';

const onRequest = (request) => {
  const AccessToken = localStorage.getItem(LocalStorage.AccessToken);
  if (![loginEndpoint, registerEndpoint].includes(request.url)) {
    request.headers.Authorization = `Bearer ${AccessToken}`;
  }
  return request;
};

const onResponse = async (response) => {
  const { fetchRefreshToken, logout, setStatusByDeviceValid } = useAuth();
  const { status, data } = response;
  const { code, message = 'Unknown error', errors } = data || {};

  if (code === 700 || status === 700) {
    setStatusByDeviceValid(false);
    $message.error('Device not valid');
    router.push({ name: 'device' });
  }

  if (status === 401 || code === 401) {
    if (response.config.url !== refreshTokenEndpoint) {
      try {
        await fetchRefreshToken();
      } catch {
        logout();
        return Promise.reject({ message: 'Token expired', code, errors });
      }
    } else {
      logout();
      return Promise.reject({ message: 'Token expired', code, errors });
    }
  }

  if (status !== 200 || code !== 200) {
    return Promise.reject({ message, code, errors });
  }

  return data;
};

const onError = (error) => {
  console.error(error);
  const { logout } = useAuth();
  const { status, data = {} } = error.response || {};
  const { code = status, message = error?.message, errors } = data;
  
  if (code === 401) {
    logout();
  }

  return Promise.reject({ message, errors, code });
};

axiosInstance.interceptors.request.use(onRequest, onError);
axiosInstance.interceptors.response.use(onResponse, onError);

export default axiosInstance;
