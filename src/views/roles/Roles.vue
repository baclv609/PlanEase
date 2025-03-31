<template>
  <div class="roles-container">
    <!-- Dashboard Stats -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="8">
        <a-card class="stat-card">
          <template #cover>
            <div class="stat-icon total-roles">
              <TeamOutlined />
            </div>
          </template>
          <a-statistic 
            title="Tổng số Role" 
            :value="totalRoles"
            :value-style="{ color: '#1890ff' }"
          >
            <template #suffix>
              <small style="font-size: 14px; margin-left: 8px;">role</small>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <template #cover>
            <div class="stat-icon active-roles">
              <SafetyCertificateOutlined />
            </div>
          </template>
          <a-statistic 
            title="Role đang hoạt động" 
            :value="activeRoles"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>
              <small style="font-size: 14px; margin-left: 8px;">đang hoạt động</small>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card" @click="handleTrashed">
          <template #cover>
            <div class="stat-icon deleted-roles">
              <DeleteOutlined />
            </div>
          </template>
          <a-statistic 
            title="Role đã xóa" 
            :value="deletedRoles"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #suffix>
              <small style="font-size: 14px; margin-left: 8px;">đã xóa</small>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- Main Content Card -->
    <a-card :bordered="false" class="content-card">
      <template #title>
        <div class="card-title">
          <SafetyCertificateOutlined /> Quản lý Role
        </div>
      </template>
      
      <template #extra>
        <a-space>
          <a-button type="default" @click="handleTrashed" class="custom-button">
            <template #icon><DeleteOutlined /></template>
            Role đã xóa
          </a-button>
          <a-button class="custom-button gradient-primary" @click="handleCreate">
            <template #icon><PlusOutlined /></template>
            Thêm Role Mới
          </a-button>
        </a-space>
      </template>
      
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
              <SafetyCertificateOutlined class="role-icon" />
              <span>{{ record.name }}</span>
            </div>
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-tooltip title="Xem chi tiết">
                <a-button shape="circle" @click="handleView(record)" class="view-button">
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>
              
              <template v-if="!isAdminRole(record)">
                <a-tooltip title="Chỉnh sửa">
                  <a-button type="warning" shape="circle" @click="handleEdit(record)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                
                <a-tooltip title="Xóa">
                  <a-popconfirm
                    title="Bạn có chắc chắn muốn xóa role này?"
                    ok-text="Đồng ý"
                    cancel-text="Hủy"
                    @confirm="handleDelete(record)"
                  >
                    <a-button type="danger" shape="circle">
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-popconfirm>
                </a-tooltip>
              </template>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

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
  showTotal: (total) => `Tổng số ${total} role`
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

    if (response.data.code === 200) {
      dataSource.value.list = response.data.data.data
        .filter(role => role.name.toLowerCase() !== 'super admin')
        .map((role, index) => ({
          id: role.id || index + 1,
          ...role
        }));
      
      pagination.value.total = response.data.data.total;
    } else {
      console.error("API dữ liệu không hợp lệ:", response.data);
      dataSource.value = { list: [], total: 0 };
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách role:', error);
    message.error('Có lỗi xảy ra khi tải danh sách role');
    dataSource.value = { list: [], total: 0 };
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  fetchRoles();
};

const handleView = (record) => {
  router.push({ name: 'role-detail', params: { id: record.id } });
};

const handleEdit = (record) => {
  router.push({ name: 'role-update', params: { id: record.id } });
};

const handleDelete = async (record) => {
  try {
    const response = await axios.delete(`${dirApi}admin/roles/${record.id}/delete`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (response.data.code === 200) {
      deletedRoles.value += 1;
      pagination.value.total -= 1;
      
      dataSource.value.list = dataSource.value.list.filter(role => role.id !== record.id);
      
      message.success('Xóa role thành công');
    } else {
      message.error(response.data.message || 'Có lỗi xảy ra khi xóa role');
    }
  } catch (error) {
    console.error('Lỗi khi xóa role:', error);
    message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa role');
  }
};

const handleTrashed = () => {
  router.push({ name: 'role-trashed' });
};

const handleCreate = () => {
  router.push({ name: 'role-create' });
};

const activeRoles = computed(() => {
  // Chỉ tính những role đang hoạt động
  return dataSource.value.list.length;
});

const deletedRoles = ref(0);

const totalRoles = computed(() => {
  // Tổng số role = role đang hoạt động + role đã xóa
  return activeRoles.value + deletedRoles.value;
});

const fetchDeletedRolesCount = async () => {
  try {
    const response = await axios.get(`${dirApi}admin/roles/trashed`, {
      params: {
        per_page: 1,
        page: 1
      },
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('access_token')}` 
      }
    });

    if (response.data.code === 200) {
      deletedRoles.value = response.data.data.total;
    } else if (response.data.code === 404) {
      deletedRoles.value = 0;
    }
  } catch (error) {
    console.error('Lỗi khi lấy số role đã xóa:', error);
    deletedRoles.value = 0;
  }
};

onMounted(() => {
  fetchDeletedRolesCount();
});

watch(() => pagination.value.current, fetchRoles, { immediate: true });

const isAdminRole = (record) => {
  return record.name.toLowerCase() === 'admin';
};
</script>

<style scoped>
.roles-container {
  padding: 24px;
  background: #f8fafc;
}

.stats-row {
  margin-bottom: 24px;
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
  }
}

.stat-icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

/* Đồng bộ gradient cho các stat cards */
.total-roles {
  background: linear-gradient(135deg, #15C5B2, #227CA0);
}

.active-roles {
  background: linear-gradient(135deg, #15C5B2, #227CA0);
}

.deleted-roles {
  background: linear-gradient(135deg, #ff7eb3 0%, #ff758c 50%, #ff8c7f 100%);
}

/* Đồng bộ màu cho statistics */
:deep(.ant-statistic-title) {
  color: #8c8c8c;
}

:deep(.ant-statistic-content-value) {
  color: #227CA0 !important;
}

.content-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #227CA0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-button {
  border-radius: 8px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s;
  
  &.gradient-primary {
    background: linear-gradient(70deg, #ffcc77 0%, #15c5b2 50%, #227ca0 100%);
    border: none;
    color: white;
    
    &:hover {
      background: linear-gradient(70deg, #227ca0 0%, #15c5b2 50%, #ffcc77 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(21, 197, 178, 0.2);
    }
  }

  &[type="default"] {
    background: #FEF9EF;
    border: 1px solid #FFD977;
    color: #227C9D;
    
    &:hover {
      background: #FFD977;
      color: #227C9D;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 217, 119, 0.2);
    }
  }

  .anticon {
    font-size: 16px;
  }
}

/* Thêm animation cho icon */
.custom-button:hover .anticon {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

/* Thêm spacing cho button container */
:deep(.ant-space) {
  gap: 16px;
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

.index-column {
  font-weight: 500;
  color: #8c8c8c;
}

.role-name {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .role-icon {
    color: #15C5B2;
    font-size: 16px;
  }
}

/* Đồng bộ style cho các action buttons */
:deep(.ant-btn-circle) {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  
  &.view-button {
    background: linear-gradient(70deg, #ffcc77 0%, #15c5b2 50%, #227ca0 100%);
    color: white;
    
    &:hover {
      background: linear-gradient(70deg, #227ca0 0%, #15c5b2 50%, #ffcc77 100%);
      transform: translateY(-2px);
    }
  }
  
  &[type="warning"] {
    background: linear-gradient(135deg, #FFCC77, #FFA940);
    
    &:hover {
      background: linear-gradient(135deg, #FFA940, #FFCC77);
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

/* Đồng bộ style cho popconfirm */
:deep(.ant-popover-buttons) {
  .ant-btn-primary {
    background: linear-gradient(135deg, #15C5B2, #227CA0);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #227CA0, #15C5B2);
    }
  }
}

/* Đồng bộ style cho pagination */
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