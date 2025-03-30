<template>
  <div class="dashboard-container">
    <!-- Phần header thống kê -->
    <div class="stats-header">
      <h1 class="page-title">
        <LineChartOutlined /> Thống kê người dùng
        <span class="subtitle">Theo dõi số lượng người dùng đăng ký theo thời gian</span>
      </h1>

      <!-- Filter section -->
      <div class="filter-section">
        <a-card :bordered="false">
          <div class="filter-container">
            <div class="left-section">
              <a-select
                v-model:value="selectedPeriod"
                style="width: 150px"
                class="period-select"
              >
                <a-select-option value="week">Tuần</a-select-option>
                <a-select-option value="month">Tháng</a-select-option>
                <a-select-option value="custom">Tùy chỉnh</a-select-option>
              </a-select>

              <a-range-picker 
                v-if="selectedPeriod === 'custom'"
                v-model:value="dateRange"
                class="date-picker"
                :disabled-date="disabledDate"
                format="DD-MM-YYYY"
              />
            </div>

            <div class="right-section">
              <a-button type="primary" class="filter-button" @click="handleFilter">
                <template #icon><FilterOutlined /></template>
                Lọc dữ liệu
              </a-button>
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- Chart section -->
    <a-card class="chart-card" :bordered="false">
      <figure class="highcharts-figure">
        <div id="container"></div>
      </figure>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Highcharts from 'highcharts';
import { LineChartOutlined, FilterOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

const dirApi = import.meta.env.VITE_API_BASE_URL;
const selectedPeriod = ref('week');
const dateRange = ref([]);
const dailyStats = ref([]);

const disabledDate = (current) => {
  return current && current > dayjs().endOf('day');
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

const formatDisplayDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
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
      updateChart();
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
    message.error('Có lỗi xảy ra khi tải dữ liệu thống kê');
  }
};

// Xử lý khi thay đổi period
watch(selectedPeriod, (newValue) => {
  if (newValue === 'week') {
    // Lấy 7 ngày gần nhất
    const endDate = dayjs();
    const startDate = dayjs().subtract(6, 'day');
    dateRange.value = [startDate, endDate];
    
    fetchTotalUsers(formatDate(startDate), formatDate(endDate));
  } else if (newValue === 'month') {
    const startDate = dayjs().startOf('month');
    const endDate = dayjs().endOf('month');
    dateRange.value = [startDate, endDate];
    
    fetchTotalUsers(formatDate(startDate), formatDate(endDate));
  }
});

// Xử lý khi click nút lọc
const handleFilter = () => {
  if (selectedPeriod.value === 'custom' && dateRange.value?.length === 2) {
    const [startDate, endDate] = dateRange.value;
    fetchTotalUsers(formatDate(startDate), formatDate(endDate));
  } else if (!dateRange.value?.length && selectedPeriod.value === 'custom') {
    message.warning('Vui lòng chọn khoảng thời gian');
  }
};

// Cập nhật biểu đồ
const updateChart = () => {
  const startDate = dateRange.value[0];
  const endDate = dateRange.value[1];
  
  // Chuyển đổi dữ liệu cho biểu đồ
  const chartData = dailyStats.value.map(item => {
    const date = dayjs(item.date);
    return [
      Date.UTC(date.year(), date.month(), date.date()),
      item.count
    ];
  });
  
  Highcharts.chart('container', {
    title: {
      text: 'Thống kê số lượng người dùng đăng ký',
      style: {
        color: '#227CA0',
        fontWeight: 'bold'
      }
    },

    subtitle: {
      text: `Từ ${formatDisplayDate(startDate)} đến ${formatDisplayDate(endDate)}`,
      style: {
        color: '#8c8c8c'
      }
    },

    xAxis: {
      type: 'datetime',
      labels: {
        format: '{value:%d/%m/%Y}',
        rotation: -45
      }
    },

    yAxis: {
      title: {
        text: 'Số lượng đăng ký'
      },
      min: 0
    },

    tooltip: {
      headerFormat: '<b>{point.x:%d/%m/%Y}</b><br/>',
      pointFormat: 'Số lượng đăng ký: <b>{point.y}</b>'
    },

    series: [{
      name: 'Người dùng đăng ký',
      data: chartData,
      color: {
        linearGradient: {
          x1: 0,
          x2: 1,
          y1: 0,
          y2: 0
        },
        stops: [
          [0, '#ffcc77'],
          [0.5, '#15c5b2'],
          [1, '#227ca0']
        ]
      }
    }],

    plotOptions: {
      series: {
        marker: {
          enabled: true,
          radius: 4
        },
        lineWidth: 2
      }
    }
  });
};

onMounted(() => {
  // Khởi tạo với 7 ngày gần nhất
  selectedPeriod.value = 'week';
  const endDate = dayjs();
  const startDate = dayjs().subtract(6, 'day');
  dateRange.value = [startDate, endDate];
  
  fetchTotalUsers(formatDate(startDate), formatDate(endDate));
});
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: #227CA0;
  display: flex;
  align-items: center;
  gap: 12px;

  .subtitle {
    font-size: 14px;
    color: #8c8c8c;
    font-weight: normal;
    margin-left: 12px;
  }
}

.filter-section {
  margin-bottom: 24px;

  :deep(.ant-card) {
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.period-select {
  :deep(.ant-select-selector) {
    border-radius: 8px !important;
    border: 1px solid #d9d9d9;
    
    &:hover {
      border-color: #15c5b2;
    }
  }
}

.date-picker {
  :deep(.ant-picker) {
    border-radius: 8px;
    
    &:hover {
      border-color: #15c5b2;
    }
  }
}

.filter-button {
  border-radius: 8px;
  height: 40px;
  background: linear-gradient(70deg, #ffcc77 0%, #15c5b2 50%, #227ca0 100%);
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: linear-gradient(70deg, #227ca0 0%, #15c5b2 50%, #ffcc77 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(21, 197, 178, 0.2);
  }
}

.chart-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.highcharts-figure {
  min-width: 310px;
  max-width: 100%;
  margin: 1em auto;
}

#container {
  height: 400px;
  width: 100%;
}
</style>
