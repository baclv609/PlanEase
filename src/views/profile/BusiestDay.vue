<template>
    <div class="busiest-day-container">
        <div class="chart-container">
            <div id="busiestDayChart" class="chart"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Highcharts from 'highcharts';
import { useProfile } from './composables/useProfile';
import dayjs from 'dayjs';

const props = defineProps({
    dateRange: {
        type: Array,
        default: () => []
    }
});

const { busiestDays } = useProfile();
let chart = null;

const initChart = () => {
    chart = Highcharts.chart('busiestDayChart', {
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            height: '400px'
        },
        title: {
            text: 'Ngày bận rộn nhất',
            style: {
                color: '#227CA0',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
            labels: {
                style: {
                    color: '#227CA0'
                }
            }
        },
        yAxis: {
            title: {
                text: 'Số lượng công việc',
                style: {
                    color: '#227CA0'
                }
            },
            labels: {
                style: {
                    color: '#227CA0'
                }
            }
        },
        tooltip: {
            formatter: function() {
                return `<b>${this.x}</b><br/>Số lượng công việc: ${this.y}`;
            }
        },
        series: [{
            name: 'Số lượng công việc',
            data: [0, 0, 0, 0, 0, 0, 0],
            color: '#15C5B2'
        }]
    });
};

const updateChart = (data) => {
    if (chart) {
        // Tạo mảng dữ liệu cho 7 ngày trong tuần
        const weekData = new Array(7).fill(0);
        
        // Cập nhật dữ liệu từ API
        data.forEach(item => {
            const dayOfWeek = dayjs(item.day).day();
            weekData[dayOfWeek] = item.task_count;
        });

        chart.series[0].setData(weekData);
    }
};

const fetchData = async () => {
    if (props.dateRange && props.dateRange.length === 2) {
        updateChart(busiestDays.value);
    }
};

watch(() => props.dateRange, () => {
    fetchData();
});

watch(() => busiestDays.value, () => {
    updateChart(busiestDays.value);
});

onMounted(() => {
    initChart();
    fetchData();
});
</script>

<style scoped>
.busiest-day-container {
    padding: 24px;
}

.chart-container {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.chart {
    width: 100%;
    height: 400px;
}
</style>