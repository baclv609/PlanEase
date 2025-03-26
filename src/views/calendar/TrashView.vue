<template>
    <div class="p-1 bg-white min-h-screen">
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-[#227C9D]">Thùng rác</h1>
                <a-tag color="blue">{{ filteredEvents.length }} sự kiện</a-tag>
            </div>
            <div class="flex items-center gap-4">
                <a-select v-model:value="selectedTag" placeholder="Lọc theo lịch" style="width: 200px"
                    :options="tags.map(tag => ({ value: tag.id, label: tag.name }))" allowClear class="custom-select" />
            </div>
        </div>

        <a-table :columns="columns" :data-source="filteredEvents"
            :row-selection="{ selectedRowKeys: selectedEvents, onChange: onSelectChange }" :pagination="false"
            class="custom-table">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <div class="flex gap-2">

                        <a-button @click="restoreEvent(record.id)" class="action-btn restore-btn">
                            <template #icon>
                                <UndoOutlined />
                            </template>
                        </a-button>


                        <a-popconfirm title="Bạn có chắc chắn muốn xóa vĩnh viễn sự kiện này?" ok-text="Có"
                            cancel-text="Không" @confirm="deleteEvent(record.id)">
                            <a-button class="action-btn delete-btn">
                                <template #icon>
                                    <DeleteOutlined />
                                </template>
                            </a-button>
                        </a-popconfirm>

                    </div>
                </template>
                <template v-else-if="column.key === 'date'">
                    <div class="text-md font-medium text-[#227C9D]">{{ formatDate(record.startDate, false) }}</div>
                </template>
                <template v-else-if="column.key === 'time'">
                    <div class="flex flex-col gap-1">
                        <div class="text-md font-medium">
                            {{ record.is_all_day ? 'Cả ngày' : formatDate(record.startDate, true) }}
                        </div>
                        <div v-if="record.is_repeat"
                            class="text-xs px-2 py-0.5 bg-[#FFF3E0] text-[#FF9800] rounded-full inline-block">
                            Lặp lại
                        </div>
                    </div>
                </template>
                <template v-else-if="column.key === 'title'">
                    <div class="flex flex-col gap-1">
                        <div class="text-sm font-medium text-[#227C9D]">{{ record.title }}</div>
                        <div v-if="record.description" class="text-xs text-gray-500 line-clamp-1">
                            {{ record.description }}
                        </div>
                    </div>
                </template>
                <template v-else-if="column.key === 'deletedAt'">
                    <div class="text-sm text-gray-500">
                        {{ formatDate(record.deletedAt) }}
                    </div>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup>
import { DeleteOutlined, UndoOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { message } from 'ant-design-vue';

const userSettings = JSON.parse(localStorage.getItem('userSettings'));

dayjs.locale(userSettings.language);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

const selectedTag = ref('')
const selectedEvents = ref([])
const loading = ref(false)

const tags = ref([
    { id: 1, name: 'Công việc' },
    { id: 2, name: 'Cá nhân' },
    { id: 3, name: 'Gia đình' },
    { id: 4, name: 'Học tập' }
])

const events = ref([]);

const getTrashEvents = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${dirApi}tasks/getTrashedTasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            events.value = response.data.data;
        } else {
            message.error('Không thể tải dữ liệu thùng rác');
        }
    } catch (error) {
        console.error(error);
        message.error('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    getTrashEvents();
})

const filteredEvents = computed(() => {
    if (!selectedTag.value) return events.value
    return events.value.filter(event => event.tag?.id === selectedTag.value)
})

const formatDate = (date, isTime) => {
    if (!isTime) {
        return dayjs(date).tz(userSettings.timezone).format('DD/MM/YYYY');
    }

    return dayjs(date).tz(userSettings.timezone).format('HH:mm');
}

const onSelectChange = (selectedRowKeys) => {
    selectedEvents.value = selectedRowKeys;
}

const restoreEvent = async (eventId) => {
    try {
        const response = await axios.put(`${dirApi}tasks/restoreTasks/aaa`, { ids: [eventId] }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            message.success('Khôi phục sự kiện thành công');
            getTrashEvents();
        } else {
            message.error('Không thể khôi phục sự kiện');
        }
    } catch (error) {
        console.error(error);
        message.error('Đã xảy ra lỗi khi khôi phục sự kiện');
    }
}

const deleteEvent = async (eventId) => {
    try {
        const response = await axios.delete(`${dirApi}tasks/forceDestroy`, {
            data: { ids: [eventId] },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            message.success('Xóa sự kiện thành công');
            getTrashEvents();
        } else {
            message.error('Không thể xóa sự kiện');
        }
    } catch (error) {
        console.error(error);
        message.error('Đã xảy ra lỗi khi xóa sự kiện');
    }
}

const columns = [
    {
        title: 'Ngày',
        dataIndex: 'date',
        key: 'date',
        width: 100,
    },
    {
        title: 'Giờ',
        dataIndex: 'time',
        key: 'time',
        width: 100
    },
    {
        title: 'Tiêu đề',
        dataIndex: 'title',
        key: 'title',
        width: 400
    },
    {
        title: 'Ngày xóa',
        dataIndex: 'deletedAt',
        key: 'deletedAt',
        width: 100,
    },
    {
        title: 'Thao tác',
        key: 'action',
        width: 100,
        fixed: 'right'
    }
];
</script>

<style scoped>
.custom-table {
    width: 100%;
}

.custom-table :deep(.ant-table-thead > tr > th) {
    background-color: #f9fafb;
    color: #6b7280;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #e5e7eb;
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
    background-color: #f8fafc;
}

.custom-table :deep(.ant-table-tbody > tr > td) {
    padding: 1rem 1.5rem;
    transition: all 0.2s ease;
}

.custom-table :deep(.ant-table-thead > tr > th) {
    padding: 1rem 1.5rem;
}

.custom-table :deep(.ant-table-row-selected) td {
    background-color: #f0f9ff !important;
}

.action-btn {
    border: none;
    border-radius: 6px;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.restore-btn {
    color: #227C9D;
    background-color: #E8F5F5;
}

.restore-btn:hover {
    background-color: #17C3B2;
    color: white;
}

.delete-btn {
    color: #f54c54;
    background-color: #fff5f5;
}

.delete-btn:hover {
    background-color: #f54c54;
    color: white;
}

.custom-select :deep(.ant-select-selector) {
    border-color: #e5e7eb;
    border-radius: 8px;
    padding: 4px 8px;
}

.custom-select :deep(.ant-select-selector:hover) {
    border-color: #17C3B2;
}

.custom-select :deep(.ant-select-focused .ant-select-selector) {
    border-color: #17C3B2;
    box-shadow: 0 0 0 2px rgba(23, 195, 178, 0.1);
}

:deep(.ant-table-row-selection) {
    padding: 0 1rem;
}

:deep(.ant-checkbox-wrapper) {
    margin-right: 0;
}

:deep(.ant-checkbox-inner) {
    border-radius: 4px;
    border-color: #e5e7eb;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: #17C3B2;
    border-color: #17C3B2;
}

:deep(.ant-pagination-item-active) {
    border-color: #17C3B2 !important;
    background-color: #17C3B2 !important;
}

:deep(.ant-pagination-item-active a) {
    color: white !important;
}

:deep(.ant-pagination-item:hover) {
    border-color: #17C3B2 !important;
}

:deep(.ant-pagination-prev:hover .ant-pagination-item-link),
:deep(.ant-pagination-next:hover .ant-pagination-item-link) {
    border-color: #17C3B2 !important;
    color: #17C3B2 !important;
}

:deep(.ant-tooltip) {
    font-size: 12px;
}

:deep(.ant-tooltip-inner) {
    padding: 4px 8px;
    min-height: 24px;
}

:deep(.ant-tooltip-arrow) {
    display: none;
}
</style>