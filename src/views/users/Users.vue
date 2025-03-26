<template>
  <!-- Dashboard header với stats cards -->
  <div class="dashboard-header">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card class="stat-card">
          <template #cover>
            <div class="stat-icon total-users">
              <TeamOutlined />
            </div>
          </template>
          <a-statistic 
            title="Tổng người dùng" 
            :value="pagination.total"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <template #cover>
            <div class="stat-icon active-users">
              <UserOutlined />
            </div>
          </template>
          <a-statistic 
            title="Người dùng hoạt động" 
            :value="activeUsers"
            :value-style="{ color: '#52c41a' }"
          />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card" @click="handleViewBanned">
          <template #cover>
            <div class="stat-icon banned-users">
              <UserDeleteOutlined />
            </div>
          </template>
          <a-statistic 
            title="Tài khoản bị khóa" 
            :value="bannedUsers"
            :value-style="{ color: '#ff4d4f' }"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>

  <!-- Search and filter section -->
  <a-card class="filter-section" :bordered="false">
    <a-row>
      <a-col :span="8">
        <a-input-search
          v-model:value="searchText"
          placeholder="Tìm kiếm theo email..."
          @search="handleSearch"
          :loading="loading"
          allow-clear
          enter-button
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input-search>
      </a-col>
    </a-row>
  </a-card>

  <!-- Main table -->
  <a-card class="table-card" :bordered="false">
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
          <span class="row-number">{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
        </template>

        <template v-else-if="column.key === 'email'">
          <div class="user-info">
            <a-avatar :size="32" :style="{ backgroundColor: getAvatarColor(record.email) }">
              {{ getAvatarText(record.email) }}
            </a-avatar>
            <span class="email-text">{{ record.email }}</span>
          </div>
        </template>

        <template v-else-if="column.key === 'role'">
          <div class="role-tags">
            <a-tag 
              v-for="role in record.roles" 
              :key="role.id"
              :color="getRoleColor(role.role_name)"
            >
              {{ role.role_name }}
            </a-tag>
          </div>
        </template>

        <template v-else-if="column.key === 'status'">
          <a-badge 
            :status="record.deleted_at ? 'error' : 'success'"
            :text="record.deleted_at ? 'Đã khóa' : 'Hoạt động'"
          />
        </template>

        <template v-if="column.key === 'action'">
          <div class="action-buttons">
            <a-tooltip title="Xem chi tiết">
              <a-button type="primary" shape="circle" @click="handleView(record)" class="action-button">
                <template #icon><ProfileOutlined /></template>
              </a-button>
            </a-tooltip>

            <a-tooltip :title="record.deleted_at ? 'Mở khóa tài khoản' : 'Khóa tài khoản'">
              <a-button 
                :type="record.deleted_at ? 'danger' : 'success'" 
                shape="circle" 
                @click="handleToggleLock(record)"
                class="action-button"
              >
                <template #icon>
                  <SafetyCertificateOutlined v-if="!record.deleted_at" />
                  <StopOutlined v-else />
                </template>
              </a-button>
            </a-tooltip>

            <a-tooltip title="Chỉnh sửa">
              <a-button type="warning" shape="circle" @click="handleEdit(record)" class="action-button">
                <template #icon><FormOutlined /></template>
              </a-button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </a-table>

    <a-empty 
      v-else 
      description="Không có dữ liệu người dùng" 
      class="custom-empty"
    >
      <template #image>
        <div class="empty-icon">
          <InboxOutlined />
        </div>
      </template>
    </a-empty>
  </a-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  TeamOutlined,
  UserOutlined,
  UserDeleteOutlined,
  SearchOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  FormOutlined,
  InboxOutlined
} from '@ant-design/icons-vue';
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
        email: searchText.value || null,
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });

    if (response.data && response.data.data) {
      dataSource.value.list = response.data.data;
      if (response.data.total) {
        pagination.value.total = response.data.total;
      } else {
        pagination.value.total = response.data.data.length;
      }
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    if (error.response?.status === 404) {
      message.info('Không tìm thấy người dùng phù hợp');
    } else {
      message.error('Có lỗi xảy ra khi tải danh sách người dùng');
    }
    dataSource.value.list = [];
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  fetchUsers();
};

const handleView = (record) => {
  if (!record || !record.id) {
    message.error('Không tìm thấy thông tin người dùng');
    return;
  }
  
  console.log('Viewing user:', record);
  router.push(`/dashboard/users/${record.id}/detail`);
};

const handleToggleLock = (record) => {
  const isCurrentlyLocked = record.deleted_at !== null;

  Modal.confirm({
    title: isCurrentlyLocked ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản',
    content: isCurrentlyLocked
      ? 'Bạn có chắc chắn muốn mở khóa tài khoản này❓'
      : 'Bạn có chắc chắn muốn khóa tài khoản này❓\nTài khoản sẽ được chuyển vào danh sách bị khóa.',
    okText: 'Xác nhận',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        const url = `${dirApi}admin/users/${record.id}/${isCurrentlyLocked ? 'unlock' : 'ban'}`;
        const method = isCurrentlyLocked ? 'post' : 'delete';

        await axios({
          method,
          url,
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });

        // Cập nhật số liệu thống kê ngay lập tức
        if (isCurrentlyLocked) {
          // Nếu đang mở khóa
          bannedUsersCount.value -= 1;
          pagination.value.total += 1;
          // Thêm user vào danh sách active
          dataSource.value.list.push(record);
        } else {
          // Nếu đang khóa
          bannedUsersCount.value += 1;
          pagination.value.total -= 1;
          // Xóa user khỏi danh sách active
          dataSource.value.list = dataSource.value.list.filter(user => user.id !== record.id);
        }

        record.deleted_at = isCurrentlyLocked ? null : new Date().toISOString();
        
        message.success(
          isCurrentlyLocked 
            ? 'Tài khoản đã được mở khóa✅' 
            : 'Tài khoản đã bị khóa và chuyển vào danh sách tài khoản bị khóa❗'
        );
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

const handleViewBanned = () => {
  router.push('/dashboard/users/ban');
};

const activeUsers = computed(() => {
  return pagination.value.total || 0;
});

const bannedUsersCount = ref(0);

const fetchBannedUsersCount = async () => {
  try {
    const response = await axios.get(`${dirApi}admin/users/ban`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });

    if (response.data && Array.isArray(response.data.data)) {
      bannedUsersCount.value = response.data.total || response.data.data.length;
    }
  } catch (error) {
    console.error('Lỗi khi lấy số lượng tài khoản bị khóa:', error);
    bannedUsersCount.value = 0;
  }
};

// Sửa lại computed property bannedUsers
const bannedUsers = computed(() => {
  return bannedUsersCount.value;
});

// Thêm các methods mới
const getAvatarColor = (email) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
  const index = email.length % colors.length;
  return colors[index];
};

const getAvatarText = (email) => {
  return email.charAt(0).toUpperCase();
};

const getRoleColor = (roleName) => {
  const colors = {
    'admin': 'blue',
    'user': 'green',
    'super admin': 'pink'
  };
  return colors[roleName.toLowerCase()] || 'default';
};

// Thêm state cho search và filter
const searchText = ref('');

const handleSearch = (value) => {
  searchText.value = value;
  pagination.value.current = 1;
  fetchUsers();
};

// Thêm onMounted để load cả 2 API khi component được tạo
onMounted(() => {
  fetchUsers();
  fetchBannedUsersCount();
});

// Thêm các watch riêng biệt
watch(() => pagination.value.current, () => {
  fetchUsers();
});

watch(searchText, (newVal) => {
  pagination.value.current = 1;
  fetchUsers();
});
</script>

<style scoped>
.dashboard-header {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

.total-users {
  background: linear-gradient(120deg, #1890ff, #69c0ff);
}

.active-users {
  background: linear-gradient(120deg, #52c41a, #95de64);
}

.banned-users {
  background: linear-gradient(120deg, #ff4d4f, #ff7875);
}

.filter-section {
  margin-bottom: 24px;
  border-radius: 12px;
  background: white;
}

.table-card {
  border-radius: 12px;
  background: white;
}

.custom-table {
  :deep(.ant-table) {
    border-radius: 12px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    font-weight: 600;
    padding: 16px;
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 16px;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #f5f5f5;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.email-text {
  color: #1f1f1f;
  font-weight: 500;
}

.role-tags {
  display: flex;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-button {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.custom-empty {
  padding: 48px 0;
}

.empty-icon {
  font-size: 64px;
  color: #bfbfbf;
  margin-bottom: 24px;
}

.row-number {
  font-weight: 500;
  color: #8c8c8c;
}

:deep(.ant-badge-status-dot) {
  width: 8px;
  height: 8px;
}

:deep(.ant-badge-status-text) {
  font-weight: 500;
}

:deep(.ant-input-search) {
  .ant-input-wrapper {
    border-radius: 8px;
    overflow: hidden;
  }

  .ant-input {
    &:hover, &:focus {
      border-color: #1890ff;
    }
  }

  .ant-input-search-button {
    height: 40px;
    &:hover, &:focus {
      background-color: #1890ff;
      border-color: #1890ff;
    }
  }
}
</style>
