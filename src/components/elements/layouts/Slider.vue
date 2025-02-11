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
      class="!overflow-auto !h-screen !fixed !left-0"
    >
      <div class="flex flex-col justify-between h-screen">
        <div>
          <div class="logo-wrapper mb-3 flex justify-center">
            <img
              v-if="!isCollapsed"
              alt="Logo full"
              src="@/assets/images/logo.svg"
              class="w-[120px] max-h-[64px]"
            />
            <img
              v-else
              alt="Logo"
              src="@/assets/images/mini-logo.png"
              class="w-[30px] max-h-[64px]"
            />
          </div>
          <Menu />
        </div>

        <div class="mb-4 px-4 flex gap-2 items-center text-white">
          <!--           <div>-->
          <!--             <SettingOutlined class="!text-2xl"/>-->
          <!--           </div>-->
          <!--           <div class="flex items-center">Cấu hình</div>-->
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
        class="slider-drawer theme-dark-drawer !bg-[#001628]"
      >
        <div class="logo-wrapper mb-2 mt-2">
          <img
            alt="Logo full"
            src="@/assets/images/logo.svg"
            class="w-[120px] max-h-[64px] pl-4"
          />
        </div>
        <Menu />
      </a-drawer>
    </div>
  </div>
</template>

<style scoped>
.logo-wrapper {
  height: 64px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
