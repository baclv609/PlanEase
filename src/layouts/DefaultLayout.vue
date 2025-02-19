<template>
  <a-layout class="min-h-screen bg-gray-100">
    <!-- HEADER -->
    <a-layout-header class="!bg-white shadow flex justify-between px-6 py-3">
      <!-- Logo -->
      <div class="flex items-center gap-4">
        <!-- <img src="@/assets/logo.png" alt="Logo" class="h-8" /> -->
        <h1 class="text-lg font-semibold">Calendar App</h1>
      </div>

      <!-- Search -->
      <a-input-search :placeholder="$t('Search')" class="w-1/3" />

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <a-button type="primary" class="bg-yellow-500 text-white">
          <TrophyOutlined /> {{ $t('Update_plane') }}
        </a-button>

        <!-- Tooltip chứa icon Settings -->
        <a-tooltip title="">
          <a-button shape="circle" @click="openSettingsModal">
            <SettingOutlined />
          </a-button>
        </a-tooltip>

        <!-- User Dropdown -->
        <a-dropdown>
          <a-avatar :size="40" class="cursor-pointer">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
          <template #overlay>
            <a-menu>
              <a-menu-item>{{ $t('Profile') }}</a-menu-item>
              <a-menu-item>{{ $t('Logout') }}</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <!-- MAIN CONTENT -->
    <a-layout>
      <!-- Sidebar -->
      <a-layout-sider width="280" class="!bg-white p-4 shadow">
        <a-button type="primary" block class="mb-4">+ Create Event</a-button>

        <!-- Mini Calendar -->
        <!-- <a-calendar v-model:value="currentDate" fullscreen="false" class="mb-4" /> -->

        <!-- My Calendars -->
        <div class="mb-4">
          <h3 class="font-semibold mb-2">My Calendars</h3>
          <a-checkbox-group v-model:value="selectedCalendars" class="flex flex-col gap-2">
            <a-checkbox value="exercise">🏋️ Tập thể dục</a-checkbox>
            <a-checkbox value="dinner">🍽️ Ăn tối</a-checkbox>
            <a-checkbox value="outing">🚗 Đi chơi</a-checkbox>
          </a-checkbox-group>
        </div>

        <!-- Other Calendars -->
        <div>
          <h3 class="font-semibold mb-2">Other Calendars</h3>
          <a-checkbox-group v-model:value="otherCalendars" class="flex flex-col gap-2">
            <a-checkbox value="vn-holidays">🇻🇳 Ngày lễ Việt Nam</a-checkbox>
            <a-checkbox value="tet">🎉 Tết nguyên đán</a-checkbox>
          </a-checkbox-group>
        </div>
      </a-layout-sider>

      <!-- Calendar View -->
      <a-layout-content class="p-6">
        <div class="bg-white p-4 shadow rounded-lg">
          <!-- Calendar Toolbar -->
          <!-- <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <a-button>Today</a-button>
              <a-button shape="circle">
                <LeftOutlined />
              </a-button>
              <a-button shape="circle">
                <RightOutlined />
              </a-button>
            </div>

            <div class="flex items-center gap-2">
              <a-dropdown>
                <a-button>Month <DownOutlined /></a-button>
                <template #overlay>
                  <a-menu>
              
                  </a-menu>
                </template>
              </a-dropdown>
              <a-button shape="circle">
                <CalendarOutlined />
              </a-button>
              <a-button shape="circle">
                <CheckOutlined />
              </a-button>
            </div>
          </div> -->

          <!-- Calendar Grid -->
          <!-- <a-calendar v-model:value="currentDate" /> -->
          <slot></slot>
        </div>
      </a-layout-content>
    </a-layout>

    <!-- FOOTER -->
    <a-layout-footer class="text-center py-4 text-gray-500">
      © 2025 Calendar App. All Rights Reserved. | Terms of Use | Privacy Policy
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  LeftOutlined,
  RightOutlined,
  DownOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";

import SettingsView from '@/views/settings/SettingsView.vue'

const isModalOpen = ref(false);

// Hàm mở modal
const openSettingsModal = () => {
  isModalOpen.value = true;
};

// Hàm nhận sự kiện cập nhật trạng thái từ component con
const updateModalState = (value) => {
  isModalOpen.value = value;
};


const changeView = (view) => {
  console.log("Change calendar view to:", view);
};
</script>

<style scoped>
/* Custom Styling */
</style>
