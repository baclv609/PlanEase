<script setup>
import { onMounted, ref } from "vue";
import { 
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons-vue";
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
    <a-menu-item key="dashboard">
      <template #icon>
        <DashboardOutlined />
      </template>
      <router-link :to="{ name: 'dashboard' }"> Thống kê </router-link>
    </a-menu-item>

    <a-menu-item key="users">
      <template #icon>
        <UserOutlined />
      </template>
      <router-link :to="{ name: 'users' }"> Quản lý người dùng </router-link>
    </a-menu-item>

    <!-- <a-menu-item key="roles">
      <template #icon>
        <SafetyCertificateOutlined />
      </template>
      <router-link :to="{ name: 'roles' }"> Quản lý role </router-link>
    </a-menu-item> -->

    <!-- quan lý setting -->
    <!-- <a-menu-item key="settings">
      <template #icon>
        <UsergroupAddOutlined />
      </template>
      <router-link :to="{ name: 'settings' }"> Quản lý setting </router-link>
    </a-menu-item> -->

    <!-- quan lý support -->
    <!-- <a-menu-item key="support">
      <template #icon>
        <UsergroupAddOutlined />
      </template>
      <router-link :to="{ name: 'support' }"> Quản lý support </router-link>
    </a-menu-item> -->

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
