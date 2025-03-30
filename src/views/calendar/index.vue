<script setup>
import { ref, onMounted, watch, computed } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import { useRouter, useRoute } from "vue-router";
import { format } from "date-fns";
import dayjs from "dayjs";
import 'dayjs/locale/vi';

// Import antd-vue components
import { Button, Segmented, Tooltip, Skeleton } from "ant-design-vue";
import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
   UnorderedListOutlined,
   FieldTimeOutlined,
   ClockCircleOutlined,
   PlusOutlined
} from "@ant-design/icons-vue";

// Import store & composables
import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendar } from "@/composables/useCalendarSetup.js";
import { useCalendarDrop } from '@/composables/useCalendarDrop';
import ScheduleEditView from "../schedule/ScheduleEditView.vue";

// Import modals
import EventModal from "./components/EventModal.vue";
import EventDetailModal from "./components/EventDetailsModal.vue";
import ChatBot from "@/components/ChatBot.vue";

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
  isCalendarLoading,
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

// Add route watcher
const router = useRouter();
const route = useRoute();

// Add debounce function
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

// Add flag to track programmatic updates
const isUpdatingProgrammatically = ref(false);

// Watch for route changes with debounce
watch(() => route.path, debounce((newPath) => {
  if (!calendarRef.value || isUpdatingProgrammatically.value) return;
  
  try {
    const calendar = calendarRef.value.getApi();
    let shouldUpdateDate = false;
    
    if (newPath.startsWith('/calendar/day/')) {
      const { year, month, day } = route.params;
      const date = dayjs(`${year}-${month}-${day}`);
      if (date.isValid()) {
        // First change the view
        if (currentView.value !== 'timeGridDay') {
          settingsStore.updateDisplayMode('timeGridDay');
          currentView.value = 'timeGridDay';
        }
        // Then update the date
        calendar.gotoDate(date.toDate());
        shouldUpdateDate = true;
      }
    } else if (newPath.startsWith('/calendar/range/')) {
      const { range } = route.params;
      if (range) {
        const [start, end] = range.split('/');
        const startDate = dayjs(start);
        if (startDate.isValid()) {
          // First change the view
          if (currentView.value !== 'timeGridWeek') {
            settingsStore.updateDisplayMode('timeGridWeek');
            currentView.value = 'timeGridWeek';
          }
          // Then update the date
          calendar.gotoDate(startDate.toDate());
          shouldUpdateDate = true;
        }
      }
    } else if (newPath === '/calendar') {
      if (currentView.value !== 'dayGridMonth') {
        settingsStore.updateDisplayMode('dayGridMonth');
        currentView.value = 'dayGridMonth';
      }
      // Go to initial date if set
      if (settingsStore.initialDate) {
        const date = dayjs(settingsStore.initialDate);
        if (date.isValid()) {
          calendar.gotoDate(date.toDate());
          shouldUpdateDate = true;
        }
      }
    }
    
    // Only update current date if needed
    if (shouldUpdateDate) {
      updateCurrentDate();
    }
  } catch (error) {
    console.error('Error handling route change:', error);
  }
}, 100), { immediate: true });

// Update onDatesSet to handle URL changes with debounce
const onDatesSet = debounce((info) => {
  if (!info || !info.view || isUpdatingProgrammatically.value) return;
  
  try {
    const viewType = info.view.type;
    if (currentView.value !== viewType) {
      settingsStore.updateDisplayMode(viewType);
      currentView.value = viewType;
    }
    
    // Update current date display
    updateCurrentDate(info.view.currentStart);
    
    // Update URL based on current view
    const currentDate = info.view.currentStart;
    if (!currentDate) return;
    
    const date = dayjs(currentDate);
    if (!date.isValid()) return;
    
    // Prevent unnecessary route updates
    if (viewType === 'timeGridDay' && route.name === 'calendar-day') {
      const { year, month, day } = route.params;
      const currentDateStr = date.format('YYYY-MM-DD');
      if (`${year}-${month}-${day}` === currentDateStr) return;
    }
    
    // Set flag before updating route
    isUpdatingProgrammatically.value = true;
    
    if (viewType === 'timeGridDay') {
      router.push({
        name: 'calendar-day',
        params: {
          year: date.format('YYYY'),
          month: date.format('MM'),
          day: date.format('DD')
        }
      }).finally(() => {
        isUpdatingProgrammatically.value = false;
      });
    } else if (viewType === 'timeGridWeek') {
      const start = date.format('YYYY-MM-DD');
      const end = date.add(6, 'day').format('YYYY-MM-DD');
      router.push({
        name: 'calendar-range',
        params: {
          range: `${start}/${end}`
        }
      }).finally(() => {
        isUpdatingProgrammatically.value = false;
      });
    } else {
      router.push({ name: 'calendar' }).finally(() => {
        isUpdatingProgrammatically.value = false;
      });
    }
  } catch (error) {
    console.error('Error in onDatesSet:', error);
    isUpdatingProgrammatically.value = false;
  }
}, 100);

// Lấy tháng/năm hiện tại từ FullCalendar
const currentDate = ref("");

// Thiết lập locale cho dayjs (thêm vào đầu file sau phần import)
dayjs.locale('vi');

const updateCurrentDate = (date) => {
  if (!calendarRef.value) return;
  
  const calendar = calendarRef.value.getApi();
  let dateToFormat;
  
  if (date) {
    dateToFormat = date;
  } else {
    dateToFormat = calendar.getDate();
  }
  
  const viewType = calendar.view.type;
  
  // Cập nhật locale theo ngôn ngữ từ settings
  dayjs.locale(settingsStore.language);
  
  if (viewType === 'timeGridDay') {
    if (settingsStore.language === 'vi') {
      currentDate.value = dayjs(dateToFormat).format('DD [tháng] M[,] YYYY');
    } else {
      currentDate.value = dayjs(dateToFormat).format('MMMM D, YYYY');
    }
  } else if (viewType === 'timeGridWeek') {
    const weekStart = dayjs(dateToFormat).startOf('week');
    const weekEnd = dayjs(dateToFormat).endOf('week');
    
    if (settingsStore.language === 'vi') {
      currentDate.value = `${weekStart.format('DD')} - ${weekEnd.format('DD')} tháng ${weekStart.format('M[,] YYYY')}`;
    } else {
      currentDate.value = `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D, YYYY')}`;
    }
  } else {
    if (settingsStore.language === 'vi') {
      currentDate.value = `Tháng ${dayjs(dateToFormat).format('M[,] YYYY')}`;
    } else {
      currentDate.value = dayjs(dateToFormat).format('MMMM YYYY');
    }
  }
};

// Thêm watcher cho language
watch(() => settingsStore.language, (newLanguage) => {
  if (calendarRef.value) {
    // Cập nhật locale cho calendar
    const calendar = calendarRef.value.getApi();
    calendar.setOption('locale', newLanguage);
    
    // Cập nhật hiển thị ngày tháng
    updateCurrentDate();
  }
});

// Cập nhật template cho nút Today
const getTodayLabel = computed(() => {
  return settingsStore.language === 'vi' ? 'Hôm nay' : 'Today';
});

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
  if (!calendarRef.value) return;
  const calendar = calendarRef.value.getApi();
  calendar.prev();
  updateCurrentDate();
};

const goToNext = () => {
  if (!calendarRef.value) return;
  const calendar = calendarRef.value.getApi();
  calendar.next();
  updateCurrentDate();
};

const goToToday = () => {
  if (!calendarRef.value) return;
  const calendar = calendarRef.value.getApi();
  calendar.today();
  updateCurrentDate();
};

const changeView = (view) => {
  if (!calendarRef.value) return;
  
  const calendar = calendarRef.value.getApi();
  const currentCalendarDate = calendar.getDate();
  
  // Cập nhật view trong store và local state
  currentView.value = view;
  settingsStore.updateDisplayMode(view);
  
  // Cập nhật hiển thị ngày tháng theo chế độ xem mới
  const date = dayjs(currentCalendarDate);
  if (view === 'timeGridDay') {
    // Nếu chuyển sang xem ngày, cập nhật URL và currentDate
    router.push({
      name: 'calendar-day',
      params: {
        year: date.format('YYYY'),
        month: date.format('MM'),
        day: date.format('DD')
      }
    });
  } else if (view === 'timeGridWeek') {
    // Nếu chuyển sang xem tuần, cập nhật URL và currentDate
    const start = date.format('YYYY-MM-DD');
    const end = date.add(6, 'day').format('YYYY-MM-DD');
    router.push({
      name: 'calendar-range',
      params: {
        range: `${start}/${end}`
      }
    });
  } else {
    // Nếu chuyển sang xem tháng
    router.push({ name: 'calendar' });
  }
  
  // Cập nhật hiển thị ngày tháng
  updateCurrentDate(date);
};


onMounted(() => {
  if (calendarRef.value) {
    const calendar = calendarRef.value.getApi();
    settingsStore.setCalendarRef(calendarRef.value);
    
    // Set initial view based on route
    const path = route.path;
    if (path.startsWith('/calendar/day/')) {
      const { year, month, day } = route.params;
      const date = dayjs(`${year}-${month}-${day}`);
      if (date.isValid()) {
        settingsStore.updateDisplayMode('timeGridDay');
        currentView.value = 'timeGridDay';
        calendar.gotoDate(date.toDate());
      }
    } else if (path.startsWith('/calendar/range/')) {
      const { range } = route.params;
      if (range) {
        const [start] = range.split('/');
        const startDate = dayjs(start);
        if (startDate.isValid()) {
          settingsStore.updateDisplayMode('timeGridWeek');
          currentView.value = 'timeGridWeek';
          calendar.gotoDate(startDate.toDate());
        }
      }
    }
    
    updateCurrentDate();
  }
});
</script>

<template>
  <div class="calendar-wrapper">

    <!-- Custom Header -->
    <div class="custom-header">
      <div class="flex items-center">
        <span class="header-title mr-3 capitalize">{{ currentDate }}</span>

        <div class="header-controls">
          
          <Button @click="goToPrev" type="text" class="px-3 border border-1 border-[#15C5B2] rounded-full hover:!bg-[#FEF9ED]">
            <left-outlined />
          </Button>
          <Button @click="goToNext" type="text" class="px-3 border border-1 border-[#15C5B2] rounded-full hover:!bg-[#FEF9ED]">
            <RightOutlined />
          </Button>
          <Button @click="goToToday" type="default" class="border border-1 font-semibold text-gray-500 hover:!bg-[#FEF9ED] hover:!text-gray-500 border-[#15C5B2] rounded-full hover:!border-[#15C5B2]">
            <template #icon>
              <CalendarOutlined />
            </template>
            {{ getTodayLabel }}
          </Button>
        </div>
      </div>

      <div class="view-toggle">
        <a-select v-model:value="currentView" @change="changeView" style="width: 150px" class="custom-select !border-[#15C5B2] !rounded-md !focus:ring-2 !focus:ring-[#15C5B2]">
          <a-select-option value="timeGridDay">Ngày</a-select-option>
          <a-select-option value="timeGridWeek">Tuần</a-select-option>
          <a-select-option value="dayGridMonth">Tháng</a-select-option>
          <a-select-option value="multiMonthYear">Năm</a-select-option>
          <a-select-option value="listYear">Danh sách</a-select-option>
        </a-select>

      </div>
    </div>

    <a-skeleton :loading="isCalendarLoading" active>
      <template #default>
        <FullCalendar 
          ref="calendarRef" 
          :key="calendarKey" 
          :options="calendarOptions"  
          @datesSet="onDatesSet"
          class="bg-[#FEF9ED]"
        />
      </template>
    </a-skeleton>
    
    <!-- Modal thêm sự kiện -->
    <EventModal :open="isAddEventModalVisible" :event="selectedEventAdd" @save="handleEventModalSuccess"
      @cancel="isAddEventModalVisible = false" 
      :isAddEventModalVisible="isAddEventModalVisible"/>

    <!-- Modal chi tiết sự kiện -->
    <EventDetailModal :open="isEventDetailModalVisible" :event="selectedEvent"  @editTask="openEditDrawer"
      @close="isEventDetailModalVisible = false" @delete="handleDeleteEvent" />

      <ScheduleEditView :open="isEditDrawerVisible" :event="selectedEventToEdit"  
       @update:visible="isEditDrawerVisible = $event" 
       @cancel="isEditDrawerVisible = false" 
       @calendar-updated="handleCalendarUpdate"/>

    <ChatBot />

  </div>
</template>

<style scoped>
.calendar-wrapper {
  width: 100%;
  min-height: 600px;
  padding: 16px;
  border-radius: 8px;
}

/* Tùy chỉnh style cho skeleton */
:deep(.ant-skeleton) {
  width: 100%;
  height: 100%;
}

:deep(.ant-skeleton-content) {
  padding: 16px;
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  background: #fff;
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

:deep(.fc .fc-daygrid-day-number) {
  width: 100% !important;
  text-align: center !important;
  color: black !important;
  font-weight: 600 !important;
}

:deep(.fc .fc-daygrid-day-top) {
  display: flex !important;
  justify-content: center !important;
}

:deep(.fc-col-header-cell-cushion) {
  color: black !important;
}

:deep(.custom-select .ant-select-selector) {
  border: 1px solid #15C5B2 !important;
  border-radius: 20px;
  padding: 0px 20px;
}

:deep(.custom-select:hover .ant-select-selector) {
  background-color: #FEF9EF !important;
}
</style>
