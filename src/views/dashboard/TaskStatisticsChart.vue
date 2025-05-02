<template>
  <a-card class="chart-card" :bordered="false">
    <template #title>
      <div class="chart-title">
        <CheckSquareOutlined /> Thống kê công việc
      </div>
    </template>
    <figure class="highcharts-figure">
      <div id="tasks-chart"></div>
    </figure>
  </a-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import Highcharts from 'highcharts';
import { CheckSquareOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

const props = defineProps({
  stats: {
    type: Array,
    required: true
  },
  dateRange: {
    type: Array,
    required: true
  }
});

const updateChart = () => {
  if (!props.stats || props.stats.length === 0) {
    return;
  }

  const chartData = props.stats.map(item => {
    const date = dayjs(item.date);
    return [
      Date.UTC(date.year(), date.month(), date.date()),
      item.count
    ];
  });
  
  Highcharts.chart('tasks-chart', {
    chart: {
      type: 'line',
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: 'Thống kê số lượng công việc',
      style: {
        color: '#227CA0',
        fontWeight: 'bold'
      }
    },

    subtitle: {
      text: `Từ ${formatDisplayDate(props.dateRange[0])} đến ${formatDisplayDate(props.dateRange[1])}`,
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
        text: 'Số lượng công việc'
      },
      min: 0
    },

    tooltip: {
      headerFormat: '<b>{point.x:%d/%m/%Y}</b><br/>',
      pointFormat: 'Số lượng công việc: <b>{point.y}</b>'
    },

    series: [{
      name: 'Công việc',
      data: chartData,
      color: {
        linearGradient: {
          x1: 0,
          x2: 1,
          y1: 0,
          y2: 0
        },
        stops: [
          [0, '#15c5b2'],
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

const formatDisplayDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

watch(() => props.stats, updateChart, { immediate: true });
</script>

<style scoped>
.chart-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.highcharts-figure {
  min-width: 310px;
  max-width: 100%;
  margin: 0;
  height: calc(100% - 40px);
}

#tasks-chart {
  height: 100%;
  width: 100%;
  min-height: 400px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #227CA0;
  font-weight: 600;
  font-size: 16px;
  padding: 8px 0;
}
</style>
