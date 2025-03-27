<template>
  <div class="banned-users-container">
    <div class="page-header">
      <div class="header-left">
        <a-button class="back-button" type="primary" @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
          Quay lại
        </a-button>
        <h1 class="page-title">Danh sách tài khoản bị khóa</h1>
      </div>
      <div class="header-stats">
        <a-tag color="error" class="stat-tag">
          <LockOutlined /> {{ pagination.total }} tài khoản bị khóa
        </a-tag>
      </div>
    </div>

    <a-card :bordered="false" class="data-card">
      <template #extra>
        <ReloadOutlined 
          :class="['refresh-icon', { 'spinning': loading }]" 
          @click="fetchBannedUsers" 
        />
      </template>

      <a-table
        v-if="hasData"
        :columns="columns"
        :row-key="record => record.id"
        :data-source="dataSource.list"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        class="custom-table"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'id'">
            <span class="row-number">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </span>
          </template>

          <template v-else-if="column.key === 'email'">
            <div class="user-info">
              <a-avatar 
                :size="32" 
                :src="record.avatar"
                :style="{ backgroundColor: !record.avatar ? getAvatarColor(record.email) : '' }"
              >
                {{ !record.avatar ? getAvatarText(record.email) : '' }}
              </a-avatar>
              <span class="email-text">{{ record.email }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'role'">
            <div class="role-tags">
              <a-tag v-for="role in record.roles" :key="role.id" color="blue">
                {{ role.role_name }}
              </a-tag>
            </div>
          </template>

          <template v-else-if="column.key === 'banned_at'">
            <span class="date-text">
              <ClockCircleOutlined /> {{ formatDate(record.deleted_at) }}
            </span>
          </template>

          <template v-if="column.key === 'action'">
            <a-button 
              type="primary"
              @click="handleUnlock(record)"
              class="unlock-button"
            >
              <template #icon><UnlockOutlined /></template>
              <span>Mở khóa</span>
            </a-button>
          </template>
        </template>
      </a-table>

      <a-empty 
        v-else 
        :image="simpleImage"
        description="Không có tài khoản nào bị khóa"
        class="custom-empty"
      >
        <template #image>
          <UnlockOutlined class="empty-icon" />
        </template>
      </a-empty>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  UnlockOutlined, 
  ArrowLeftOutlined,
  LockOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue';
import { message, Empty } from 'ant-design-vue';
import axios from 'axios';
import dayjs from 'dayjs';

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;

// Thêm simple image từ Ant Design
const { PRESENTED_IMAGE_SIMPLE: simpleImage } = Empty;

// Thêm các hàm mới cho avatar
const getAvatarColor = (email) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
  const index = email?.length % colors.length || 0;
  return colors[index];
};

const getAvatarText = (email) => {
  return email ? email.charAt(0).toUpperCase() : 'U';
};

// Cập nhật columns
const columns = [
  { title: 'STT', key: 'id', width: 80 },
  { title: 'Email', key: 'email' },
  { title: 'Gender', dataIndex: 'gender', width: 100 },
  { title: 'Phone', dataIndex: 'phone', width: 120 },
  { title: 'Role', key: 'role', width: 120 },
  { title: 'Ngày khóa', key: 'banned_at', width: 180 },
  { title: 'Thao tác', key: 'action', width: 120, align: 'center' },
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
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #227CA0;
}

.back-button {
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #227CA0, #15C5B2);
    transform: translateX(-5px);
  }
}

.stat-tag {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
}

.data-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.refresh-icon {
  font-size: 18px;
  color: #15C5B2;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-icon:hover {
  color: #227CA0;
}

.refresh-icon.spinning {
  animation: rotate 1s linear infinite;
}

.custom-table {
  :deep(.ant-table) {
    border-radius: 12px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #f8fafc;
    font-weight: 600;
    color: #227CA0;
    
    &:hover {
      background: rgba(21, 197, 178, 0.1) !important;
    }
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: rgba(21, 197, 178, 0.05);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.ant-avatar) {
  border: 1px solid rgba(21, 197, 178, 0.2);
  object-fit: cover;
}

.email-text {
  color: #227CA0;
  font-weight: 500;
}

.role-tags {
  display: flex;
  gap: 4px;
  
  :deep(.ant-tag) {
    background: linear-gradient(135deg, #15C5B2, #227CA0);
    border: none;
    color: white;
  }
}

.date-text {
  color: #8c8c8c;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .anticon {
    color: #15C5B2;
  }
}

.unlock-button {
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #227CA0, #15C5B2);
    transform: translateY(-2px);
  }
}

.custom-empty {
  padding: 48px 0;
}

.empty-icon {
  font-size: 64px;
  color: #15C5B2;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
</style>