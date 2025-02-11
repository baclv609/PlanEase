import axiosInstance from '@/utils/axios-instance';
import { reactive, ref } from 'vue';
import { LocalStorage } from '@/constants';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

const authState = reactive({
  accessToken: localStorage.getItem(LocalStorage.AccessToken),
  expiresIn: parseInt(localStorage.getItem(LocalStorage.ExpiresIn) || '0', 10),
  isLoggedIn: localStorage.getItem(LocalStorage.IsLoggedIn) === 'true' || false,
  deviceValid: localStorage.getItem(LocalStorage.DeviceValid) === 'true' || false,
  deviceId: localStorage.getItem(LocalStorage.DeviceId),
});

const userState = ref({
  name: '',
  email: '',
  password: '',
  device_type: '',
  device_id: '',
});

export function useAuth() {
  const setAuthToken = (accessToken, expiresIn) => {
    expiresIn = Date.now() + expiresIn * 1000;
    authState.accessToken = accessToken;
    authState.expiresIn = expiresIn;
    authState.isLoggedIn = true;
    localStorage.setItem(LocalStorage.AccessToken, accessToken);
    localStorage.setItem(LocalStorage.ExpiresIn, expiresIn.toString());
    localStorage.setItem(LocalStorage.IsLoggedIn, 'true');
  };

  const setStatusByDeviceValid = (deviceValid) => {
    authState.deviceValid = deviceValid;
    localStorage.setItem(LocalStorage.DeviceValid, deviceValid.toString());
  };

  const login = async (data) => {
    return await axiosInstance.post('/api/login', data, {
      headers: {
        'DeviceId': localStorage.getItem(LocalStorage.DeviceId) || '',
        'DeviceType': 'web',
      },
    });
  };

  const info = async () => {
    return await axiosInstance.get('/api/info').then((res) => {
      userState.value = res.data;

      const stateDeviceID = localStorage.getItem(LocalStorage.DeviceId);
      const stateDeviceType = 'web';
      if (
        stateDeviceID !== userState.value?.device_id ||
        stateDeviceType !== userState.value?.device_type
      ) {
        setStatusByDeviceValid(false);
      }
      return res;
    });
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/logout');
    } catch (err) {
      console.log(err);
      message.error('Failed to logout');
    }

    authState.accessToken = '';
    authState.expiresIn = 0;
    authState.isLoggedIn = false;
    authState.deviceValid = true;
    localStorage.removeItem(LocalStorage.AccessToken);
    localStorage.removeItem(LocalStorage.ExpiresIn);
    localStorage.removeItem(LocalStorage.IsLoggedIn);
    localStorage.removeItem(LocalStorage.DeviceValid);
    window.location.reload();
  };

  const register = async (data) => {
    return await axiosInstance.post('/api/register', data);
  };

  const fetchRefreshToken = async () => {
    return await axiosInstance.post('/api/refresh-token').then((res) => {
      setAuthToken(res.data.access_token, res.data.expires_in);
      return res;
    });
  };

  const checkAndRefreshToken = () => {
    const interval = setInterval(async () => {
      console.log('Checking token expiry');
      const expiresIn = JSON.parse(localStorage.getItem(LocalStorage.ExpiresIn) || '0');

      if (authState.isLoggedIn && expiresIn - dayjs().unix() < 150) {
        await fetchRefreshToken().catch(() => {
          console.log('Token expired');
          logout();
        });
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  };

  const generateUniqueDeviceId = async () => {
    try {
      const { data } = await axiosInstance.post('/api/generate-device-id');
      if (data.device_id) {
        localStorage.setItem(LocalStorage.DeviceId, data.device_id);
        authState.deviceId = data.device_id;
      }
    } catch (err) {
      console.log(err);
    }
  };

  return {
    login,
    logout,
    register,
    fetchRefreshToken,
    setAuthToken,
    authState,
    info,
    userState,
    setStatusByDeviceValid,
    checkAndRefreshToken,
    generateUniqueDeviceId,
  };
}
