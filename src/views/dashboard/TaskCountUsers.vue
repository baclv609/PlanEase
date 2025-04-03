<template>
  <a-card class="chart-card task-count-chart">
    <div class="chart-title">
      <UserOutlined />
      Top người tạo nhiều task nhất
    </div>
    <div class="highcharts-figure">
      <div id="task-count-chart"></div>
    </div>
  </a-card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';
import Highcharts from 'highcharts';
import axios from 'axios';
import { message } from 'ant-design-vue';

const dirApi = import.meta.env.VITE_API_BASE_URL;
const taskCountData = ref([]);

const fetchTaskCountData = async () => {
  try {
    const response = await axios.get(`${dirApi}admin/stats/task-count-by-user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (response.data.code === 200) {
      taskCountData.value = response.data.data;
      renderChart();
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
    message.error('Có lỗi xảy ra khi tải dữ liệu thống kê');
  }
};

const renderChart = () => {
  const chartData = taskCountData.value.map(item => ({
    name: item.name || item.email,
    y: item.task_count
  }));

  Highcharts.chart('task-count-chart', {
    chart: {
      type: 'bar',
      height: 400
    },
    title: {
      text: null
    },
    xAxis: {
      categories: chartData.map(item => item.name),
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Số lượng task',
        align: 'high'
      }
    },
    tooltip: {
      valueSuffix: ' task',
      headerFormat: '<b>{point.key}</b><br/>',
      pointFormat: 'Số lượng task: {point.y}'
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          format: '{point.y} task',
          style: {
            fontSize: '12px',
            color: '#227CA0',
            fontWeight: '600',
            textOutline: 'none'
          }
        },
        color: {
          linearGradient: {
            x1: 0,
            x2: 1,
            y1: 0,
            y2: 0
          },
          stops: [
            [0, '#ffcc77'],
            [0.3, '#15c5b2'],
            [0.7, '#15c5b2'],
            [1, '#227ca0']
          ]
        },
        borderRadius: 5,
        pointWidth: 30,
        states: {
          hover: {
            color: {
              linearGradient: {
                x1: 0,
                x2: 1,
                y1: 0,
                y2: 0
              },
              stops: [
                [0, '#ffd699'],
                [0.3, '#1ad4c0'],
                [0.7, '#1ad4c0'],
                [1, '#2a8db0']
              ]
            }
          }
        }
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    series: [{
      name: 'Số lượng task',
      data: chartData,
      animation: {
        duration: 2000,
        easing: 'easeOutBounce'
      }
    }]
  });
};

onMounted(() => {
  fetchTaskCountData();
});
</script>

<style scoped>
.chart-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  grid-column: 1 / -1;
}

.highcharts-figure {
  min-width: 310px;
  max-width: 100%;
  margin: 1em auto;
}

#task-count-chart {
  height: 400px;
  width: 100%;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #227CA0;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 16px;
}
</style>