<template>
  <a-table v-if="hasData" :columns="columns" :row-key="record => record.id" :data-source="dataSource.list"
    :pagination="pagination" :loading="loading" @change="handleTableChange">

    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'id'">
        {{ index + 1 }}
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

      <!-- Cột Action -->
      <template v-if="column.key === 'action'">
        <div class="action-buttons">
          <!-- Xem tài khoản -->
          <a-button type="default" shape="circle" @click="handleView(record)">
            <template #icon>
              <EyeOutlined />
            </template>
          </a-button>

          <!-- Khóa/Mở khóa tài khoản -->
          <a-button shape="circle" @click="handleToggleLock(record)"
            :style="{ backgroundColor: record.deleted_at ? '#f8d7da' : '#d4edda', borderColor: record.deleted_at ? '#dc3545' : '#28a745' }">
            <template #icon>
              <LockOutlined v-if="record.deleted_at" />
              <UnlockOutlined v-else />
            </template>
          </a-button>

          <!-- Chỉnh sửa tài khoản -->
          <a-button shape="circle" @click="handleEdit(record)"
            style="background-color: #fff3cd; border-color: #ffc107;">
            <template #icon>
              <EditOutlined />
            </template>
          </a-button>
        </div>
      </template>
    </template>
  </a-table>

  <p v-else>Không có dữ liệu.</p>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { EyeOutlined, UnlockOutlined, LockOutlined, EditOutlined } from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import axios from 'axios';

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;

const columns = [
  { title: 'STT', key: 'id' },
  { title: 'Email', dataIndex: 'email', sorter: true },
  { title: 'Gender', dataIndex: 'gender', sorter: true },
  { title: 'Phone', dataIndex: 'phone' },
  { title: 'Role', key: 'role' },
  { title: 'Action', key: 'action' },
];

const dataSource = ref({ list: [], total: 0 });
const loading = ref(false);
const pagination = ref({ current: 1, pageSize: 10, total: 0 });

const hasData = computed(() => dataSource.value.list.length > 0);

const fetchUsers = async (params = {}) => {
  loading.value = true;
  try {
    const response = await axios.get(`${dirApi}admin/users`, {
      params: {
        per_page: pagination.value.pageSize,
        page: pagination.value.current,
        sort_field: params.sortField || 'id',
        sort_order: params.sortOrder || 'asc',
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });

    if (!response.data || !Array.isArray(response.data.data)) {
      console.error("API dữ liệu không hợp lệ:", response.data);
      dataSource.value = { list: [], total: 0 };
    } else {
      dataSource.value.list = response.data.data.map((user, index) => ({
        id: user.id || index + 1,
        ...user
      }));

      pagination.value.total = response.data.total;
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    dataSource.value = { list: [], total: 0 };
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
};

const handleView = (record) => {
  router.push({ name: 'users-detail', params: { id: record.id } });
};

const handleToggleLock = (record) => {
  const isCurrentlyLocked = record.deleted_at !== null; // Kiểm tra nếu tài khoản đang bị khóa

  Modal.confirm({
    title: isCurrentlyLocked ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản',
    content: isCurrentlyLocked
      ? 'Bạn có chắc chắn muốn mở khóa tài khoản này❓'
      : 'Bạn có chắc chắn muốn khóa tài khoản này❓',
    okText: 'Xác nhận',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        const url = `${dirApi}admin/users/${record.id}/${isCurrentlyLocked ? 'unlock' : 'ban'}`;
        const method = isCurrentlyLocked ? 'post' : 'delete'; // Mở khóa = POST, Khóa = DELETE

        await axios({
          method,
          url,
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });

        // Cập nhật lại trạng thái `deleted_at`
        record.deleted_at = isCurrentlyLocked ? null : new Date().toISOString();

        message.success(isCurrentlyLocked ? 'Tài khoản đã được mở khóa✅' : 'Tài khoản đã bị khóa❗');
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        message.error('Có lỗi xảy ra, vui lòng thử lại!');
      }
    },
  });
};

const handleEdit = (record) => {
  console.log("Chỉnh sửa tài khoản:", record);
};

watch(() => pagination.value.current, fetchUsers, { immediate: true });
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .ant-btn {
  opacity: 0.7;
  transition: opacity 0.3s ease-in-out;
}

.action-buttons .ant-btn:hover {
  opacity: 1;
}
</style>
