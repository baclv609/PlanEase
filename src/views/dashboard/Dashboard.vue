<template>
  <div class="dashboard-container">
    <!-- Phần header thống kê -->
    <div class="stats-header">
      <h1 class="page-title">
        <LineChartOutlined /> Thống kê hệ thống
        <span class="subtitle">Theo dõi số lượng người dùng và công việc trong hệ thống</span>
      </h1>

      <!-- Filter section -->
      <div class="filter-section">
        <a-card :bordered="false">
          <div class="filter-container">
            <div class="left-section">
              <a-select v-model:value="selectedPeriod" style="width: 150px" class="period-select">
                <a-select-option value="week">Tuần</a-select-option>
                <a-select-option value="month">Tháng</a-select-option>
                <a-select-option value="custom">Tùy chỉnh</a-select-option>
              </a-select>

              <a-range-picker v-if="selectedPeriod === 'custom'" v-model:value="dateRange" class="date-picker"
                :disabled-date="disabledDate" format="DD-MM-YYYY" />
            </div>

            <div class="right-section">
              <button class="filter-button" @click="handleFilter">
                <FilterOutlined class="filter-icon" />
                Lọc dữ liệu
                <div class="hoverEffect">
                  <div></div>
                </div>
              </button>
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- Chart section -->
    <div class="charts-grid">
      <UserRegistrationChart :stats="dailyStats" :date-range="dateRange" />
      <TaskStatisticsChart :stats="taskStats" :date-range="dateRange" />
      <TaskCountUsers />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { LineChartOutlined, FilterOutlined } from '@ant-design/icons-vue';
import UserRegistrationChart from './UserRegistrationChart.vue';
import TaskStatisticsChart from './TaskStatisticsChart.vue';
import TaskCountUsers from './TaskCountUsers.vue';
import { useDashboard } from './composables/useDashboard';
import './styles/dashboard.css';

const {
  selectedPeriod,
  dateRange,
  dailyStats,
  taskStats,
  disabledDate,
  handleFilter,
  initializeDashboard
} = useDashboard();

onMounted(() => {
  initializeDashboard();
});
</script>

<style scoped>
.dashboard-container {
  background: #f0f2f5;
  min-height: 100vh;
  max-width: 100%;
}

.page-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: #227CA0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;

  .subtitle {
    font-size: 14px;
    color: #8c8c8c;
    font-weight: normal;
    margin-left: 12px;
  }
}

.filter-section {
  margin-bottom: 24px;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: 0;
  position: relative;
  overflow: hidden;
  border-radius: 10rem;
  transition: all 0.02s;
  font-weight: 600;
  cursor: pointer;
  color: #227CA0;
  z-index: 0;
  box-shadow: 0 0px 7px -5px rgba(0, 0, 0, 0.5);
  background: white;
  font-size: 14px;
}

.filter-button:hover {
  background: rgba(34, 124, 160, 0.1);
  color: #227CA0;
}

.filter-button:active {
  transform: scale(0.97);
}

.hoverEffect {
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.hoverEffect div {
  background: linear-gradient(90deg,
      rgba(21, 197, 178, 1) 0%,
      rgba(34, 124, 160, 1) 49%,
      rgba(255, 204, 119, 1) 100%);
  border-radius: 40rem;
  width: 10rem;
  height: 10rem;
  transition: 0.4s;
  filter: blur(20px);
  animation: effect infinite 3s linear;
  opacity: 0.5;
}

.filter-button:hover .hoverEffect div {
  width: 8rem;
  height: 8rem;
}

@keyframes effect {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.chart-card {
  min-height: 500px;
  height: 100%;
}

.highcharts-figure {
  min-width: 310px;
  max-width: 100%;
  margin: 1em auto;
}

#users-chart,
#tasks-chart {
  height: 400px;
  width: 100%;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  gap: 24px;
  margin-top: 24px;
}

.charts-grid > :last-child {
  grid-column: 1 / -1;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #227CA0;
  font-weight: 600;
  font-size: 16px;
}

.filter-icon {
  font-size: 16px;
}
</style>
