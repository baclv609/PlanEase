<script setup>
import { ref, onMounted, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import { useRouter } from "vue-router";
import { format } from "date-fns";
import dayjs from "dayjs";

// Import antd-vue components
import { Button, Segmented, Tooltip } from "ant-design-vue";
import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";

// Import store & composables
import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendar } from "@/composables/useCalendar.js";

// Import modals
import EventModal from "./components/EventModal.vue";
import EventDetailModal from "./components/EventDetailsModal.vue";

onMounted(() => {
  console.log("window.Echo:", window.Echo);
  console.log("window.Pusher:", window.Pusher);

  const user = JSON.parse(localStorage.getItem("user")); // Kiểm tra dữ liệu user
  if (!user || !user.id) {
    console.error("❌ Không tìm thấy user.id");
    return;
  }

  console.log(`🔄 Đang lắng nghe kênh: App.Models.User.${user.id}`);

  window.Echo.private(`App.Models.User.${user.id}`)
    .listen(".task.reminder", (data) => {
      console.log("📢 Nhận thông báo mới:", data);
      alert("Bạn có một nhắc nhở mới!");
    })
    .error((err) => {
      console.error("❌ Lỗi khi đăng ký kênh private:", err);
    });

  setTimeout(() => {
    console.log("📡 Trạng thái kết nối Pusher:", window.Echo.connector.pusher.connection.state);
  }, 5000);
});

const settingsStore = useSettingsStore();
const calendarRef = ref(null);

const currentView = ref(settingsStore.displayMode);

//  Đồng bộ `currentView` với `settingsStore`
watch(() => settingsStore.displayMode, (newView) => {
  if (calendarRef.value) {
    calendarRef.value.getApi().changeView(newView);
  }
  currentView.value = newView;
});

// Sử dụng composable để quản lý lịch
const {
  calendarKey,
  calendarOptions,
  selectedEvent,
  selectedEventAdd,
  isAddEventModalVisible,
  isEventDetailModalVisible,
  handleDeleteEvent,
  handleEventModalSuccess,
} = useCalendar(calendarRef);

onMounted(() => {
  if (calendarRef.value) {
    settingsStore.setCalendarRef(calendarRef.value); // Lưu vào store
    updateCurrentDate();
    calendarRef.value.getApi().changeView(currentView.value);
  } else {
    console.error("calendarRef is not available in onMounted");
  }
});

const onDatesSet = (info) => {
  settingsStore.updateDisplayMode(info.view.type); // Cập nhật store và localStorage
};
// Lấy tháng/năm hiện tại từ FullCalendar
const currentDate = ref("");
const updateCurrentDate = () => {
  if (calendarRef.value) {
    currentDate.value = new Date(calendarRef.value.getApi().getDate()).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  }
};

// Điều hướng lịch
const goToPrev = () => {
  calendarRef.value.getApi().prev();
  updateCurrentDate();
};

const goToNext = () => {
  calendarRef.value.getApi().next();
  updateCurrentDate();
};

const goToToday = () => {
  calendarRef.value.getApi().today();
  updateCurrentDate();
};

const changeView = (view) => {
  currentView.value = view;
  settingsStore.updateDisplayMode(view); // Cập nhật store
};


onMounted(() => {
  if (calendarRef.value) {
    settingsStore.setCalendarRef(calendarRef.value);
    updateCurrentDate();
    calendarRef.value.getApi().changeView(settingsStore.displayMode); // Cập nhật từ store
  }
});
</script>

<template>
  <div>
    <!-- Custom Header -->
    <div class="custom-header">
      <div class="flex  items-center">
        <span class="header-title mr-3 capitalize">{{ currentDate }}</span>

        <div class="header-controls">
          
          <Button @click="goToPrev" type="text">
            <left-outlined />
          </Button>
          <Button @click="goToNext" type="text">
            <RightOutlined />
          </Button>
          <Button @click="goToToday" type="default">
            <template #icon>
              <CalendarOutlined />
            </template>
            Today
          </Button>
        </div>
      </div>

      <div class="view-toggle">
        <Segmented v-model:value="currentView" :options="[
          { label: 'Ngày', value: 'timeGridDay' },
          { label: 'Tháng', value: 'timeGridWeek' },
          { label: 'Năm', value: 'dayGridMonth' },
        ]" @change="changeView" />
      </div>
    </div>

    <!-- FullCalendar -->
    <FullCalendar ref="calendarRef" :key="calendarKey" :options="calendarOptions" @datesSet="onDatesSet" />

    <!-- Modal thêm sự kiện -->
    <EventModal :visible="isAddEventModalVisible" :event="selectedEventAdd" @save="handleEventModalSuccess"
      @cancel="isAddEventModalVisible = false" />

    <!-- Modal chi tiết sự kiện -->
    <EventDetailModal :visible="isEventDetailModalVisible" :event="selectedEvent"
      @close="isEventDetailModalVisible = false" @delete="handleDeleteEvent" />
  </div>
</template>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  background: #fff;
  /* border-radius: 8px; */
   /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icons {
  display: flex;
  gap: 12px;
  font-size: 18px;
  color: #888;
}

.view-toggle {
  display: flex;
}
</style>
