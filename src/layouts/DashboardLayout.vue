<script setup>
import { createVNode, ref } from "vue";
import { Modal, message } from "ant-design-vue";
import {
  ExclamationCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from 'vue-router';
import axios from 'axios';

import Sider from "@/components/elements/layouts/Slider.vue";
import { useSlider, useResize } from "@/composables/index.js";
import ProfileDrawer from '@/views/profileAdmin/ProfileDrawer.vue';
import { useEchoStore } from "@/stores/echoStore";

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const { isCollapsed, actionCollapse } = useSlider();
const { hasMobile } = useResize();
const profileDrawer = ref(null);

const handleSider = () => {
  actionCollapse(!isCollapsed.value);
};

const showProfile = () => {
  profileDrawer.value?.openDrawer();
};

const handleLogout = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${dirApi}auth/logout`,
      {},
      { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      }
    );

    // Xóa token và thông tin user khỏi localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    // Dừng Echo listener nếu có
    const echoStore = useEchoStore();
    echoStore.stopListening();
    echoStore.destroyEcho();

    message.success('Đăng xuất thành công');
    router.push({ name: 'home' });
  } catch (error) {
    message.error('Có lỗi xảy ra khi đăng xuất');
  }
};
</script>

<template>
  <a-layout class="!min-h-screen">
    <Sider :trigger="null" />
    <a-layout
      :style="
        !hasMobile
          ? {
              marginLeft: isCollapsed ? '80px' : '240px',
              transition: 'all 0.2s',
            }
          : {}
      "
    >
      <a-layout-header class="!h-[60px]">
        <div class="!flex !items-center !justify-between !h-[60px]">
          <div class="!cursor-pointer px-1" @click="handleSider">
            <template v-if="isCollapsed">
              <MenuFoldOutlined si />
            </template>
            <template v-else>
              <MenuUnfoldOutlined />
            </template>
          </div>
          <div class="flex items-center gap-x-1 ml-auto">
            <a-dropdown>
              <div class="flex items-center cursor-pointer">
                <a-avatar size="small" class="mr-1">
                  <template #icon>
                    <UserOutlined />
                  </template>
                </a-avatar>

                <span class="text-base"> admin </span>
              </div>

              <template #overlay>
                <a-menu>
                  <a-menu-item @click="showProfile">
                    <template #icon>
                      <UserOutlined />
                    </template>
                    Hồ sơ
                  </a-menu-item>

                  <a-menu-item @click="handleLogout">
                    <template #icon>
                      <LogoutOutlined />
                    </template>
                    Đăng xuất
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>

      <a-layout-content class="!p-4 lg:w-[95%] lg:m-auto">
        <slot />
      </a-layout-content>
      <a-layout-footer class="!text-right !py-3 !px-4 !text-slate-800">
        Powered by Prepedu interview - v1.0
      </a-layout-footer>
    </a-layout>

    <ProfileDrawer ref="profileDrawer" />
  </a-layout>
</template>

<style scoped>
:deep(.ant-layout-header) {
  padding: 0 15px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1;
}
</style>
