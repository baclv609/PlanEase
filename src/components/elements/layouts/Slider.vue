<script setup>
import Menu from "@/components/elements/layouts/Menu.vue";
import { useSlider, useResize } from "@/composables/index.js";

const { actionCollapse, isCollapsed } = useSlider();
const { hasMobile } = useResize();
</script>

<template>
  <div>
    <a-layout-sider
      v-if="!hasMobile"
      :width="isCollapsed ? 80 : 240"
      :collapsed="isCollapsed"
      :trigger="null"
      collapsible
      class="slider-layout !overflow-auto !h-screen !fixed !left-0"
    >
      <div class="flex flex-col justify-between h-screen">
        <div>
          <div class="logo-wrapper">
            <img
              v-if="!isCollapsed"
              alt="Logo full"
              src="@/assets/images/logo.png"
              class="logo-full"
            />
            <img
              v-else
              alt="Logo"
              src="@/assets/images/logo.png"
              class="logo-mini"
            />
          </div>
          <Menu />
        </div>

        <div class="footer-section">
          <!-- Footer content -->
        </div>
      </div>
    </a-layout-sider>

    <div v-if="hasMobile">
      <a-drawer
        :width="256"
        placement="left"
        :closable="false"
        :open="isCollapsed"
        @close="() => actionCollapse(!isCollapsed)"
        :body-style="{ padding: 0 }"
        class="slider-drawer"
      >
        <div class="logo-wrapper mobile">
          <img
            alt="Logo full"
            src="@/assets/images/logo.png"
            class="logo-full"
          />
        </div>
        <Menu />
      </a-drawer>
    </div>
  </div>
</template>

<style scoped>
.slider-layout {
  background: #FEF9EF !important;
  border-right: 1px solid rgba(255, 203, 119, 0.2);
}

.logo-wrapper {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(60deg,
    #FFCC77 0%,    
    #15C5B2 50%,   
    #227CA0 100%  
  );
  margin-bottom: 16px;
}

.logo-wrapper.mobile {
  background: #FEF9EF;
  border-bottom: 1px solid rgba(255, 203, 119, 0.2);
}

.logo-full {
  width: 160px;
  height: auto;
  max-height: 48px;
  object-fit: contain;
}

.logo-mini {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.footer-section {
  margin-bottom: 16px;
  padding: 0 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  color: #17C3B2;
}

:deep(.ant-layout-sider-children) {
  background: #FEF9EF;
}

/* Drawer styles */
.slider-drawer {
  :deep(.ant-drawer-wrapper-body) {
    background: #FEF9EF;
  }

  :deep(.ant-drawer-body) {
    background: #FEF9EF;
  }
}

/* Menu styles - these should be coordinated with Menu.vue */
:deep(.ant-menu) {
  background: #FEF9EF;
  border-right: none;
}

:deep(.ant-menu-item) {
  color: #17C3B2;
  
  &:hover {
    background: rgba(23, 195, 178, 0.1);
  }
  
  &.ant-menu-item-selected {
    background: #FFCB77 !important;
    color: #FEF9EF;
  }
}

:deep(.ant-menu-submenu) {
  color: #17C3B2;
  
  &-title:hover {
    color: #FFCB77 !important;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #FEF9EF;
}

::-webkit-scrollbar-thumb {
  background: #FFCB77;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #17C3B2;
}
</style>
