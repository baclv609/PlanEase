<template>
    <div class="p-1 bg-white min-h-screen">
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-[#227C9D]">{{ $t('trash.titleTrash') }}</h1>
            </div>
            <div class="flex items-center gap-4">
                <a-button class="action-btn restore-btn font-medium" @click="restoreEvent(selectedEvents)" v-if="selectedEvents.length != 0">
                    <UndoOutlined class="py-2 text-md" /> {{ $t('trash.restoreSelected') }}
                </a-button>
                <a-button class="action-btn delete-btn font-medium" @click="deleteEvent(selectedEvents)" v-if="selectedEvents.length != 0">
                    <DeleteOutlined class="py-2 text-md" /> {{ $t('trash.deleteSelected') }}
                </a-button>

                <a-button v-if="events.length > 0" @click="deleteEvent([], true)" class="bg-[#227C9D] hover:!text-white text-white font-medium">
                    {{ $t('trash.emptyTrash') }}
                </a-button>

                <!-- Khi không có sự kiện, render nút nhưng dưới dạng disabled -->
                <a-button v-else disabled class="bg-[#227C9D] text-white font-medium opacity-50 cursor-not-allowed">
                    {{ $t('trash.emptyTrash') }}
                </a-button>
                
                <a-select 
                    v-model:value="selectedTag" 
                    :placeholder="$t('trash.filterByCalendar')" 
                    style="width: 200px"
                    :options="tags.map(tag => ({ value: tag.id, label: tag.name }))" 
                    allowClear 
                />
            </div>
        </div>

        <a-table 
            :columns="columns" 
            :data-source="paginatedEvents"
            :row-selection="{ selectedRowKeys: selectedEvents, onChange: onSelectChange }" 
            :pagination="{
                current: currentPage,
                pageSize: pageSize,
                total: totalItems,
                showSizeChanger: true,
                showQuickJumper: false,
                showTotal: (total) => t('trash.total', { total }),
                onChange: (page, pageSize) => {
                    currentPage = page;
                    pageSize = pageSize;
                },
                onShowSizeChange: (current, size) => {
                    currentPage = 1;
                    pageSize = size;
                },
                locale: {
                    items_per_page: t('trash.items_per_page')
                }
            }"
            :loading="loading"
            :row-key="record => record.id" 
            class="custom-table">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <div class="flex gap-2">
                        <a-button @click="restoreEvent([record.id])" class="action-btn restore-btn">
                            <template #icon>
                                <UndoOutlined />
                            </template>
                            <!-- {{ $t('trash.restore') }} -->
                        </a-button>

                        <a-button class="action-btn delete-btn" @click="deleteEvent([record.id])">
                            <template #icon>
                                <DeleteOutlined />
                            </template>
                            <!-- {{ $t('trash.delete') }} -->
                        </a-button>
                    </div>
                </template>
                <template v-else-if="column.key === 'date'">
                    <div class="text-md font-medium text-[#227C9D]">{{ formatDate(record.start_time, false) }}</div>
                </template>
                <template v-else-if="column.key === 'time'">
                    <div class="flex flex-col gap-1">
                        <div class="text-md font-medium">
                            {{ record.is_all_day ? $t('trash.allDay') : formatDate(record.start_time, true) }}
                        </div>
                        <div v-if="record.is_repeat"
                            class="text-xs inline-block">
                            {{ $t('trash.recurring') }}
                        </div>
                    </div>
                </template>
                <template v-else-if="column.key === 'title'">
                    <div class="flex flex-col gap-1">
                        <div class="text-sm font-medium text-[#227C9D]">{{ record.title }}</div>
                    </div>
                </template>
                <template v-else-if="column.key === 'deletedAt'">
                    <div class="text-sm text-gray-500">
                        {{ formatDate(record.deleted_at, false) }}
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
import { message, Modal } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const userSettings = JSON.parse(localStorage.getItem('userSettings'));

dayjs.locale(userSettings.language);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

const selectedTag = ref(null);
const selectedEvents = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

const tags = ref([]);
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
            message.error(t('trash.loadError'));
        }
    } catch (error) {
        console.error(error);
        message.error(t('trash.connectionError'));
    } finally {
        loading.value = false;
    }
}

const getTags = async () => {
    const response = await axios.get(`${dirApi}tags`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.data.code == 200) {
        tags.value = response.data.data;
    }
}

onMounted(() => {
    getTrashEvents();
    getTags();
});

const filteredEvents = computed(() => {
    if (!selectedTag.value) return events.value;
    return events.value.filter(event => event.tag_id == selectedTag.value);
});

const paginatedEvents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredEvents.value.slice(start, end);
});

const totalItems = computed(() => filteredEvents.value.length);

const formatDate = (date, isTime) => {
    if (!isTime) {
        return dayjs(date).tz(userSettings.timezone).format(userSettings.dateFormat);
    }

    return userSettings.timeFormat == '24h' ? dayjs(date).tz(userSettings.timezone).format('HH:mm') : dayjs(date).tz(userSettings.timezone).format('hh:mm A');
}

const onSelectChange = (selectedRowKeys) => {
    selectedEvents.value = selectedRowKeys;
}

const restoreEvent = async (eventId) => {
    const confirmed = await showConfirm('restore');
     if (!confirmed) return;

    try {
        const response = await axios.put(`${dirApi}tasks/trash/restoreTask`, { ids: eventId }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            message.success(t('trash.restoreSuccess'));
            events.value = events.value.filter(event => !eventId.includes(event.id));
            selectedEvents.value = [];
        } else {
            message.error(t('trash.restoreError'));
        }
    } catch (error) {
        console.error(error);
        message.error(t('trash.restoreError'));
    }
}

const deleteEvent = async (eventId, deleteAll = false) => {
    const confirmed = await showConfirm('delete');
    if (!confirmed) return;

    if (deleteAll) {
        eventId = events.value.map(event => event.id);
    }

    try {
        const response = await axios.delete(`${dirApi}tasks/trash/forceDestroy`, {
            data: { ids: eventId },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            message.success(t('trash.deleteSuccess'));
            events.value = events.value.filter(event => !eventId.includes(event.id));
            selectedEvents.value = [];
        } else {
            message.error(t('trash.deleteError'));
        }
    } catch (error) {
        console.error(error);
        message.error(t('trash.deleteError'));
    }
}

const columns = [
    {
        title: t('trash.date'),
        dataIndex: 'date',
        key: 'date',
        width: 150,
    },
    {
        title: t('trash.time'),
        dataIndex: 'time',
        key: 'time',
        width: 100
    },
    {
        title: t('trash.title'),
        dataIndex: 'title',
        key: 'title',
        width: 400
    },
    {
        title: t('trash.deletedAt'),
        dataIndex: 'deletedAt',
        key: 'deletedAt',
        width: 200,
    },
    {
        title: t('trash.actions'),
        key: 'action',
        width: 100,
        fixed: 'right'
    }
];

const showConfirm = (type) => {

    const actionText = t(`trash.confirm.action.${type}`);

    return new Promise((resolve, reject) => {
    Modal.confirm({
      title: t('trash.confirm.title', { action: t(`trash.confirm.action.${type}`) }),
      content: t('trash.confirm.content', { action: t(`trash.confirm.action.${type}`) }),
      okText: t('trash.confirm.ok'),
      centered: true,
      cancelText: t('trash.confirm.cancel'),
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });
}

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

:deep(.ant-pagination) {
    margin: 16px 0;
    padding: 0 16px;
}

:deep(.ant-pagination-item) {
    border-radius: 4px;
    border-color: #e5e7eb;
}

:deep(.ant-pagination-item-active) {
    background-color: #17C3B2;
    border-color: #17C3B2;
}

:deep(.ant-pagination-item-active a) {
    color: white;
}

:deep(.ant-pagination-item:hover) {
    border-color: #17C3B2;
}

:deep(.ant-pagination-prev:hover .ant-pagination-item-link),
:deep(.ant-pagination-next:hover .ant-pagination-item-link) {
    border-color: #17C3B2;
    color: #17C3B2;
}

:deep(.ant-pagination-options) {
    margin-left: 16px;
}

:deep(.ant-select-selector) {
    border-radius: 4px;
    border-color: #e5e7eb;
}

:deep(.ant-select-selector:hover) {
    border-color: #17C3B2;
}

:deep(.ant-select-focused .ant-select-selector) {
    border-color: #17C3B2;
    box-shadow: 0 0 0 2px rgba(23, 195, 178, 0.1);
}
</style>