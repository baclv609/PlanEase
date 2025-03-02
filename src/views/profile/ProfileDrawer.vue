<template>
  <a-drawer v-model:open="visible" :title="$t('Profile')" placement="right">
    <ProfileView @edit-profile="openEditProfile" />
  </a-drawer>

  <!-- Drawer chỉnh sửa thông tin -->
  <ProfileEditView ref="editProfileDrawer" />
</template>

<script setup>
import { ref, defineExpose } from "vue";
import ProfileView from "./ProfileView.vue"; 
import ProfileEditView from "./ProfileEditView.vue";

const visible = ref(false);
const editProfileDrawer = ref(null);

// Mở drawer profile
const open = () => {
  visible.value = true;
};

// Khi click vào icon edit, mở drawer chỉnh sửa thông tin
const openEditProfile = (user) => {
  editProfileDrawer.value.openDrawer(user);
};

// Expose để `DefaultLayout.vue` có thể gọi `open()`
defineExpose({ open });
</script>
