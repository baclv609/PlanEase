<template>
  <div class="statistics-container">
    <div class="filter-section">
      <div class="left-section">
        <a-select v-model:value="filterType" style="width: 120px" @change="handleFilterChange" class="filter-select">
          <a-select-option value="week">Tuần</a-select-option>
          <a-select-option value="month">Tháng</a-select-option>
          <a-select-option value="custom">Tùy chọn</a-select-option>
        </a-select>

        <a-range-picker v-if="filterType === 'custom'" v-model:value="dateRange" :placeholder="['Từ ngày', 'Đến ngày']"
          @change="handleDateChange" class="date-picker" :format="'DD/MM/YYYY'" :value-format="'DD/MM/YYYY'" />
        <a-button v-if="filterType === 'custom'" type="primary" @click="fetchData" :loading="loading" class="filter-btn">
          <template #icon>
            <FilterOutlined />
          </template>
          Lọc
        </a-button>
      </div>

      <div class="right-section">
        <a-tag color="blue">
          <ClockCircleOutlined /> Cập nhật lần cuối: {{ lastUpdateTime }}
        </a-tag>
        <a-button type="primary" class="refresh-button" @click="refreshData" :loading="loading">
          <template #icon>
            <ReloadOutlined />
          </template>
          Làm mới
        </a-button>
      </div>
    </div>

    <div class="statistics-grid">
      <div class="statistics-item">
        <CompletionRate :date-range="dateRange" :key="chartKeyTask"/>
      </div>
      <div class="statistics-item">
        <BusiestDay :date-range="dateRange" :key="chartKeyQuantity" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { FilterOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import CompletionRate from './CompletionRate.vue';
import BusiestDay from './BusiestDay.vue';
import { useProfile } from './composables/useProfile';
import dayjs from 'dayjs';

const { loading, fetchCompletionRate, fetchBusiestDay } = useProfile();
const dateRange = ref([]);
const filterType = ref('week');
const lastUpdateTime = ref(new Date().toLocaleString('vi-VN'));
const router = useRouter();
const chartKeyTask = ref(0);
const chartKeyQuantity = ref(0);

const refreshData = async () => {
  loading.value = true;
  try {
    await fetchData();
    lastUpdateTime.value = new Date().toLocaleString('vi-VN');
    message.success('Đã cập nhật dữ liệu mới nhất');
    chartKeyTask.value++;
    chartKeyQuantity.value++;
    // router.go(0);
  } catch (error) {
    message.error('Có lỗi xảy ra khi cập nhật dữ liệu');
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = (value) => {
  if (value === 'week') {
    filterByWeek();
  } else if (value === 'month') {
    filterByMonth();
  } else {
    dateRange.value = [];
  }
};

const handleDateChange = (dates) => {
  dateRange.value = dates;
};

const filterByWeek = () => {
  const today = dayjs();
  const startOfWeek = today.startOf('week');
  const endOfWeek = today.endOf('week');

  dateRange.value = [
    startOfWeek.format('DD/MM/YYYY'),
    endOfWeek.format('DD/MM/YYYY')
  ];

  fetchData();
};

const filterByMonth = () => {
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const endOfMonth = today.endOf('month');

  dateRange.value = [
    startOfMonth.format('DD/MM/YYYY'),
    endOfMonth.format('DD/MM/YYYY')
  ];

  fetchData();
};

const fetchData = async () => {
  if (dateRange.value && dateRange.value.length === 2) {
    // Chuyển đổi từ DD/MM/YYYY sang YYYY-MM-DD
    const startDate = dayjs(dateRange.value[0], 'DD/MM/YYYY').format('YYYY-MM-DD');
    const endDate = dayjs(dateRange.value[1], 'DD/MM/YYYY').format('YYYY-MM-DD');

    await Promise.all([
      fetchCompletionRate(startDate, endDate),
      fetchBusiestDay(startDate, endDate)
    ]);
  }
};

// Gọi fetchData khi component được mount
onMounted(() => {
  filterByWeek();
});
</script>

<style scoped>
.statistics-container {
  padding: 24px;
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  justify-content: space-between;
}

.left-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.right-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-select {
  background: linear-gradient(70deg, #ffcc77, #15c5b2);
  border: none;
  border-radius: 8px;
  width: 120px;
}

:deep(.ant-select-selector) {
  background: transparent !important;
  border: none !important;
}

:deep(.ant-select-selection-item) {
  color: white !important;
}

:deep(.ant-select-arrow) {
  color: white !important;
}

.date-picker {
  width: 300px;
}

.filter-btn {
  background: linear-gradient(70deg, #ffcc77, #15c5b2);
  border: none;
  height: 40px;
  padding: 0 24px;
}

.filter-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.refresh-button {
  background: linear-gradient(70deg, #ffcc77, #15c5b2);
  border: none;
  height: 40px;
  padding: 0 24px;
}

.refresh-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

:deep(.ant-tag-blue) {
  color: #227CA0;
  background: rgba(34, 124, 160, 0.1);
  border-color: #227CA0;
  padding: 4px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.statistics-item {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 24px;
}

.statistics-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1200px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .left-section, .right-section {
    width: 100%;
    justify-content: space-between;
  }

  .filter-select {
    width: 100% !important;
  }

  .date-picker {
    width: 100%;
  }
}
</style>