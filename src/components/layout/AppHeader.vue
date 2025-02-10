<template>
  <header class="header">
    <h1>Quản Lý Lịch Trình</h1>
    <button @click="logout">Đăng xuất</button>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const logout = () => {
  localStorage.removeItem("userToken");
  router.push("/login");
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
}
</style>
