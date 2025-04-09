<template>
  <div class="completion-rate-container">
    <div class="chart-container">
      <div id="completionRateChart" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Highcharts from 'highcharts';
import { useProfile } from './composables/useProfile';

const props = defineProps({
  dateRange: {
    type: Array,
    default: () => []
  }
});

const { completionRate, loading, error, fetchCompletionRate } = useProfile();
let chart = null;

const initChart = () => {
  chart = Highcharts.chart('completionRateChart', {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: '400px'
    },
    title: {
      text: 'Tỷ lệ hoàn thành công việc',
      style: {
        color: '#227CA0',
        fontWeight: 'bold'
      }
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: '#227CA0'
          }
        },
        colors: ['#15C5B2', '#FFCC77']
      }
    },
    series: [{
      name: 'Tỷ lệ',
      colorByPoint: true,
      data: [
        {
          name: 'Đã hoàn thành',
          y: 0
        },
        {
          name: 'Chưa hoàn thành',
          y: 100
        }
      ]
    }]
  });
};

const updateChart = (rate) => {
  if (chart) {
    chart.series[0].setData([
      {
        name: 'Đã hoàn thành',
        y: rate
      },
      {
        name: 'Chưa hoàn thành',
        y: 100 - rate
      }
    ]);
  }
};

const fetchData = async () => {
  if (props.dateRange && props.dateRange.length === 2) {
    await fetchCompletionRate(props.dateRange[0], props.dateRange[1]);
    updateChart(completionRate.value);
  }
};

watch(() => props.dateRange, () => {
  fetchData();
});

onMounted(() => {
  initChart();
  fetchData();
});
</script>

<style scoped>
.completion-rate-container {
  padding: 24px;
}


.chart {
  width: 100%;
  height: 400px;
}
</style>