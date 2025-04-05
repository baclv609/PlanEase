<template>
  <div v-if="isNotificationOpen" @click.self="closeModal"
    class="fixed inset-0 flex items-start justify-end z-[1050] transition-opacity duration-200">
    <div class="mt-[75px] mr-[80px] bg-white rounded-lg shadow-2xl border border-[#17C3B2]/20 w-full max-w-md transform transition-transform duration-200 ease-out">
      <!-- Header -->
      <div class="flex items-center px-5 py-3 justify-between border-b border-[#17C3B2]/20">
        <h2 class="text-lg font-semibold text-[#227C9D]">Thông báo</h2>
        <div class="flex items-center gap-1">
          <a-dropdown :trigger="['click']">
            <a class="ant-dropdown-link bg-transparent cursor-pointer border-none p-2 rounded-full hover:bg-[#17C3B2]/10 transition-colors" @click.prevent>
              <MoreOutlined class="text-[#227C9D] text-lg hover:text-[#17C3B2]" />
            </a>
            <template #overlay>
              <a-menu class="shadow-lg rounded-md">
                <a-menu-item @click="readAll">
                  <a class="text-[#227C9D] hover:text-[#17C3B2]">Đánh dấu tất cả đã đọc</a>
                </a-menu-item>
                <a-menu-item @click="filterNotifications('all')">
                  <a class="text-[#227C9D] hover:text-[#17C3B2]">Hiển thị tất cả thông báo</a>
                </a-menu-item>
                <a-menu-item  @click="filterNotifications('unread')">
                  <a class="text-[#227C9D] hover:text-[#17C3B2]">Hiển thị thông báo chưa đọc</a>
                </a-menu-item>
                <a-menu-item @click="filterNotifications('read')">
                  <a class="text-[#227C9D] hover:text-[#17C3B2]">Hiển thị thông báo đã đọc</a>
                </a-menu-item>
                <a-menu-item @click="deleteAllNotification">
                  <a class="text-[#227C9D] hover:text-[#17C3B2]">Xóa tất cả thông báo</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <button @click="closeModal" class="bg-transparent cursor-pointer border-none p-2 rounded-full hover:bg-[#17C3B2]/10 transition-colors">
            <CloseOutlined class="text-[#227C9D] text-lg hover:text-[#17C3B2]" />
          </button>
        </div>
      </div>

      <!-- Nội dung thông báo -->
      <div class="p-4 space-y-2 max-h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar">
        <div v-if="filterNotificationData && filterNotificationData.length > 0" v-for="notification in filterNotificationData" :key="notification.id" 
          class="flex cursor-pointer items-start gap-3 p-3 rounded-lg hover:bg-[#17C3B2]/5 transition-colors duration-200 group"
          :class="notification.read_at == null ? 'bg-[#17C3B2]/10' : 'bg-[#FEF9E7]'">
          <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#FFC377]/20">
            <span class="text-xl">{{ icons[notification.data.code] || icons.default }}</span>
          </div>
          <div class="flex-grow min-w-0" @click="read(notification)">
            <div class="flex items-start justify-between gap-2">
              <p class="text-[#227C9D] mb-0" 
                :class="notification.read_at == null ? 'font-medium' : 'font-normal'"
                >
                {{ notification.data.message }}
              </p>
              <div class="flex items-center gap-2">
                <a-dropdown :trigger="['click']" class="opacity-0 group-hover:opacity-100 transition-opacity">
                  <a class="ant-dropdown-link bg-transparent cursor-pointer border-none p-1 rounded-full hover:bg-[#17C3B2]/10 transition-colors" @click.prevent>
                    <MoreOutlined class="text-[#227C9D] text-lg hover:text-[#17C3B2]" />
                  </a>
                  <template #overlay>
                    <a-menu class="shadow-lg rounded-md">
                      <a-menu-item v-if="notification.read_at == null" @click="read(notification)">
                        <a class="text-[#227C9D] hover:text-[#17C3B2]">Đánh dấu là đã đọc</a>
                      </a-menu-item>
                      <a-menu-item @click="deleteNotification(notification)" v-if="filterNotificationData.length > 0">
                        <a class="text-[#227C9D] hover:text-[#17C3B2]">Xóa thông báo</a>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
                <span v-if="notification.read_at == null" class="flex-shrink-0">
                  <span class="relative flex h-2 w-2">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FE6D73] opacity-75"></span>
                    <span class="relative inline-flex h-2 w-2 rounded-full bg-[#FE6D73]"></span>
                  </span>
                </span>
              </div>
            </div>
            <span class="text-xs text-[#227C9D]/70 mt-1 block">
              {{ dayjs.utc(notification.created_at).tz(userTimezone.timeZone).fromNow() }}
            </span>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <img :src="emptyNotification" alt="No notifications" class="mx-auto w-32 h-32 object-contain opacity-75">
          <span class="text-[#227C9D] block mt-4 font-medium">Không có thông báo nào</span>
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

      if(notification.data.link != '') {
        window.location.href = notification.data.link;
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

const deleteNotification = async (notification) => {
  try {
    const response = await axios.delete(`${dirApi}notifications/${notification.id}/delete-one`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      const index = props.notifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        props.notifications.splice(index, 1);
      }
    }
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
  }
}

const deleteAllNotification = async () => {
  const res = await axios.delete(`${dirApi}notifications/delete-all`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 200) {
    props.notifications.length = 0;
  }
}

// Đóng modal
const closeModal = () => {
  emit('update:isNotificationOpen', false);
};
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #17C3B2 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #17C3B2;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #227C9D;
}
</style>