<template>
  <a-table v-if="hasData" :columns="columns" :row-key="record => record.id" :data-source="dataSource.list"
    :pagination="pagination" :loading="loading" @change="handleTableChange">

    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex">
        {{ record[column.dataIndex] || 'N/A' }}
      </template>
      <template v-if="column.key === 'action'">
        <a-button @click="handleEdit(record)">Edit</a-button>
      </template>
    </template>
  </a-table>

  <p v-else>Không có dữ liệu.</p>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';

const dirApi = import.meta.env.VITE_API_BASE_URL;

const columns = [
  { title: 'STT', sorter: true, dataIndex: 'id' },
  { title: 'Email', dataIndex: 'email' },
  { title: 'Gender', dataIndex: 'gender', filters: [{ text: 'Male', value: 'male' }, { text: 'Female', value: 'female' }], width: '20%' },
  { title: 'Address', dataIndex: 'address', width: '20%' },
  { title: 'Phone', dataIndex: 'phone', width: '20%' },
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
      params: { per_page: pagination.value.pageSize, page: pagination.value.current, ...params },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}`, Accept: 'application/json' }
    });

    console.log("API Response:", response.data);

    if (!response.data || !Array.isArray(response.data.data)) {
      console.error("API dữ liệu không hợp lệ:", response.data);
      dataSource.value = { list: [], total: 0 };
    } else {
      dataSource.value.list = response.data.data;
      pagination.value.total = response.data.data.length;
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    dataSource.value = { list: [], total: 0 };
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag, filters, sorter) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;

  if (sorter.field && sorter.order) {
    dataSource.value.list.sort((a, b) => {
      if (sorter.order === 'ascend') {
        return a[sorter.field] > b[sorter.field] ? 1 : -1;
      } else {
        return a[sorter.field] < b[sorter.field] ? 1 : -1;
      }
    });
  }
};


const handleEdit = (record) => {
  console.log("Edit user:", record);
};

watch(() => pagination.value.current, fetchUsers, { immediate: true });

</script>
