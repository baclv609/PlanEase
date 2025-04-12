<template>
  <div class="users-container">
    <!-- Dashboard header với stats cards được cải tiến -->
    <div class="dashboard-header">
      <h1 class="page-title">
        <TeamOutlined /> Quản lý người dùng
        <span class="subtitle">Quản lý và giám sát tài khoản người dùng trong hệ thống</span>
      </h1>

      <a-row :gutter="24" class="stats-row">
        <a-col :span="8">
          <a-card class="stat-card" :body-style="{ padding: '24px' }">
            <div class="stat-header">
              <div class="stat-icon total-users">
                <TeamOutlined />
              </div>
              <div class="stat-info">
                <span class="stat-label">Tổng người dùng</span>
                <span class="stat-value">{{ totalUsers }}</span>
              </div>
            </div>
            <div class="stat-footer">
              <span class="stat-description">Tổng số tài khoản trong hệ thống</span>
              <a-progress :percent="100" :show-info="false" status="normal" />
            </div>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card class="stat-card" :body-style="{ padding: '24px' }">
            <div class="stat-header">
              <div class="stat-icon active-users">
                <UserOutlined />
              </div>
              <div class="stat-info">
                <span class="stat-label">Đang hoạt động</span>
                <span class="stat-value">{{ activeUsers }}</span>
              </div>
            </div>
            <div class="stat-footer">
              <span class="stat-description">Người dùng đang hoạt động</span>
              <a-progress :percent="(activeUsers / totalUsers) * 100" :show-info="false" status="success" />
            </div>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card class="stat-card" :body-style="{ padding: '24px' }" @click="handleViewBanned">
            <div class="stat-header">
              <div class="stat-icon banned-users">
                <UserDeleteOutlined />
              </div>
              <div class="stat-info">
                <span class="stat-label">Tài khoản bị khóa</span>
                <span class="stat-value">{{ bannedUsers }}</span>
              </div>
            </div>
            <div class="stat-footer">
              <span class="stat-description">Nhấn để xem chi tiết</span>
              <a-progress :percent="(bannedUsers / totalUsers) * 100" :show-info="false" status="exception" />
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <a-card class="filter-section" :bordered="false">
      <div class="filter-header">
        <div class="left-section">
          <a-input-search v-model:value="searchText" placeholder="Tìm kiếm theo email..." @search="handleSearch" 
            :loading="loading" allow-clear enter-button class="search-input"  :style="{
                border: '1px solid #d9d9d9',
                borderRadius: '8px'
              }">
            <template #prefix>
              <SearchOutlined style="padding: 0 12px; color: rgba(0, 0, 0, 0.45)" />
            </template>
          </a-input-search>
        </div>
        <div class="right-section">
          <a-button type="primary" class="refresh-button" @click="refreshData">
            <template #icon>
              <ReloadOutlined />
            </template>
            Làm mới
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- Main table được cải tiến -->
    <a-card class="table-card" :bordered="false">
      <template #title>
        <div class="table-header">
          <div class="table-title">
            <UnorderedListOutlined /> Danh sách người dùng
          </div>
          <div class="table-actions">
            <a-tag color="blue">
              <ClockCircleOutlined /> Cập nhật lần cuối: {{ lastUpdateTime }}
            </a-tag>
          </div>
        </div>
      </template>

      <a-table v-if="hasData" :columns="columns" :row-key="record => record.id" :data-source="dataSource.list"
        :pagination="pagination" :loading="loading" @change="handleTableChange" class="custom-table">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'id'">
            <span class="row-number">{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
          </template>

          <template v-else-if="column.key === 'userInfo'">
            <div class="user-info">
              <a-avatar 
                :size="48" 
                :src="record.avatar || '/default-avatar.png'"
                :style="{ backgroundColor: !record.avatar ? getAvatarColor(record.email) : '' }"
                class="user-avatar"
              >
                {{ !record.avatar ? getAvatarText(record.email) : '' }}
              </a-avatar>
              <div class="user-details">
                <div class="user-name">
                  <span class="last-name">{{ record.last_name }}</span>
                  <span class="first-name">{{ record.first_name }}</span>
                </div>
                <div class="user-email">{{ record.email }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'role'">
            <div class="role-tags">
              <a-tag v-for="role in record.roles" :key="role.id" :color="getRoleColor(role.role_name)">
                {{ role.role_name }}
              </a-tag>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-badge :status="record.deleted_at ? 'error' : 'success'"
              :text="record.deleted_at ? 'Đã khóa' : 'Hoạt động'" />
          </template>

          <template v-if="column.key === 'action'">
            <div class="action-buttons">
              <a-tooltip title="Xem chi tiết">
                <a-button shape="circle" @click="handleView(record)" class="view-button">
                  <template #icon>
                    <ProfileOutlined />
                  </template>
                </a-button>
              </a-tooltip>

              <a-tooltip :title="record.deleted_at ? 'Mở khóa tài khoản' : 'Khóa tài khoản'">
                <a-button :type="record.deleted_at ? 'danger' : 'success'" shape="circle"
                  @click="handleToggleLock(record)" class="action-button">
                  <template #icon>
                    <KeyOutlined v-if="!record.deleted_at" />
                    <StopOutlined v-else />
                  </template>
                </a-button>
              </a-tooltip>
            </div>
          </template>
        </template>
      </a-table>

      <a-empty v-else description="Không có dữ liệu người dùng" class="custom-empty">
        <template #image>
          <div class="empty-icon">
            <InboxOutlined />
          </div>
        </template>
      </a-empty>
    </a-card>
  </div>
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
  KeyOutlined,
  StopOutlined,
  FormOutlined,
  InboxOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import axios from 'axios';

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;

const columns = [
  { title: 'STT', key: 'id' },
  { title: 'User Info', key: 'userInfo' },
  { title: 'Gender', dataIndex: 'gender' },
  { title: 'Phone', dataIndex: 'phone' },
  { title: 'Role', key: 'role' },
  { title: 'Action', key: 'action' },
];

const dataSource = ref({ list: [], total: 0 });
const loading = ref(false);
const pagination = ref({ 
  current: 1, 
  pageSize: 10, 
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `Tổng số ${total} người dùng`
});

// Thêm các biến mới để lưu trữ tổng số liệu
const totalActiveUsersCount = ref(0);
const totalBannedUsersCount = ref(0);

const hasData = computed(() => dataSource.value.list.length > 0);

const fetchUsers = async (params = {}) => {
  loading.value = true;
  try {
    const response = await axios.get(`${dirApi}admin/users`, {
      params: {
        per_page: pagination.value.pageSize,
        page: pagination.value.current,
        email: searchText.value || null,
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });

    if (response.data && response.data.data) {
      dataSource.value.list = response.data.data.data;
      pagination.value.total = response.data.data.total;
      
      // console.log('Danh sách người dùng:', response.data.data.data);
      
      // Chỉ cập nhật tổng số user active khi không có tìm kiếm
      if (!searchText.value) {
        totalActiveUsersCount.value = response.data.data.total;
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
    pagination.value.total = 0;
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
      ? 'Bạn có chắc chắn muốn mở khóa tài khoản này!'
      : 'Bạn có chắc chắn muốn khóa tài khoản này?',
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

        // Cập nhật số liệu thống kê
        if (isCurrentlyLocked) {
          totalBannedUsersCount.value -= 1;
          totalActiveUsersCount.value += 1;
          dataSource.value.list.push(record);
        } else {
          totalBannedUsersCount.value += 1;
          totalActiveUsersCount.value -= 1;
          dataSource.value.list = dataSource.value.list.filter(user => user.id !== record.id);
        }

        record.deleted_at = isCurrentlyLocked ? null : new Date().toISOString();

        message.success(
          isCurrentlyLocked
            ? 'Tài khoản đã được mở khóa'
            : 'Tài khoản đã bị khóa và chuyển vào danh sách tài khoản bị khóa'
        );
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        message.error('Có lỗi xảy ra, vui lòng thử lại!');
      }
    },
  });
};

const handleViewBanned = () => {
  router.push('/dashboard/users/ban');
};

const activeUsers = computed(() => {
  return totalActiveUsersCount.value;
});

const bannedUsers = computed(() => {
  return totalBannedUsersCount.value;
});

const totalUsers = computed(() => {
  return totalActiveUsersCount.value + totalBannedUsersCount.value;
});

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

const searchText = ref('');

const handleSearch = (value) => {
  searchText.value = value;
  pagination.value.current = 1;
  fetchUsers();
};

onMounted(() => {
  fetchUsers();
  fetchBannedUsersCount();
});

watch(() => pagination.value.current, () => {
  fetchUsers();
});

watch(searchText, (newVal) => {
  pagination.value.current = 1;
  fetchUsers();
});

const lastUpdateTime = ref(new Date().toLocaleString('vi-VN'));

const refreshData = async () => {
  await Promise.all([fetchUsers(), fetchBannedUsersCount()]);
  lastUpdateTime.value = new Date().toLocaleString('vi-VN');
  message.success('Đã cập nhật dữ liệu mới nhất');
};

const fetchBannedUsersCount = async () => {
  try {
    const response = await axios.get(`${dirApi}admin/users/ban`, {
      params: {
        per_page: 1, // Chỉ lấy 1 bản ghi vì chúng ta chỉ cần tổng số
        page: 1
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });

    if (response.data && response.data.data) {
      totalBannedUsersCount.value = response.data.data.total;
    }
  } catch (error) {
    console.error('Lỗi khi lấy số lượng tài khoản bị khóa:', error);
    totalBannedUsersCount.value = 0;
  }
};
</script>

<style scoped>
.users-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: #227CA0;
  display: flex;
  align-items: center;
  gap: 12px;

  .subtitle {
    font-size: 14px;
    color: #8c8c8c;
    font-weight: normal;
    margin-left: 12px;
  }
}

.stat-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  border: none;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: rgba(21, 197, 178, 0.2);
  }
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;

  &.total-users {
    background: linear-gradient(135deg, #15C5B2, #227CA0);
  }

  &.active-users {
    background: linear-gradient(135deg, #15C5B2, #227CA0);
  }

  &.banned-users {
    background: linear-gradient(135deg, #ff7eb3 0%, #ff758c 50%, #ff8c7f 100%);
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
}

.stat-footer {
  margin-top: 16px;

  .stat-description {
    display: block;
    margin-bottom: 8px;
    color: #8c8c8c;
    font-size: 14px;
  }
}

.filter-section {
  margin: 24px 0;
  border-radius: 16px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-input {
    width: 300px;
  }

  .refresh-button {
    border-radius: 8px;
    height: 40px;
    background: linear-gradient(135deg, #15C5B2, #227CA0);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #227CA0, #15C5B2);
    }
  }
}

.table-card {
  border-radius: 16px;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .table-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f1f1f;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
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

  :deep(.ant-table-tbody > tr) {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.user-avatar {
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  display: flex;
  gap: 4px;
  align-items: center;
  
  .last-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f1f1f;
  }
  
  .first-name {
    font-size: 16px;
    font-weight: 500;
    color: #1f1f1f;
  }
}

.user-email {
  font-size: 14px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #8c8c8c;
    border-radius: 50%;
    margin-right: 4px;
  }
}

.role-tags {
  display: flex;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;

  .action-button, .view-button {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .view-button {
    background: linear-gradient(70deg, #ffcc77 0%, #15c5b2 50%, #227ca0 100%);
    border: none;
    color: white;
    
    &:hover {
      background: linear-gradient(70deg, #227ca0 0%, #15c5b2 50%, #ffcc77 100%);
    }
  }

  .action-button {
    &[type="success"] {
      background: linear-gradient(135deg, #15C5B2, #227CA0);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #227CA0, #15C5B2);
      }
    }

    &[type="danger"] {
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #ff7875, #ff4d4f);
      }
    }
  }
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
    height: 40px;
    display: flex;
    align-items: center;
  }

  .ant-input-prefix {
    margin: 0;
    padding: 0 12px;
    color: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    height: 40px;
    background: #fff;
  }

  .ant-input {
    height: 40px;
    padding: 4px 11px;
    font-size: 14px;
    border: none;
    box-shadow: none;
    
    &:hover,
    &:focus {
      border-color: #15c5b2;
    }
  }

  .ant-input-group-addon {
    height: 40px;
    background: transparent;
    border: none;
  }

  .ant-input-search-button {
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #15C5B2, #227CA0);
    border: none;
    margin: 0;
    border-radius: 0 8px 8px 0;

    &:hover {
      background: linear-gradient(135deg, #227CA0, #15C5B2);
    }
  }
}

:deep(.ant-progress-bg) {
  background: linear-gradient(135deg, #15C5B2, #227CA0) !important;
}

.filter-section {
  .refresh-button {
    background: linear-gradient(135deg, #15C5B2, #227CA0);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #227CA0, #15C5B2);
    }
  }

  :deep(.ant-input-search-button) {
    background: linear-gradient(135deg, #15C5B2, #227CA0) !important;
    border: none;

    &:hover {
      background: linear-gradient(135deg, #227CA0, #15C5B2) !important;
    }
  }
}

.action-buttons {
  .action-button {
    &.view-button {
      background: linear-gradient(70deg, #ffcc77 0%, #15c5b2 50%, #227ca0 100%);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #227CA0, #15C5B2);
        transform: translateY(-2px);
      }
    }

    &[type="success"] {
      background: linear-gradient(135deg, #15C5B2, #227CA0);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #227CA0, #15C5B2);
        transform: translateY(-2px);
      }
    }

    &[type="danger"] {
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #ff7875, #ff4d4f);
        transform: translateY(-2px);
      }
    }
  }
}

:deep(.ant-tag-blue) {
  color: #227CA0;
  background: rgba(34, 124, 160, 0.1);
  border-color: #227CA0;
}

:deep(.ant-badge-status-success) {
  .ant-badge-status-dot {
    background: #15C5B2;
  }

  .ant-badge-status-text {
    color: #15C5B2;
  }
}

:deep(.ant-badge-status-error) {
  .ant-badge-status-dot {
    background: #ff4d4f;
  }

  .ant-badge-status-text {
    color: #ff4d4f;
  }
}

:deep(.ant-input:focus),
:deep(.ant-input-focused) {
  border-color: #15C5B2;
  box-shadow: 0 0 0 2px rgba(21, 197, 178, 0.2);
}

:deep(.ant-table-thead > tr > th) {
  &:hover {
    background: rgba(21, 197, 178, 0.1) !important;
  }
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(21, 197, 178, 0.05);
}

/* Thêm gradient cho các nút action */
.action-buttons {
  .action-button {
    &[type="success"] {
      background: linear-gradient(135deg, #15C5B2, #227CA0);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #227CA0, #15C5B2);
      }
    }

    &[type="warning"] {
      background: linear-gradient(135deg, #FFCC77, #FFA940);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #FFA940, #FFCC77);
      }
    }

    &[type="danger"] {
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #ff7875, #ff4d4f);
      }
    }
  }
}

/* Thêm màu cho role tags */
.role-tags {
  :deep(.ant-tag) {
    &[color="blue"] {
      background: rgba(34, 124, 160, 0.1);
      color: #227CA0;
      border-color: #227CA0;
    }

    &[color="green"] {
      background: rgba(21, 197, 178, 0.1);
      color: #15C5B2;
      border-color: #15C5B2;
    }

    &[color="pink"] {
      background: rgba(255, 77, 79, 0.1);
      color: #ff4d4f;
      border-color: #ff4d4f;
    }
  }
}
</style>
