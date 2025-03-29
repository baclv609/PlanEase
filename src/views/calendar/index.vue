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
    
    // Handle different view types
    if (newPath.startsWith('/calendar/')) {
      const { view, date } = route.params;
      
      if (view && date) {
        // Map view types to FullCalendar view types
        const viewMap = {
          'day': 'timeGridDay',
          'week': 'timeGridWeek',
          'month': 'dayGridMonth',
          'agenda': 'listWeek',
          'schedule': 'timeGridThreeDay',
          'year': 'multiMonthYear'
        };

        const fullCalendarView = viewMap[view];
        if (fullCalendarView) {
          // Update settings store
          settingsStore.updateDisplayMode(fullCalendarView);
          currentView.value = fullCalendarView;
          
          // Parse and set date
          const parsedDate = dayjs(date);
          if (parsedDate.isValid()) {
            calendar.gotoDate(parsedDate.toDate());
            shouldUpdateDate = true;
          }
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
    const currentDate = info.view.currentStart;
    
    if (!currentDate) return;
    
    // Map FullCalendar view types to URL view types
    const viewMap = {
      'timeGridDay': 'day',
      'timeGridWeek': 'week',
      'dayGridMonth': 'month',
      'listWeek': 'agenda',
      'timeGridThreeDay': 'schedule',
      'multiMonthYear': 'year'
    };

    const urlView = viewMap[viewType];
    if (!urlView) return;

    // Format date based on view type
    const date = dayjs(currentDate);
    let formattedDate;
    
    switch (urlView) {
      case 'day':
        formattedDate = date.format('YYYY-MM-DD');
        break;
      case 'week':
        // For week view, use the start of the week based on firstDay setting
        const weekStart = date.startOf('week');
        formattedDate = weekStart.format('YYYY-MM-DD');
        break;
      case 'month':
        formattedDate = date.format('YYYY-MM');
        break;
      case 'year':
        formattedDate = date.format('YYYY');
        break;
      default:
        formattedDate = date.format('YYYY-MM-DD');
    }

    // Set flag before updating route
    isUpdatingProgrammatically.value = true;
    
    // Update URL
    router.push({
      name: 'calendar-view',
      params: {
        view: urlView,
        date: formattedDate
      }
    }).finally(() => {
      isUpdatingProgrammatically.value = false;
    });

    // Update settings store
    settingsStore.updateDisplayMode(viewType);
    currentView.value = viewType;
    
    // Update current date display
    updateCurrentDate(currentDate);
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
  updateURL();
};

const goToNext = () => {
  if (!calendarRef.value) return;
  const calendar = calendarRef.value.getApi();
  calendar.next();
  updateCurrentDate();
  updateURL();
};

const goToToday = () => {
  if (!calendarRef.value) return;
  const calendar = calendarRef.value.getApi();
  calendar.today();
  updateCurrentDate();
  updateURL();
};

const changeView = (view) => {
  if (!calendarRef.value) return;
  
  const calendar = calendarRef.value.getApi();
  const currentCalendarDate = calendar.getDate();
  
  // Map FullCalendar view types to URL view types
  const viewMap = {
    'timeGridDay': 'day',
    'timeGridWeek': 'week',
    'dayGridMonth': 'month',
    'listWeek': 'agenda',
    'timeGridThreeDay': 'schedule',
    'multiMonthYear': 'year',
    'listYear': 'agenda' // Map listYear to agenda view
  };

  const urlView = viewMap[view];
  if (!urlView) return;

  // Format date based on view type
  const date = dayjs(currentCalendarDate);
  let formattedDate;
  
  switch (urlView) {
    case 'day':
      formattedDate = date.format('YYYY-MM-DD');
      break;
    case 'week':
      formattedDate = date.startOf('week').format('YYYY-MM-DD');
      break;
    case 'month':
      formattedDate = date.format('YYYY-MM');
      break;
    case 'year':
      formattedDate = date.format('YYYY');
      break;
    default:
      formattedDate = date.format('YYYY-MM-DD');
  }

  // Update settings store
  settingsStore.updateDisplayMode(view);
  currentView.value = view;

  // Update URL
  router.push({
    name: 'calendar-view',
    params: {
      view: urlView,
      date: formattedDate
    }
  });

  // Update current date display
  updateCurrentDate(date);
};

// Add watcher for settingsStore.displayMode
watch(() => settingsStore.displayMode, (newView) => {
  if (!calendarRef.value || isUpdatingProgrammatically.value) return;
  
  try {
    const calendar = calendarRef.value.getApi();
    const currentDate = calendar.getDate();
    
    // Map FullCalendar view types to URL view types
    const viewMap = {
      'timeGridDay': 'day',
      'timeGridWeek': 'week',
      'dayGridMonth': 'month',
      'listWeek': 'agenda',
      'timeGridThreeDay': 'schedule',
      'multiMonthYear': 'year',
      'listYear': 'agenda' // Map listYear to agenda view
    };

    const urlView = viewMap[newView];
    if (!urlView) return;

    // Format date based on view type
    const date = dayjs(currentDate);
    let formattedDate;
    
    switch (urlView) {
      case 'day':
        formattedDate = date.format('YYYY-MM-DD');
        break;
      case 'week':
        formattedDate = date.format('YYYY-MM-DD');
        break;
      case 'month':
        formattedDate = date.format('YYYY-MM');
        break;
      case 'year':
        formattedDate = date.format('YYYY');
        break;
      default:
        formattedDate = date.format('YYYY-MM-DD');
    }

    // Set flag before updating route
    isUpdatingProgrammatically.value = true;
    
    // Update URL
    router.push({
      name: 'calendar-view',
      params: {
        view: urlView,
        date: formattedDate
      }
    }).finally(() => {
      isUpdatingProgrammatically.value = false;
    });

    // Update current view
    currentView.value = newView;
    
    // Update current date display
    updateCurrentDate(currentDate);
  } catch (error) {
    console.error('Error handling settings change:', error);
    isUpdatingProgrammatically.value = false;
  }
}, { immediate: true });

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

// Add new function to update URL based on current view and date
const updateURL = () => {
  if (!calendarRef.value) return;
  
  const calendar = calendarRef.value.getApi();
  const currentDate = calendar.getDate();
  const viewType = calendar.view.type;
  
  // Map FullCalendar view types to URL view types
  const viewMap = {
    'timeGridDay': 'day',
    'timeGridWeek': 'week',
    'dayGridMonth': 'month',
    'listWeek': 'agenda',
    'timeGridThreeDay': 'schedule',
    'multiMonthYear': 'year',
    'listYear': 'agenda' // Map listYear to agenda view
  };

  const urlView = viewMap[viewType];
  if (!urlView) return;

  // Format date based on view type
  const date = dayjs(currentDate);
  let formattedDate;
  
  switch (urlView) {
    case 'day':
      formattedDate = date.format('YYYY-MM-DD');
      break;
    case 'week':
      formattedDate = date.startOf('week').format('YYYY-MM-DD');
      break;
    case 'month':
      formattedDate = date.format('YYYY-MM');
      break;
    case 'year':
      formattedDate = date.format('YYYY');
      break;
    default:
      formattedDate = date.format('YYYY-MM-DD');
  }

  // Update URL
  router.push({
    name: 'calendar-view',
    params: {
      view: urlView,
      date: formattedDate
    }
  });
};
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
