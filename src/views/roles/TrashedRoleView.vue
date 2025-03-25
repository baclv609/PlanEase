<template>
    <div class="force-delete-container">
        <a-card title="Danh sách Role đã xóa" :bordered="false">
            <template #extra>
                <a-button type="primary" ghost @click="goBack">
                    <template #icon><ArrowLeftOutlined /></template>
                    Quay lại
                </a-button>
            </template>

            <a-table :columns="columns" :data-source="dataSource.list" :loading="loading"
                :pagination="pagination" @change="handleTableChange">
                <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key === 'index'">
                        {{ index + 1 }}
                    </template>

                    <template v-else-if="column.key === 'created_at'">
                        {{ formatDate(record.created_at) }}
                    </template>

                    <template v-else-if="column.key === 'deleted_at'">
                        {{ formatDate(record.deleted_at) }}
                    </template>

                    <template v-else-if="column.dataIndex">
                        {{ record[column.dataIndex] || 'N/A' }}
                    </template>

                    <template v-if="column.key === 'action'">
                        <a-space>
                            <a-button type="primary" size="small" @click="handleRestore(record)">
                                <template #icon><UndoOutlined /></template>
                                Khôi phục
                            </a-button>
                            <a-popconfirm
                                title="Bạn có chắc chắn muốn xóa vĩnh viễn?"
                                ok-text="Đồng ý"
                                cancel-text="Hủy"
                                @confirm="handleForceDelete(record)"
                            >
                                <a-button type="danger" size="small">
                                    <template #icon><DeleteOutlined /></template>
                                    Xóa vĩnh viễn
                                </a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
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
import { DeleteOutlined, UndoOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';
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
        width: '60px'
    },
    {
        title: 'Tên Role',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Ngày tạo',
        key: 'created_at',
        width: '150px'
    },
    {
        title: 'Ngày xóa',
        key: 'deleted_at',
        width: '150px'
    },
    {
        title: 'Thao tác',
        key: 'action',
        width: '250px'
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
        // console.log('Restore response:', response.data); 

        if (response.data.code === 200) {
            message.success('Khôi phục role thành công');
            fetchDeletedRoles();
        } else {
            message.error(response.data.message || 'Có lỗi xảy ra khi khôi phục role');
        }
    } catch (error) {
        console.error('Lỗi khi khôi phục role:', error.response || error);
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
        message.success('Xóa vĩnh viễn role thành công');
        fetchDeletedRoles();
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
.force-delete-container {
    padding: 24px;
}

:deep(.ant-card-head) {
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;
}

:deep(.ant-card-head-title) {
    font-size: 18px;
    font-weight: 600;
}

:deep(.ant-table-thead > tr > th) {
    background: #fafafa;
}

:deep(.ant-btn) {
    display: flex;
    align-items: center;
}

.ant-space {
    gap: 8px;
}
</style>