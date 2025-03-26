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
            :value="pagination.total"
            :value-style="{ color: '#1890ff' }"
          />
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
          />
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
          />
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
          <a-button type="primary" @click="handleCreate" class="custom-button">
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
                <a-button type="primary" shape="circle" @click="handleView(record)">
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>
              
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
      dataSource.value.list = response.data.data
        .filter(role => role.name.toLowerCase() !== 'super admin')
        .map((role, index) => ({
          id: role.id || index + 1,
          ...role
        }));
      
      pagination.value.total = dataSource.value.list.length;
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

const activeRoles = computed(() => dataSource.value.list.length);
const deletedRoles = ref(0);

const fetchDeletedRolesCount = async () => {
  try {
    const response = await axios.get(`${dirApi}admin/roles/trashed`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    if (response.data && Array.isArray(response.data.data)) {
      deletedRoles.value = response.data.data.length;
    }
  } catch (error) {
    console.error('Lỗi khi lấy số role đã xóa:', error);
  }
};

onMounted(() => {
  fetchDeletedRolesCount();
});

watch(() => pagination.value.current, fetchRoles, { immediate: true });
</script>

<style scoped>
.roles-container {
  padding: 24px;
}

.stats-row {
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

.total-roles {
  background: linear-gradient(120deg, #1890ff, #69c0ff);
}

.active-roles {
  background: linear-gradient(120deg, #52c41a, #95de64);
}

.deleted-roles {
  background: linear-gradient(120deg, #ff4d4f, #ff7875);
}

.content-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-button {
  border-radius: 6px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    transform: translateY(-2px);
    transition: all 0.3s;
  }
}

.custom-table {
  :deep(.ant-table) {
    border-radius: 8px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    font-weight: 600;
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
  
  .role-icon {
    color: #1890ff;
  }
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

:deep(.ant-space) {
  gap: 8px;
}
</style>