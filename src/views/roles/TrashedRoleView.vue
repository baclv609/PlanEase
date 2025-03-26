<template>
    <div class="trashed-roles-container">
        <!-- Header Section -->
        <div class="header-section">
            <a-button class="back-button" type="primary" ghost @click="goBack">
                <template #icon><ArrowLeftOutlined /></template>
                Quay lại danh sách
            </a-button>
            <div class="header-title">
                <DeleteOutlined class="header-icon" />
                <span>Danh sách Role đã xóa</span>
            </div>
        </div>

        <!-- Main Content -->
        <a-card :bordered="false" class="content-card">
            <a-table 
                :columns="columns" 
                :data-source="dataSource.list" 
                :loading="loading"
                :pagination="pagination" 
                @change="handleTableChange"
                class="custom-table"
            >
                <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key === 'index'">
                        <span class="index-column">{{ index + 1 }}</span>
                    </template>

                    <template v-else-if="column.key === 'name'">
                        <div class="role-name">
                            <SafetyCertificateOutlined />
                            <span>{{ record.name }}</span>
                        </div>
                    </template>

                    <template v-else-if="column.key === 'created_at'">
                        <a-tag color="blue">
                            <CalendarOutlined />
                            {{ formatDate(record.created_at) }}
                        </a-tag>
                    </template>

                    <template v-else-if="column.key === 'deleted_at'">
                        <a-tag color="red">
                            <ClockCircleOutlined />
                            {{ formatDate(record.deleted_at) }}
                        </a-tag>
                    </template>

                    <template v-if="column.key === 'action'">
                        <div class="action-buttons">
                            <a-tooltip title="Khôi phục">
                                <a-button type="primary" shape="circle" @click="handleRestore(record)">
                                    <template #icon><UndoOutlined /></template>
                                </a-button>
                            </a-tooltip>

                            <a-tooltip title="Xóa vĩnh viễn">
                                <a-popconfirm
                                    title="Bạn có chắc chắn muốn xóa vĩnh viễn?"
                                    ok-text="Đồng ý"
                                    cancel-text="Hủy"
                                    @confirm="handleForceDelete(record)"
                                >
                                    <a-button type="danger" shape="circle">
                                        <template #icon><DeleteOutlined /></template>
                                    </a-button>
                                </a-popconfirm>
                            </a-tooltip>
                        </div>
                    </template>
                </template>

                <template #emptyText>
                    <div class="empty-state">
                        <InboxOutlined />
                        <p>Không có role nào trong thùng rác</p>
                    </div>
                </template>
            </a-table>
        </a-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { DeleteOutlined, UndoOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, CalendarOutlined, ClockCircleOutlined, InboxOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const loading = ref(false);
const dataSource = ref({ list: [], total: 0 });
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
});

const columns = [
    {
        title: 'STT',
        key: 'index',
        width: '80px'
    },
    {
        title: 'Tên Role',
        key: 'name',
        dataIndex: 'name',
    },
    {
        title: 'Ngày tạo',
        key: 'created_at',
        width: '180px'
    },
    {
        title: 'Ngày xóa',
        key: 'deleted_at',
        width: '180px'
    },
    {
        title: 'Thao tác',
        key: 'action',
        width: '150px',
        align: 'center'
    },
];

const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : '';
};

const fetchDeletedRoles = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${dirApi}admin/roles/trashed`, {
            params: {
                per_page: pagination.value.pageSize,
                page: pagination.value.current,
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (response.data && Array.isArray(response.data.data)) {
            dataSource.value.list = response.data.data.map((role, index) => ({
                id: role.id || index + 1,
                ...role
            }));
            pagination.value.total = response.data.total || response.data.data.length;

            if (dataSource.value.list.length === 0) {
                message.info('Không có role nào trong thùng rác');
            }
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách role đã xóa:', error);
        if (error.response && error.response.status !== 404) {
            message.error('Có lỗi xảy ra khi tải danh sách role đã xóa');
        } else {
            message.info('Không có role nào trong thùng rác');
        }
    } finally {
        loading.value = false;
    }
};

const handleTableChange = (pag) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
    fetchDeletedRoles();
};

const handleRestore = async (record) => {
    try {
        const response = await axios.put(`${dirApi}admin/roles/${record.id}/restore`, null, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (response.data.code === 200) {
            dataSource.value.list = dataSource.value.list.filter(role => role.id !== record.id);
            pagination.value.total = dataSource.value.list.length;
            
            message.success('Khôi phục role thành công');
        } else {
            message.error(response.data.message || 'Có lỗi xảy ra khi khôi phục role');
        }
    } catch (error) {
        console.error('Lỗi khi khôi phục role:', error);
        message.error(error.response?.data?.message || 'Có lỗi xảy ra khi khôi phục role');
    }
};

const handleForceDelete = async (record) => {
    try {
        await axios.delete(`${dirApi}admin/roles/${record.id}/forceDelete`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        
        dataSource.value.list = dataSource.value.list.filter(role => role.id !== record.id);
        pagination.value.total = dataSource.value.list.length;
        
        message.success('Xóa vĩnh viễn role thành công');
    } catch (error) {
        message.error('Có lỗi xảy ra khi xóa vĩnh viễn role');
    }
};

const goBack = () => {
    router.push('/dashboard/roles');
};

// Fetch data when component mounted
fetchDeletedRoles();
</script>

<style scoped>
.trashed-roles-container {
    padding: 24px;
    background: #f0f2f5;
    min-height: 100vh;
}

.header-section {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
}

.back-button {
    border-radius: 8px;
    height: 40px;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    
    &:hover {
        transform: translateX(-5px);
    }
}

.header-title {
    font-size: 24px;
    font-weight: 600;
    color: #ff4d4f;
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-icon {
    font-size: 28px;
}

.content-card {
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
                0 1px 6px -1px rgba(0, 0, 0, 0.02),
                0 2px 4px 0 rgba(0, 0, 0, 0.02);
}

.custom-table {
    :deep(.ant-table) {
        border-radius: 8px;
    }

    :deep(.ant-table-thead > tr > th) {
        background: #fafafa;
        font-weight: 600;
        padding: 16px;
    }

    :deep(.ant-table-tbody > tr > td) {
        padding: 16px;
    }
}

.index-column {
    font-weight: 500;
    color: #8c8c8c;
}

.role-name {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1f1f1f;
    font-weight: 500;

    .anticon {
        color: #1890ff;
    }
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

:deep(.ant-btn-circle) {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        transform: translateY(-2px);
        transition: all 0.3s;
    }
}

:deep(.ant-tag) {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
}

.empty-state {
    padding: 32px;
    text-align: center;
    color: #8c8c8c;

    .anticon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    p {
        margin: 0;
        font-size: 14px;
    }
}
</style>