<template>
 <a-drawer 
  :title="$t('profile_drawer.title')" 
  :width="'70%'" 
  :open="open" 
  @close="onClose"
 >
  <ProfileView />
</a-drawer>


  <!-- Drawer chỉnh sửa thông tin -->
</template>

<script setup>
import { ref, defineExpose } from "vue";
import ProfileView from "./ProfileView.vue";

const open = ref(false);

const openDrawer = () => {
  open.value = true;
};

const onClose = () => {
  open.value = false;
};



defineExpose({ openDrawer });
</script>
