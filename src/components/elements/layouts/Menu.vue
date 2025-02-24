<script setup>
import { onMounted, ref } from "vue";
import { PieChartOutlined, UsergroupAddOutlined } from "@ant-design/icons-vue";
import { useAuth } from "@/composables";

const selectedKeys = ref(["dashboard"]);

onMounted(() => {
  const path = window.location.pathname;
  const key = path.split("/").pop();
  selectedKeys.value = [key || "dashboard"];
});

const { authState } = useAuth();
</script>

<template>
  <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
    <!-- <a-menu-item key="dashboard" v-if="authState.deviceValid">
      <template #icon>
        <PieChartOutlined />
      </template>
      <router-link :to="{ name: 'dashboard' }"> Tổng quan </router-link>
    </a-menu-item> -->

    <a-menu-item key="users">
      <template #icon>
        <UsergroupAddOutlined />
      </template>
      <router-link :to="{ name: 'users' }"> Quản lý người dùng </router-link>
    </a-menu-item>

    <a-menu-item key="dashboard">
      <template #icon>
        <PieChartOutlined />
      </template>
      <router-link :to="{ name: 'dashboard' }"> Quản lý thiết bị </router-link>
    </a-menu-item>

    <a-menu-item key="events">
      <template #icon>
        <PieChartOutlined />
      </template>
      <router-link :to="{ name: 'event-list' }"> Quản lý sự kiện </router-link>
    </a-menu-item>

    <!-- quan lý setting -->
    <a-menu-item key="settings">
      <template #icon>
        <UsergroupAddOutlined />
      </template>
      <router-link :to="{ name: 'settings' }"> Quản lý setting </router-link>
    </a-menu-item>

    <!-- quan lý support -->
    <a-menu-item key="support">
      <template #icon>
        <UsergroupAddOutlined />
      </template>
      <router-link :to="{ name: 'support' }"> Quản lý support </router-link>
    </a-menu-item>

    <!-- <a-menu-item key="logout">
      <template #icon>
        <UsergroupAddOutlined />
      </template>
      <router-link :to="{ name: 'logout' }"> Đăng xuất </router-link>
    </a-menu-item> -->
  </a-menu>
</template>

<style scoped>
.ant-menu-item {
  display: flex;
  align-items: center;
}
</style>
