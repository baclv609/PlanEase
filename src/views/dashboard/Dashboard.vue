<template>
  <div>
    <h1>hihi</h1>
    <figure class="highcharts-figure">
      <div id="container"></div>
    </figure>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Highcharts from 'highcharts';

onMounted(() => {
  Highcharts.chart('container', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Corn vs wheat estimated production for 2023'
    },
    subtitle: {
      text: 'Source: <a target="_blank" href="https://www.indexmundi.com/agriculture/?commodity=corn">indexmundi</a>'
    },
    xAxis: {
      categories: ['USA', 'China', 'Brazil', 'EU', 'Argentina', 'India'],
      crosshair: true,
      accessibility: {
        description: 'Countries'
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: '1000 metric tons (MT)'
      }
    },
    tooltip: {
      valueSuffix: ' (1000 MT)'
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0
      }
    },
    series: [
      {
        name: 'Corn',
        data: [387749, 280000, 129000, 64300, 54000, 34300]
      },
      {
        name: 'Wheat',
        data: [45321, 140000, 10000, 140500, 19500, 113500]
      }
    ]
  });
});
</script>

<style scoped>
.highcharts-figure {
  min-width: 310px;
  max-width: 800px;
  margin: 1em auto;
}

#container {
  height: 400px;
}
</style>
