<template>
    <a-drawer v-model:open="visible" :title="$t('Profile')" placement="right">
      <ProfileView />
    </a-drawer>
  </template>
  
  <script setup>
  import { ref, defineExpose } from "vue";
  import ProfileView from "./ProfileView.vue"; 
  
  const visible = ref(false);
  
  // Hàm mở drawer
  const open = () => {
    visible.value = true;
  };
  
  // Expose để `DefaultLayout.vue` có thể gọi hàm `open()`
  defineExpose({ open });
  </script>
  