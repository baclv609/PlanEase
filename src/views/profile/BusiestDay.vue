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

const { busiestDays, fetchBusiestDay } = useProfile();
let chart = null;

const initChart = () => {
    chart = Highcharts.chart('busiestDayChart', {
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            height: '400px',
            style: {
                fontFamily: 'Arial, sans-serif'
            }
        },
        title: {
            text: 'Số lượng sự kiện theo ngày',
            style: {
                color: '#227CA0',
                fontWeight: 'bold',
                fontSize: '18px'
            }
        },
        xAxis: {
            categories: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
            labels: {
                style: {
                    color: '#227CA0',
                    fontSize: '14px'
                }
            },
            lineColor: '#227CA0',
            tickColor: '#227CA0'
        },
        yAxis: {
            title: {
                text: 'Số lượng công việc trong ngày',
                style: {
                    color: '#227CA0',
                    fontSize: '14px'
                }
            },
            labels: {
                style: {
                    color: '#227CA0',
                    fontSize: '12px'
                },
                formatter: function() {
                    return this.value + ' công việc';
                }
            },
            gridLineColor: 'rgba(34, 124, 160, 0.1)'
        },
        tooltip: {
            formatter: function() {
                return `<br/>Số lượng công việc: <b>${this.y}</b>`;
            },
            style: {
                fontSize: '14px'
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#227CA0',
            borderRadius: 8
        },
        plotOptions: {
            column: {
                borderRadius: 5,
                states: {
                    hover: {
                        brightness: 0.1
                    }
                }
            },
            series: {
                dataLabels: {
                    enabled: true,
                    color: '#227CA0',
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }
                }
            }
        },
        series: [{
            name: 'Số lượng công việc',
            data: [0, 0, 0, 0, 0, 0, 0],
            color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                    [0, '#15C5B2'],
                    [1, '#227CA0']
                ]
            }
        }],
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        }
    });
};

const updateChart = (data) => {
    if (chart) {
        // Tạo mảng dữ liệu cho 7 ngày trong tuần
        const weekData = new Array(7).fill(0);
        
        // Cập nhật dữ liệu từ API
        data.forEach(item => {
            // Chuyển đổi ngày thành thứ trong tuần (0 = Chủ nhật, 1 = Thứ 2, ...)
            const date = dayjs(item.day);
            const dayOfWeek = date.day();
            // Đảm bảo index nằm trong khoảng 0-6 (Thứ 2 = 0, Chủ nhật = 6)
            const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekData[index] = parseInt(item.task_count);
        });

        // Cập nhật dữ liệu cho biểu đồ
        chart.series[0].setData(weekData);

        // Cập nhật tiêu đề với tổng số công việc
        const totalTasks = weekData.reduce((sum, count) => sum + count, 0);
        chart.setTitle({ 
            text: `Số lượng sự kiện theo ngày (Tổng: ${totalTasks} công việc)`,
            style: {
                color: '#227CA0',
                fontWeight: 'bold',
                fontSize: '18px'
            }
        });
    }
};

const fetchData = async () => {
    if (props.dateRange && props.dateRange.length === 2) {
        const startDate = dayjs(props.dateRange[0], 'DD/MM/YYYY').format('YYYY-MM-DD');
        const endDate = dayjs(props.dateRange[1], 'DD/MM/YYYY').format('YYYY-MM-DD');
        
        await fetchBusiestDay(startDate, endDate);
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


.chart {
    width: 100%;
    height: 400px;
}
</style>