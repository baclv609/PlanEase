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
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `Tổng số ${total} role đã xóa`
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

        if (response.data.code === 200) {
            dataSource.value.list = response.data.data.data.map((role, index) => ({
                id: role.id || index + 1,
                ...role
            }));
            pagination.value.total = response.data.data.total;

            if (dataSource.value.list.length === 0) {
                message.info('Không có role nào trong thùng rác');
            }
        } else if (response.data.code === 404) {
            message.info('Không có role nào trong thùng rác');
            dataSource.value.list = [];
            pagination.value.total = 0;
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách role đã xóa:', error);
        if (error.response && error.response.status === 404) {
            message.info('Không có role nào trong thùng rác');
        } else {
            message.error('Có lỗi xảy ra khi tải danh sách role đã xóa');
        }
        dataSource.value.list = [];
        pagination.value.total = 0;
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
    background: #f8fafc;
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
    border-color: #15C5B2;
    color: #15C5B2;
    
    &:hover {
        transform: translateX(-5px);
        border-color: #227CA0;
        color: #227CA0;
    }
}

.header-title {
    font-size: 24px;
    font-weight: 600;
    color: #227CA0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-icon {
    font-size: 28px;
    color: #15C5B2;
}

.content-card {
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.custom-table {
    :deep(.ant-table) {
        border-radius: 12px;
    }

    :deep(.ant-table-thead > tr > th) {
        background: #f8fafc;
        font-weight: 600;
        padding: 16px;
        color: #227CA0;
        
        &:hover {
            background: rgba(21, 197, 178, 0.1) !important;
        }
    }

    :deep(.ant-table-tbody > tr > td) {
        padding: 16px;
    }

    :deep(.ant-table-tbody > tr:hover > td) {
        background: rgba(21, 197, 178, 0.05);
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
    color: #227CA0;
    font-weight: 500;

    .anticon {
        color: #15C5B2;
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
    border: none;
    
    &[type="primary"] {
        background: linear-gradient(135deg, #15C5B2, #227CA0);
        
        &:hover {
            background: linear-gradient(135deg, #227CA0, #15C5B2);
            transform: translateY(-2px);
        }
    }
    
    &[type="danger"] {
        background: linear-gradient(135deg, #ff4d4f, #ff7875);
        
        &:hover {
            background: linear-gradient(135deg, #ff7875, #ff4d4f);
            transform: translateY(-2px);
        }
    }
}

:deep(.ant-tag) {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    border: none;
    
    &[color="blue"] {
        background: linear-gradient(135deg, #15C5B2, #227CA0);
        color: white;
    }
    
    &[color="red"] {
        background: linear-gradient(135deg, #ff4d4f, #ff7875);
        color: white;
    }
}

.empty-state {
    padding: 32px;
    text-align: center;
    color: #8c8c8c;

    .anticon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #15C5B2;
    }

    p {
        margin: 0;
        font-size: 14px;
        color: #227CA0;
    }
}

/* Pagination styles */
:deep(.ant-pagination-item-active) {
    border-color: #15C5B2;
    
    a {
        color: #15C5B2;
    }
}

:deep(.ant-pagination-item:hover) {
    border-color: #15C5B2;
    
    a {
        color: #15C5B2;
    }
}

:deep(.ant-pagination-prev:hover .ant-pagination-item-link),
:deep(.ant-pagination-next:hover .ant-pagination-item-link) {
    border-color: #15C5B2;
    color: #15C5B2;
}

/* Popconfirm styles */
:deep(.ant-popover-buttons) {
    .ant-btn-primary {
        background: linear-gradient(135deg, #15C5B2, #227CA0);
        border: none;
        
        &:hover {
            background: linear-gradient(135deg, #227CA0, #15C5B2);
        }
    }
}
</style>