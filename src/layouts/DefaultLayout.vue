<template>
  <a-layout class="bg-gray-100 min-h-screen">
    <a-layout-header class="flex justify-between shadow !bg-[#FEF9ED] items-center px-6 sticky top-0 z-50">
      <div class="flex gap-4 items-center">
        <!-- <a-button shape="circle" @click="toggleSidebar" class="border border-[#15C5B2] !bg-white hover:!bg-orange-50 transition-colors">
          <MenuOutlined class="text-orange-500" />
        </a-button> -->
        <h1 @click="router.push('/calendar')" class="text-lg font-semibold"><img class="w-20 cursor-pointer" src="@/assets/images/logo.png" alt=""></h1>
      </div>

      <Search />

      <div class="flex gap-4 items-center">
        <!-- Nút tạo mới khi sidebar đóng -->
        <a-dropdown v-if="isSidebarCollapsed" :trigger="['click']">
          <a-button
            shape="circle"
            class="bg-[#FECA7B] text-black border-none hover:!text-white transition-colors"
          >
            <PlusOutlined />
          </a-button>
          <template #overlay>
            <a-menu class="!bg-[#FECA7B]">
              <a-menu-item
                @click="createEvent"
                class="!text-white transition-colors hover:!bg-[#15C5B2]"
              >
                <CalendarOutlined class="mr-2" /> {{ $t("calendar.createEvent") }}
              </a-menu-item>
              <a-menu-item
                @click="createTask"
                class="!text-white transition-colors hover:!bg-[#15C5B2]"
              >
                <CheckSquareOutlined class="mr-2" /> {{ $t("calendar.createTask") }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <a-tooltip :title="$t('header.notifications')">
          <a-badge :count="unreadCount" :offset="[-3, 7]" :show-zero="false">
            <a-button shape="circle" @click="openNotificationModal" class="border border-[#15C5B2] !bg-white hover:!bg-orange-50 transition-colors">
              <BellOutlined class="text-orange-500" />
            </a-button>
          </a-badge>
        </a-tooltip>

        <!-- Trash -->
        <a-tooltip :title="$t('header.trash')">
          <a-button shape="circle" @click="router.push('/calendar/trash')" class="border border-[#15C5B2] !bg-white hover:!bg-orange-50 transition-colors">
            <DeleteOutlined class="text-orange-500" />
          </a-button>
        </a-tooltip>

        <a-tooltip :title="$t('header.settings')">
          <a-button shape="circle" @click="openSettingsModal" class="border border-[#15C5B2] !bg-white hover:!bg-orange-50 transition-colors">
            <SettingOutlined class="text-orange-500" />
          </a-button>
        </a-tooltip>

        <!-- Profile -->
        <div>
          <a-tooltip :title="$t('header.profile')">
            <a-button shape="circle" @click="openProfileDrawer" class="border border-[#15C5B2] !bg-white hover:!bg-orange-50 transition-colors">
              <UserOutlined class="text-orange-500" />
            </a-button>
          </a-tooltip>

          <!-- Drawer Profile -->
          <ProfileDrawer ref="profileDrawerRef" />
        </div>
      </div>
    </a-layout-header>

    <a-layout class="!bg-white">
      <a-layout-sider 
        v-model:collapsed="isSidebarCollapsed" 
        :trigger="null" 
        collapsible 
        width="310" 
        class="shadow !bg-white my-2 ml-1 rounded-lg"
        :collapsedWidth="0"
        
      >
      <!--  -->
        <div v-show="!isSidebarCollapsed">
          <EventSidebar />
        </div>

      </a-layout-sider>

      <a-layout-content class="p-2">
        <Notification 
          v-model:isNotificationOpen="isNotificationOpen" 
          :notifications="notifications" 
          />
        <div class="bg-white px-4 pb-4 pt-2 rounded-lg shadow">
          <slot></slot>
        </div>
      </a-layout-content>
    </a-layout>


    <SettingCalender v-model:isModalOpen="isModalOpen" />

    <EventModal
    :isAddEventModalVisible="isEventModalVisible"
      :event="selectedEvent"
      @save="handleEventModalSuccess"
      @cancel="isEventModalVisible = false"
    />
  </a-layout>
</template>

<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { TrophyOutlined, SettingOutlined, UserOutlined, BellOutlined, DeleteOutlined, MenuOutlined, PlusOutlined, CalendarOutlined, CheckSquareOutlined } from "@ant-design/icons-vue";
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from "dayjs";

import ProfileDrawer from "@/views/profile/ProfileDrawer.vue";
import SettingCalender from "@/components/settings/SettingsModal.vue";
import EventSidebar from "@/components/layout/EventSidebar.vue";
import Notification from "@/components/Notification.vue";
import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";
import Search from "@/components/Search.vue";
import { useEchoStore } from "@/stores/echoStore";
import EventModal from "@/views/calendar/components/EventModal.vue";


const dirApi = import.meta.env.VITE_API_BASE_URL;
const selectedCalendars = ref(["exercise", "dinner", "outing"]);
const isModalOpen = ref(false);
const isNotificationOpen = ref(false);
const echoStore = useEchoStore();
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("access_token");

const isSidebarCollapsed = ref(false);
const calendarRef = ref(null);

const openSettingsModal = () => {
  isModalOpen.value = true;
};

const openNotificationModal = () => {
  if(isNotificationOpen.value == true) {
    isNotificationOpen.value = false;
  } else {
    isNotificationOpen.value = true;
  }
};

const fetchNotification = async () => {
  const response = await axios.get(`${dirApi}notifications`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  try {
    if(response.data.code == 200) {
      notifications.value = response.data.data.notifications;
      // console.log('notification: ',notifications.value);
    }
  } catch (error) {
    console.log(error);
  }
}

// Danh sách thông báo
const notifications = ref([]);


onMounted(() => {    
    echoStore.echo.private(`App.Models.User.${user.id}`)
      .listen(".notification", (notification) => {      
        notifications.value.unshift(notification);
      });

    fetchNotification();

    console.log("📡 Lắng nghe realtime trong DefaultLayout");
});

// Số lượng thông báo chưa đọc
const unreadCount = ref(notifications.value.filter(n => !n.read).length);

watch(notifications, (newNotifications) => {
  unreadCount.value = newNotifications.filter(n => !n.read_at).length;
}, { deep: true });

// Mở drawer khi click avatar
const profileDrawerRef = ref(null);

const openProfileDrawer = () => {
  profileDrawerRef.value?.openDrawer();
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  
  // Force calendar to resize and refresh
  setTimeout(() => {
    if (calendarRef.value) {
      const calendar = calendarRef.value.getApi();
      calendar.render();
      calendar.updateSize();
    }
  }, 300); // Wait for sidebar animation to complete
};

const isEventModalVisible = ref(false);
const selectedEvent = ref(null);

const createEvent = () => {
  const now = dayjs();
  const endTime = now.add(1, 'hour');
  
  selectedEvent.value = {
    type: 'event',
    start: now,
    end: endTime
  };
  isEventModalVisible.value = true;
};

const createTask = () => {
  const now = dayjs();
  const endTime = now.add(1, 'hour');
  
  selectedEvent.value = {
    type: 'task',
    start: now,
    end: endTime
  };
  isEventModalVisible.value = true;
};

const handleEventModalSuccess = () => {
  isEventModalVisible.value = false;
  selectedEvent.value = null;
};

const onBreakpoint = (broken) => {
  if (broken) {
    isSidebarCollapsed.value = true;
  }
};

</script>

<style scoped>
.ant-layout-sider {
  transition: all 0.3s ease;
}

.ant-layout-sider-collapsed {
  transition: all 0.3s ease;
}

.ant-layout-sider-zero-width {
  transition: all 0.3s ease;
}

:deep(.fc) {
  width: 100% !important;
  max-width: 100% !important;
}

:deep(.fc-view) {
  width: 100% !important;
  max-width: 100% !important;
}

:deep(.fc-scroller) {
  /* overflow: hidden !important; */
}
</style>
