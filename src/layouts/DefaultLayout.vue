<template>
  <a-layout class="min-h-screen bg-gray-100">
    <a-layout-header class="!bg-white shadow flex justify-between px-6 py-3">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold">Calendar App</h1>
      </div>

      <a-input-search :placeholder="$t('Search')" class="w-1/3" />

      <div class="flex items-center gap-4">
        <a-button type="primary" class="bg-yellow-500 text-white">
          <TrophyOutlined /> {{ $t('Update_plane') }}
        </a-button>

        <a-tooltip title="">
          <a-button shape="circle" @click="openSettingsModal">
            <SettingOutlined />
          </a-button>
        </a-tooltip>

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

    <a-layout>
      <a-layout-sider width="280" class="!bg-white p-4 shadow">
        <a-button type="primary" block class="mb-4">+ Create Event</a-button>

        <div class="mb-4">
          <h3 class="font-semibold mb-2">My Calendars</h3>
          <!-- <a-checkbox-group v-model:value="selectedCalendars" class="flex flex-col gap-2">
            <a-checkbox value="exercise">🏋️ Tập thể dục</a-checkbox>
            <a-checkbox value="dinner">🍽️ Ăn tối</a-checkbox>
            <a-checkbox value="outing">🚗 Đi chơi</a-checkbox>
          </a-checkbox-group> -->
        </div>
      </a-layout-sider>

      <a-layout-content class="p-6">
        <div class="bg-white p-4 shadow rounded-lg">
          <slot></slot>
        </div>
      </a-layout-content>
    </a-layout>

    <a-layout-footer class="text-center py-4 text-gray-500">
      © 2025 Calendar App. All Rights Reserved. | Terms of Use | Privacy Policy
    </a-layout-footer>

    <!-- Modal Settings -->
    <SettingsView v-model:isModalOpen="isModalOpen" />
  </a-layout>
</template>

<script setup>
import { ref } from "vue";
import {
  TrophyOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";

import SettingsView from '@/views/settings/SettingsView.vue';

const isModalOpen = ref(false);

const openSettingsModal = () => {
  isModalOpen.value = true;
};
</script>
