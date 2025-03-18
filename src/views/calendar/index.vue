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
import { useCalendar } from "@/composables/useCalendarSetup.js";
import { useCalendarDrop } from '@/composables/useCalendarDrop';
import ScheduleEditView from "../schedule/ScheduleEditView.vue";

// Import modals
import EventModal from "./components/EventModal.vue";
import EventDetailModal from "./components/EventDetailsModal.vue";

import { useEchoStore } from "@/stores/echoStore";

const settingsStore = useSettingsStore();
const calendarRef = ref(null);

const fullCalendarRef = ref(null);

const currentView = ref(settingsStore.displayMode);
const isEditDrawerVisible = ref(false);
const selectedEventToEdit = ref(null); 
const echoStore = useEchoStore();
const user = JSON.parse(localStorage.getItem("user"));

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

onMounted(() => {    
    echoStore.echo.private(`App.Models.User.${user.id}`)
      .listen(".task.listUpdated", (event) => {      
        console.log("Lịch trình được thay đổi");
        handleEventModalSuccess();
      });

    console.log("📡 Lắng nghe realtime trong CalendarView.vue");
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
const openEditDrawer = (event) => {
  selectedEventToEdit.value = event;
  console.log("selectedEventToEdit.value:", selectedEventToEdit.value);
  isEditDrawerVisible.value = true;

  // đóng modal details
  isEventDetailModalVisible.value = false;
  // console.log("isEditDrawerVisible", isEditDrawerVisible.value);
};

const handleCalendarUpdate = (updatedEvent) => {
  try {
    if (!calendarRef.value) {
      console.error('Calendar reference is not available');
      return;
    }

    const calendar = calendarRef.value.getApi();
    
    // Tìm và cập nhật sự kiện trong calendar
    const existingEvent = calendar.getEventById(updatedEvent.id);
    if (existingEvent) {
      // Cập nhật thông tin sự kiện
      existingEvent.setProp('title', updatedEvent.title);
      existingEvent.setStart(updatedEvent.start);
      existingEvent.setEnd(updatedEvent.end);
      existingEvent.setProp('color', updatedEvent.color);
      existingEvent.setAllDay(updatedEvent.is_all_day);
      
      // Cập nhật extendedProps
      existingEvent.setExtendedProp('type', updatedEvent.type);
      existingEvent.setExtendedProp('location', updatedEvent.location);
      existingEvent.setExtendedProp('description', updatedEvent.description);
      existingEvent.setExtendedProp('is_reminder', updatedEvent.is_reminder);
      existingEvent.setExtendedProp('reminder', updatedEvent.reminder);
      existingEvent.setExtendedProp('is_repeat', updatedEvent.is_repeat);
      existingEvent.setExtendedProp('recurrence', updatedEvent.recurrence);
      
      // Cập nhật các thuộc tính RRULE nếu là sự kiện lặp lại
      if (updatedEvent.is_repeat) {
        Object.keys(updatedEvent.info.extendedProps).forEach(key => {
          existingEvent.setExtendedProp(key, updatedEvent.info.extendedProps[key]);
        });
      }
    }
    
    // Refresh view để đảm bảo hiển thị đúng
    calendar.refetchEvents();
    
    // Gọi handleEventModalSuccess để cập nhật lại dữ liệu trong useCalendarSetup
    handleEventModalSuccess();
  } catch (error) {
    console.error('Error updating calendar event:', error);
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
          { label: 'Tuần', value: 'timeGridWeek' },
          { label: 'Tháng', value: 'dayGridMonth' },
        ]" @change="changeView" />
      </div>
    </div>

    <!-- FullCalendar -->
    <FullCalendar ref="calendarRef" :key="calendarKey" :options="calendarOptions" @datesSet="onDatesSet" />

    <!-- Modal thêm sự kiện -->
    <EventModal :open="isAddEventModalVisible" :event="selectedEventAdd" @save="handleEventModalSuccess"
      @cancel="isAddEventModalVisible = false" />

    <!-- Modal chi tiết sự kiện -->
    <EventDetailModal :open="isEventDetailModalVisible" :event="selectedEvent"  @editTask="openEditDrawer"
      @close="isEventDetailModalVisible = false" @delete="handleDeleteEvent" />

      <ScheduleEditView :open="isEditDrawerVisible" :event="selectedEventToEdit"  
       @update:visible="isEditDrawerVisible = $event" 
       @cancel="isEditDrawerVisible = false" 
       @calendar-updated="handleCalendarUpdate"/>

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
