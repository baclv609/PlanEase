import { ref, watch } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import '@/views/dashboard/styles/dashboard.css';
import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';
import UserRegistrationChart from '@/views/dashboard/UserRegistrationChart.vue';
import TaskStatisticsChart from '@/views/dashboard/TaskStatisticsChart.vue';
import TaskCountUsers from '@/views/dashboard/TaskCountUsers.vue';

export function useDashboard() {
  const dirApi = import.meta.env.VITE_API_BASE_URL;
  const selectedPeriod = ref('week');
  const dateRange = ref([]);
  const dailyStats = ref([]);
  const taskStats = ref([]);

  const disabledDate = (current) => {
    return current && current > dayjs().endOf('day');
  };

  const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  const fetchTotalUsers = async (startDate, endDate) => {
    try {
      const response = await axios.get(`${dirApi}admin/stats/total-users`, {
        params: {
          start_date: startDate,
          end_date: endDate
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.data.code === 200) {
        dailyStats.value = response.data.data.stats;
      } else {
        message.error(response.data.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê');
    }
  };

  const fetchTaskStats = async (startDate, endDate) => {
    try {
      const response = await axios.get(`${dirApi}admin/stats/total-tasks`, {
        params: {
          start_date: startDate,
          end_date: endDate
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.data.code === 200) {
        taskStats.value = response.data.data.stats;
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu task:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu thống kê công việc');
    }
  };

  const handleFilter = () => {
    if (selectedPeriod.value === 'custom' && dateRange.value?.length === 2) {
      const [startDate, endDate] = dateRange.value;
      Promise.all([
        fetchTotalUsers(formatDate(startDate), formatDate(endDate)),
        fetchTaskStats(formatDate(startDate), formatDate(endDate))
      ]);
    } else if (!dateRange.value?.length && selectedPeriod.value === 'custom') {
      message.warning('Vui lòng chọn khoảng thời gian');
    }
  };

  watch(selectedPeriod, (newValue) => {
    if (newValue === 'week') {
      const endDate = dayjs();
      const startDate = dayjs().subtract(6, 'day');
      dateRange.value = [startDate, endDate];
      
      Promise.all([
        fetchTotalUsers(formatDate(startDate), formatDate(endDate)),
        fetchTaskStats(formatDate(startDate), formatDate(endDate))
      ]);
    } else if (newValue === 'month') {
      const startDate = dayjs().startOf('month');
      const endDate = dayjs().endOf('month');
      dateRange.value = [startDate, endDate];
      
      Promise.all([
        fetchTotalUsers(formatDate(startDate), formatDate(endDate)),
        fetchTaskStats(formatDate(startDate), formatDate(endDate))
      ]);
    }
  });

  const initializeDashboard = () => {
    selectedPeriod.value = 'week';
    const endDate = dayjs();
    const startDate = dayjs().subtract(6, 'day');
    dateRange.value = [startDate, endDate];
    
    Promise.all([
      fetchTotalUsers(formatDate(startDate), formatDate(endDate)),
      fetchTaskStats(formatDate(startDate), formatDate(endDate))
    ]);
  };

  return {
    selectedPeriod,
    dateRange,
    dailyStats,
    taskStats,
    disabledDate,
    handleFilter,
    initializeDashboard
  };
} 