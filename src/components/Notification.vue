<template>
  <div v-if="isNotificationOpen"
    class="fixed inset-[75px] right-[120px] flex items-start justify-end bg-opacity-50 z-[1050] transition">
    <div class="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md">
      <!-- Header -->
      <div class="flex items-center border-b-1 px-4 py-1 justify-between pb-0 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-0">Thông báo</h2>
        <div class="flex">
          <a-dropdown :trigger="['click']">
            <a class="ant-dropdown-link bg-transparent cursor-pointer border-none p-2 rounded-full hover:bg-gray-200 transition" @click.prevent>
              <MoreOutlined class="text-gray-500 text-lg hover:text-gray-700" />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="readAll">
                  <a>Đánh dấu tất cả đã đọc</a>
                </a-menu-item>
                <a-menu-item @click="filterNotifications('all')">
                  <a>Hiển thị tất cả thông báo</a>
                </a-menu-item>
                <a-menu-item  @click="filterNotifications('unread')">
                  <a>Hiển thị thông báo chưa đọc</a>
                </a-menu-item>
                <a-menu-item @click="filterNotifications('read')">
                  <a>Hiển thị thông báo đã đọc</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <button @click="closeModal" class="bg-transparent cursor-pointer border-none p-2 rounded-full hover:bg-gray-200 transition">
            <CloseOutlined class="text-gray-500 text-lg hover:text-gray-700" />
          </button>
        </div>
      </div>

      <!-- Nội dung thông báo -->
      <div class="p-4 space-y-1 max-h-96 overflow-y-auto">

        <div v-if="filterNotificationData && filterNotificationData.length > 0" v-for="notification in filterNotificationData" :key="notification.id" @click="read(notification)" class="flex cursor-pointer items-start gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            <span class="text-gray-900 text-xl">{{ icons[notification.data.code] || icons.default }}</span>
          <div>
            <span v-if="notification.read_at == null" class="relative flex size-2 ml-[310px] -mt-1">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex size-2 rounded-full bg-red-500"></span>
            </span>
            <a v-if="notification.data.link" @click="read(notification)" :href="notification.data.link" class="text-gray-900 block" :class="notification.read_at == null ? ' font-medium' : 'font-normal' ">{{ notification.data.message }}</a>
            <p v-else class="text-gray-900 block mb-0" :class="notification.read_at == null ? 'font-medium' : 'font-normal' ">{{ notification.data.message }}</p>
            <span class="text-xs text-gray-500">{{ dayjs.utc(notification.created_at).tz(userTimezone.timeZone).fromNow() }}</span>
          </div>
        </div>
        <div v-else class="text-center">
          <img :src="emptyNotification" alt="">
          <span class="text-gray-800 flex my-2 font-semibold justify-center">Không có thông báo nào</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps, watch, ref } from 'vue';
import { CloseOutlined, MoreOutlined } from '@ant-design/icons-vue';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from 'axios';
import emptyNotification from "@/assets/images/empty-notification.png"

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const props = defineProps({
  isNotificationOpen: Boolean,
  notifications: Array // Danh sách thông báo từ cha truyền vào
});

const emit = defineEmits(['update:isNotificationOpen', 'updateUnreadCount']);
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const filterType = ref("all");
const filterNotificationData = ref([...props.notifications]);

const icons = ref({
  accept_invite: "👨‍👨‍👧‍👦",
  refuse_invite: "🙅‍♀️",
  invite_to_task: "🥳",
  updated_task: "📅",
  default: "📢",
});

const userTimezone = JSON.parse(localStorage.getItem("userSettings"));

// Đếm số thông báo chưa đọc
const unreadCount = computed(() => {
  return props.notifications.filter(n => !n.read_at).length;
});

const filterNotifications = (type) => {
  filterType.value = type;
};

watch([filterType, () => props.notifications], ([newFilter, newNotifications]) => {
  if (!newNotifications) {
    filterNotificationData.value = [];
    return;
  }

  if (newFilter === "all") {
    filterNotificationData.value = newNotifications;
  } else if (newFilter === "unread") {
    filterNotificationData.value = newNotifications.filter(n => !n.read_at);
  } else if (newFilter === "read") {
    filterNotificationData.value = newNotifications.filter(n => n.read_at);
  }
}, { immediate: true, deep: true });

const read = async (notification) => {
  if(notification.read_at == null) {
    const response = await axios.post(`${dirApi}notifications/${notification.id}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      const index = props.notifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        props.notifications[index].read_at = true;
      }
    }
  }

}

const readAll = async () => {
  const res = await axios.post(`${dirApi}notifications/read-all`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  try {
    props.notifications.forEach(n => n.read_at = true); // Cập nhật trạng thái đọc
    emit('updateUnreadCount', 0); // Gửi lên cha số lượng chưa đọc = 0
  } catch (error) {
    console.log("Loi xay ra", error);
  }
}

// Gửi số lượng thông báo chưa đọc lên component cha khi có thay đổi
watch(unreadCount, (newCount) => {
  emit('updateUnreadCount', newCount);
});

// Đóng modal
const closeModal = () => {
  emit('update:isNotificationOpen', false);
};
</script>

<style scoped></style>