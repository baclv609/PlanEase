<template>
  <div class="banned-users-container">
    <div class="header-actions" style="margin-bottom: 16px;">
      <a-button type="primary" @click="goBack">
        <template #icon><ArrowLeftOutlined /></template>
        Quay lại
      </a-button>
    </div>

    <a-card title="Danh sách tài khoản bị khóa">
      <a-table
        v-if="hasData"
        :columns="columns"
        :row-key="record => record.id"
        :data-source="dataSource.list"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'id'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>

          <template v-else-if="column.dataIndex">
            {{ record[column.dataIndex] || 'N/A' }}
          </template>

          <template v-else-if="column.key === 'role'">
            <span v-if="record.roles && record.roles.length">
              {{record.roles.map(role => role.role_name).join(', ')}}
            </span>
            <span v-else>N/A</span>
          </template>

          <template v-else-if="column.key === 'banned_at'">
            {{ formatDate(record.deleted_at) }}
          </template>

          <template v-if="column.key === 'action'">
            <a-button type="primary" size="small" @click="handleUnlock(record)">
              <template #icon><UnlockOutlined /></template>
              Mở khóa
            </a-button>
          </template>
        </template>
      </a-table>

      <a-empty 
        v-else 
        :image="simpleImage"
        description="Không có tài khoản nào bị khóa"
      >
        <template #image>
          <UnlockOutlined style="font-size: 64px; color: #52c41a;" />
        </template>
      </a-empty>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UnlockOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';
import { message, Empty } from 'ant-design-vue';
import axios from 'axios';
import dayjs from 'dayjs';

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;

// Thêm simple image từ Ant Design
const { PRESENTED_IMAGE_SIMPLE: simpleImage } = Empty;

const columns = [
  { title: 'STT', key: 'id' },
  { title: 'Email', dataIndex: 'email' },
  { title: 'Gender', dataIndex: 'gender' },
  { title: 'Phone', dataIndex: 'phone' },
  { title: 'Role', key: 'role' },
  { title: 'Ngày khóa', key: 'banned_at' },
  { title: 'Thao tác', key: 'action' },
];

const dataSource = ref({ list: [], total: 0 });
const loading = ref(false);
const pagination = ref({ current: 1, pageSize: 10, total: 0 });

const hasData = computed(() => dataSource.value.list.length > 0);

const formatDate = (date) => {
  return date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : 'N/A';
};

const fetchBannedUsers = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${dirApi}admin/users/ban`, {
      params: {
        per_page: pagination.value.pageSize,
        page: pagination.value.current,
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });

    if (response.data && Array.isArray(response.data.data)) {
      dataSource.value.list = response.data.data;
      pagination.value.total = response.data.total || response.data.data.length;
    } else {
      dataSource.value.list = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách tài khoản bị khóa:', error);
    dataSource.value.list = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleUnlock = async (record) => {
  try {
    await axios.post(
      `${dirApi}admin/users/${record.id}/unlock`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      }
    );

    message.success('Mở khóa tài khoản thành công✅');
    fetchBannedUsers(); // Refresh danh sách
  } catch (error) {
    console.error('Lỗi khi mở khóa tài khoản:', error);
    message.error('Có lỗi xảy ra khi mở khóa tài khoản');
  }
};

const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  fetchBannedUsers();
};

const goBack = () => {
  router.push('/dashboard/users');
};

// Fetch data when component mounted
fetchBannedUsers();
</script>

<style scoped>
.banned-users-container {
  padding: 24px;
}

:deep(.ant-empty) {
  margin: 32px 0;
}

:deep(.ant-empty-description) {
  color: #52c41a;
  font-size: 16px;
}
</style>