<script setup>
import { createVNode, ref, computed } from "vue";
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
    // Dừng Echo listener nếu có
    const echoStore = useEchoStore();
    // echoStore.stopListening();
    echoStore.destroyEcho();
    // Xóa token và thông tin user khỏi localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    message.success('Đăng xuất thành công');
    router.push({ name: 'home' });
  } catch (error) {
    message.error('Có lỗi xảy ra khi đăng xuất');
  }
};

// Thêm computed properties cho user info
const userName = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.first_name || 'Admin';
});

const userAvatar = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.avatar || '';
});
</script>

<template>
  <a-layout class="dashboard-layout">
    <Sider :trigger="null" />
    <a-layout
      :style="
        !hasMobile
          ? {
              marginLeft: isCollapsed ? '80px' : '240px',
              transition: 'all 0.2s',
              background: '#fff'
            }
          : { background: '#fff' }
      "
    >
      <a-layout-header class="header">
        <div class="header-content">
          <div class="header-left">
            <a-button 
              type="text" 
              class="trigger-button" 
              @click="handleSider"
            >
              <MenuUnfoldOutlined v-if="isCollapsed" />
              <MenuFoldOutlined v-else />
            </a-button>
          </div>

          <div class="header-right">
            <a-dropdown>
              <div class="user-profile">
                <a-avatar 
                  :size="36"
                  :src="userAvatar"
                  class="user-avatar"
                >
                  <template #icon>
                    <UserOutlined />
                  </template>
                </a-avatar>
                <div class="user-info">
                  <span class="user-name">{{ userName }}</span>
                  <small class="user-role">Administrator</small>
                </div>
              </div>

              <template #overlay>
                <a-menu class="profile-menu">
                  <a-menu-item @click="showProfile">
                    <template #icon>
                      <UserOutlined />
                    </template>
                    <span>Hồ sơ</span>
                  </a-menu-item>

                  <a-menu-divider />

                  <a-menu-item @click="handleLogout" danger>
                    <template #icon>
                      <LogoutOutlined />
                    </template>
                    <span>Đăng xuất</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>

      <a-layout-content class="main-content">
        <slot />
      </a-layout-content>

      <a-layout-footer class="footer">
        <div class="footer-content">
          <span class="copyright">© 2024 Prepedu Interview</span>
          <span class="version">Version 1.0</span>
        </div>
      </a-layout-footer>
    </a-layout>

    <ProfileDrawer ref="profileDrawer" />
  </a-layout>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: #fff;
}

/* Override màu nền mặc định của Ant Design */
:deep(.ant-layout) {
  background: #fff !important;
}

:deep(.ant-layout-content) {
  background: #fff !important;
}

:deep(.ant-layout-footer) {
  background: #fff !important;
}

.header {
  padding: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(255, 204, 119, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  height: 60px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 8px;
  transition: all 0.3s;
  color: #15C5B2;
}

.trigger-button:hover {
  background: rgba(21, 197, 178, 0.1);
  color: #227CA0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile {
  padding: 4px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-profile:hover {
  background: rgba(255, 204, 119, 0.1);
}

.user-avatar {
  border: 2px solid #FFCC77;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-weight: 600;
  color: #227CA0;
}

.user-role {
  color: #15C5B2;
  font-size: 12px;
}

.main-content {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
  width: 95%;
  background: #fff;
}

.footer {
  padding: 16px 24px;
  background: transparent;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #15C5B2;
  font-size: 14px;
}

/* Dropdown menu styles */
:deep(.profile-menu) {
  min-width: 200px;
  padding: 4px;
  background: #fff;
  border: 1px solid rgba(255, 204, 119, 0.2);
}

:deep(.ant-dropdown-menu-item) {
  padding: 10px 16px;
  border-radius: 4px;
  color: #15C5B2;

  &:hover {
    background: rgba(21, 197, 178, 0.1) !important;
    color: #227CA0 !important;
  }

  &-danger {
    color: #ff4d4f !important;
    
    &:hover {
      background: rgba(255, 77, 79, 0.1) !important;
      color: #ff4d4f !important;
    }
  }
}

:deep(.ant-dropdown-menu-item-icon) {
  font-size: 16px;
}

:deep(.ant-dropdown-menu-divider) {
  background-color: rgba(255, 204, 119, 0.2);
}

@media (max-width: 768px) {
  .user-info {
    display: none;
  }

  .main-content {
    padding: 10px;
    width: 100%;
  }
}
</style>
