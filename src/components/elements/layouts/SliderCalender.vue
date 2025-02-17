<template>
  <a-layout-sider width="300" class="bg-white p-4 shadow-md h-screen overflow-auto">
    <!-- Nút Tạo -->
    <a-button type="primary" block class="mb-4">
      <template #icon><PlusOutlined /></template>
      Tạo
    </a-button>

    <!-- Lịch tháng -->
    <!-- <a-calendar fullscreen="false" class="mb-4" /> -->

    <!-- Tìm người -->
    <a-button block class="mb-4 flex items-center justify-center">
      <UserOutlined class="mr-2" /> Tìm người
    </a-button>

    <!-- Danh sách lịch -->
    <div class="mb-4">
      <a-collapse ghost>
        <!-- Lịch của tôi -->
        <a-collapse-panel key="1" header="Lịch của tôi">
          <a-checkbox v-model:checked="calendar.leBac" class="mb-2">le bac</a-checkbox>
          <a-checkbox v-model:checked="calendar.birthday" class="mb-2">Sinh nhật</a-checkbox>
          <a-checkbox v-model:checked="calendar.tasks">Việc cần làm</a-checkbox>
        </a-collapse-panel>

        <!-- Lịch khác -->
        <a-collapse-panel key="2" header="Lịch khác">
          <a-checkbox v-model:checked="calendar.holiday">Ngày lễ ở Việt Nam</a-checkbox>
        </a-collapse-panel>
      </a-collapse>
    </div>

    <!-- Footer -->
    <div class="text-center text-gray-500 text-sm">
      <a href="#">Điều khoản</a> - <a href="#">Bảo mật</a>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { ref } from "vue";
import { PlusOutlined, UserOutlined } from "@ant-design/icons-vue";

const calendar = ref({
  leBac: true,
  birthday: true,
  tasks: true,
  holiday: true,
});
</script>

<style scoped>
:deep(.ant-picker-calendar-mini .ant-picker-panel) {
  border: none;
  box-shadow: none;
}
</style>
