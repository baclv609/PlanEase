<template>
  <div class="roles-container">
    <a-card title="Quản lý Role" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="default" class="trash-btn">
            <template #icon><DeleteOutlined /></template>
            Role đã xóa
          </a-button>
          <a-button type="primary" @click="handleCreate">
            <template #icon><PlusOutlined /></template>
            Thêm Role Mới
          </a-button>
        </a-space>
      </template>
      
      <a-table :columns="columns" :data-source="dataSource.list" :loading="loading" 
        :pagination="pagination" @change="handleTableChange">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>

          <template v-else-if="column.dataIndex">
            {{ record[column.dataIndex] || 'N/A' }}
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="default" size="small" @click="handleView(record)">
                <template #icon><EyeOutlined /></template>
                Chi tiết
              </a-button>
              <a-button type="primary" size="small" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                Sửa
              </a-button>
              <a-button type="danger" size="small" @click="handleDelete(record)">
                <template #icon><DeleteOutlined /></template>
                Xóa
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

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
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: '250px'
  },
];

const fetchRoles = async (params = {}) => {
  loading.value = true;
  try {
    const response = await axios.get(`${dirApi}admin/roles`, {
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
    } else {
      console.error("API dữ liệu không hợp lệ:", response.data);
      dataSource.value = { list: [], total: 0 };
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách role:', error);
    message.error('Có lỗi xảy ra khi tải danh sách role');
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
};

const handleView = (record) => {
  router.push({ name: 'role-detail', params: { id: record.id } });
};

const handleEdit = (record) => {
  message.info('Chức năng đang được phát triển');
  console.log('Edit role:', record);
};

const handleDelete = (record) => {
  message.info('Chức năng đang được phát triển');
  console.log('Delete role:', record);
};

const handleCreate = () => {
  router.push({ name: 'role-create' });
};

watch(() => pagination.value.current, fetchRoles, { immediate: true });
</script>

<style scoped>
.roles-container {
  padding: 24px;
}

.ant-space {
  gap: 8px;
}

.trash-btn {
  display: flex;
  align-items: center;
}

:deep(.anticon) {
  vertical-align: middle;
}
</style>