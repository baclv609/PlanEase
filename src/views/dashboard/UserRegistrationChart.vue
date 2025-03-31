<template>
  <a-card class="chart-card" :bordered="false">
    <template #title>
      <div class="chart-title">
        <TeamOutlined /> Thống kê người dùng đăng ký
      </div>
    </template>
    <figure class="highcharts-figure">
      <div id="users-chart"></div>
    </figure>
  </a-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import Highcharts from 'highcharts';
import { TeamOutlined } from '@ant-design/icons-vue';
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
  
  Highcharts.chart('users-chart', {
    chart: {
      type: 'line',
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: 'Thống kê số lượng người dùng đăng ký',
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

const formatDisplayDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

watch(() => props.stats, updateChart, { immediate: true });
</script>
