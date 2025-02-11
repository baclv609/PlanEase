<script setup>
import { createVNode, ref } from "vue";
import { Modal } from "ant-design-vue";
import {
  ExclamationCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";

import Sider from "@/components/elements/layouts/Slider.vue";
import { useSlider, useResize } from "@/composables/index.js";

const { isCollapsed, actionCollapse } = useSlider();
const { hasMobile } = useResize();

const handleSider = () => {
  actionCollapse(!isCollapsed.value);
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
                  <a-menu-item>
                    <template #icon>
                      <UserOutlined />
                    </template>
                    Hồ sơ
                  </a-menu-item>

                  <a-menu-item>
                    <template #icon>
                      <UserOutlined />
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
