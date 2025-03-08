<template>
  <a-layout class="min-h-screen bg-gray-100">
    <a-layout-header class="!bg-white shadow flex justify-between items-center px-6">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold">Calendar App</h1>
      </div>

      <Search />

      <div class="flex items-center gap-4">
        <a-button type="primary" class="bg-yellow-500 text-white">
          <TrophyOutlined /> {{ $t("Update_plane") }}
        </a-button>

        <a-tooltip title="">
          <a-button shape="circle" @click="openSettingsModal">
            <SettingOutlined />
          </a-button>
        </a-tooltip>

        <!-- Profile -->
        <div>
          <a-avatar :size="40" class="cursor-pointer" @click="openProfileDrawer">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>

          <!-- Drawer Profile -->
          <ProfileDrawer ref="profileDrawerRef" />
        </div>
      </div>
    </a-layout-header>

    <a-layout>
      <a-layout-sider width="330" class="!bg-white my-5 ml-5 shadow">
        <!-- <a-button type="primary" block class="mb-4">{{ $t('+ Create Event') }}</a-button> -->

        <EventSidebar />
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

    <SettingCalender v-model:isModalOpen="isModalOpen" />
  </a-layout>
</template>

<script setup>
import { ref } from "vue";
import { TrophyOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons-vue";

import ProfileDrawer from "@/views/profile/ProfileDrawer.vue";
import SettingCalender from "@/components/settings/SettingsModal.vue";
import EventSidebar from "@/components/layout/EventSidebar.vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";
import Search from "@/components/Search.vue";

const dirApi = import.meta.env.VITE_API_BASE_URL;
const selectedCalendars = ref(["exercise", "dinner", "outing"]);
const isModalOpen = ref(false);


const openSettingsModal = () => {
  isModalOpen.value = true;
};

// Mở drawer khi click avatar
const profileDrawerRef = ref(null);

const openProfileDrawer = () => {
  profileDrawerRef.value?.openDrawer();
};


</script>
