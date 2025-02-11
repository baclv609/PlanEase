import axiosInstance from '@/utils/axios-instance';
import { ref } from 'vue';

const dashboard = ref([]);
const loading = ref(false);
const error = ref(null);

export function useDashboard() {
  const getDashboard = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await axiosInstance.get('/api/dashboard');
      dashboard.value = res.data;
      return res;
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    dashboard,
    getDashboard,
    loading,
    error,
  };
}
