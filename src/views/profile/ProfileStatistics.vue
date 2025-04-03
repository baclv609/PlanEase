<template>
    <div class="p-4">
        <div class="mb-4">
            <h2 class="text-xl font-bold mb-2">Thống kê tỷ lệ hoàn thành</h2>
            <div class="filter-section">
                <a-card :bordered="false">
                    <template #default>
                        <div class="filter-container">
                            <div class="left-section">
                                <a-range-picker 
                                    v-model:value="dateRange" 
                                    class="date-picker"
                                    :disabled-date="disabledDate" 
                                    format="DD-MM-YYYY"
                                    @change="handleDateChange" 
                                />
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
                    </template>
                </a-card>
            </div>
        </div>

        <div v-if="loading" class="text-center py-4">
            Đang tải dữ liệu...
        </div>

        <div v-else-if="error" class="text-red-500 py-4">
            {{ error }}
        </div>

        <div v-else id="container" style="min-width: 310px; height: 400px; margin: 0 auto"></div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Highcharts from 'highcharts'
import { useProfile } from './composables/useProfile'
import { FilterOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { Card, DatePicker } from 'ant-design-vue'

const ACard = Card
const { RangePicker: ARangePicker } = DatePicker

const { completionRate, loading, error, fetchCompletionRate } = useProfile()
const dateRange = ref(null)

const disabledDate = (current) => {
    return current && current > dayjs().endOf('day')
}

const handleDateChange = async () => {
    if (!dateRange.value) return
    const [startDate, endDate] = dateRange.value
    const taskTimezone = 'Asia/Hebron' // Sử dụng timezone của task
    await fetchCompletionRate(
        startDate,
        endDate,
        taskTimezone
    )
    updateChart()
}

const handleFilter = () => {
    handleDateChange()
}

const updateChart = () => {
    Highcharts.chart('container', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Tỷ lệ hoàn thành công việc'
        },
        plotOptions: {
            pie: {
                shadow: false,
                center: ['50%', '50%']
            }
        },
        tooltip: {
            valueSuffix: '%'
        },
        series: [{
            name: 'Tỷ lệ',
            data: [
                {
                    name: 'Hoàn thành',
                    y: completionRate.value,
                    color: '#4CAF50'
                },
                {
                    name: 'Chưa hoàn thành',
                    y: 100 - completionRate.value,
                    color: '#F44336'
                }
            ],
            size: '80%',
            dataLabels: {
                format: '<b>{point.name}</b>: {point.y}%',
                style: {
                    fontWeight: 'normal'
                }
            }
        }]
    })
}

onMounted(async () => {
    await fetchCompletionRate()
    updateChart()
})
</script>

<style scoped>
.filter-section {
    margin-bottom: 24px;
}

.filter-section :deep(.ant-card) {
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
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

.date-picker :deep(.ant-picker) {
    border-radius: 8px;
}

.date-picker :deep(.ant-picker:hover) {
    border-color: #15c5b2;
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
</style>