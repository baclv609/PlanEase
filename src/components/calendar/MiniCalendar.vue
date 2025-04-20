<template>
  <div class="mini-calendar">
    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'vue-router';
import { useCalendarStore } from '@/stores/calendarStore';
import { useSettingsStore } from '@/stores/settingsStore';
import axios from 'axios';

// Extend dayjs
dayjs.extend(timezone);
dayjs.extend(utc);

// Props và emits
const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['dateSelect', 'rangeSelect', 'viewChange', 'eventsLoaded']);

// Setup stores và refs
const router = useRouter();
const calendarStore = useCalendarStore();
const settingsStore = useSettingsStore();
const calendarRef = ref(null);

const selectedDate = ref(dayjs());
const startDate = ref(null);
const endDate = ref(null);
const isLoading = ref(false);
const selectedEvents = ref([]);
const isDateClick = ref(false);
const isRangeSelect = ref(false);

// API setup
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

// Transform events for FullCalendar format
const transformedEvents = computed(() => {
  return props.events.map(event => ({
    id: event.id,
    title: event.title || event.name,
    start: event.start_time,
    end: event.end_time,
    backgroundColor: event.color_code || event.color || '#1890ff',
    borderColor: event.color_code || event.color || '#1890ff',
    allDay: event.is_all_day === 1,
    extendedProps: {
      ...event
    }
  }));
});

// Handle date click
const handleDateClick = async (info) => {
  try {
    const clickedDate = dayjs(info.dateStr);
    if (!clickedDate.isValid()) return;
    
    selectedDate.value = clickedDate;

    // Luôn chuyển đến chế độ xem ngày khi click
    const params = {
      view: 'day', // Luôn set view là 'day'
      year: clickedDate.format('YYYY'),
      month: clickedDate.format('M'),
      day: clickedDate.format('D')
    };

    // Emit sự kiện trước khi chuyển route
    emit('dateSelect', {
      date: clickedDate,
      view: 'day'
    });

    // Cập nhật route
    await router.push({
      name: 'calendar-view',
      params
    });

  } catch (error) {
    console.error('Date click error:', error);
  }
};

// Handle range select
const handleRangeSelect = async (info) => {
  try {
    const start = dayjs(info.start).tz(settingsStore.timeZone || 'local');
    const end = dayjs(info.end).tz(settingsStore.timeZone || 'local').subtract(1, 'day');
    
    if (!start.isValid() || !end.isValid()) return;
    
    // Lấy current view từ settings store
    const currentView = settingsStore.displayMode;
    const viewMap = {
      'timeGridDay': 'day',
      'timeGridWeek': 'week',
      'dayGridMonth': 'month',
      'listYear': 'agenda',
      'timeGridThreeDay': 'schedule',
      'multiMonthYear': 'year'
    };

    const urlView = viewMap[currentView] || 'day';
    const daysDiff = end.diff(start, 'day') + 1;

    // Cập nhật router với view và ngày bắt đầu
    await router.push({
      name: 'calendar-view',
      params: {
        view: urlView,
        year: start.format('YYYY'),
        month: start.format('M'),
        day: start.format('D')
      },
      query: {
        duration: daysDiff // Nếu cần truyền số ngày, dùng query thay vì params
      }
    });

    emit('rangeSelect', {
      start,
      end,
      days: daysDiff,
      events: props.events.filter(event => {
        const eventDate = dayjs(event.start_time).tz(settingsStore.timeZone || 'local');
        return eventDate.isSameOrAfter(start, 'day') && eventDate.isSameOrBefore(end, 'day');
      })
    });

  } catch (error) {
    console.error('Range selection error:', error);
  }
};

// Calendar options
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev',
    center: 'title',
    right: 'next'
  },
  titleFormat: { year: 'numeric', month: 'long' },
  dayMaxEvents: false,
  height: 'auto',
  fixedWeekCount: false,
  showNonCurrentDates: true,
  events: transformedEvents.value,
  selectable: false, 
  dateClick: handleDateClick,
  eventDisplay: 'background',
  displayEventTime: false,
  firstDay: settingsStore.firstDay,
  locale: settingsStore.language,
  timeZone: settingsStore.timeZone || 'local',
  dayCellDidMount: (arg) => {
    const cellDate = dayjs(arg.date).tz(settingsStore.timeZone || 'local').startOf('day');
    const today = dayjs().tz(settingsStore.timeZone || 'local').startOf('day');
    
    // Highlight today
    if (today.isSame(cellDate, 'day')) {
      arg.el.classList.add('fc-day-today');
    }
    
    // Highlight selected date
    if (selectedDate.value && cellDate.isSame(selectedDate.value, 'day')) {
      arg.el.classList.add('fc-day-selected');
    }
  }
}));

// Fetch events for a specific date
// const fetchEventsForDate = async (date) => {
//   try {
//     isLoading.value = true;
//     const response = await axios.get(`${dirApi}events`, {
//       params: {
//         date: date.format('YYYY-MM-DD'),
//         calendar_ids: calendarStore.selectedCalendars
//       },
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     if (response.data.code === 200) {
//       selectedEvents.value = response.data.data;
//       emit('eventsLoaded', selectedEvents.value);
//     } else {
//       console.error('Error fetching events:', response.data.message);
//     }
//   } catch (error) {
//     console.error('Error fetching events:', error);
//   } finally {
//     isLoading.value = false;
//   }
// };

// Handle event click
const handleEventClick = async (info) => {
  try {
    const event = info.event;
    if (!event || !event.id) return;
    
    await router.push({
      name: 'calendar-event',
      params: { id: event.id }
    });
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

// Watch for changes in the main calendar's view
watch(() => settingsStore.displayMode, (newMode) => {
  if (!calendarRef.value) return;
  
  const calendar = calendarRef.value.getApi();
  
  // Map main calendar view to mini calendar view
  const viewMap = {
    'timeGridDay': 'dayGridMonth',
    'timeGridWeek': 'dayGridMonth',
    'dayGridMonth': 'dayGridMonth',
    'listYear': 'dayGridMonth',
    'timeGridThreeDay': 'dayGridMonth',
    'multiMonthYear': 'dayGridMonth'
  };

  const miniCalendarView = viewMap[newMode] || 'dayGridMonth';
  calendar.changeView(miniCalendarView);
});

// Watch for route changes to sync with main calendar
watch(() => router.currentRoute.value, (newRoute, oldRoute) => {
  if (!calendarRef.value) return;
  
  const calendar = calendarRef.value.getApi();
  
  if (newRoute.name === 'calendar-view') {
    const { year, month, day } = newRoute.params;
    
    if (year && month) {
      let date;
      if (day) {
        date = dayjs(`${year}-${month}-${day}`).tz(settingsStore.timeZone || 'local');
      } else {
        date = dayjs(`${year}-${month}-01`).tz(settingsStore.timeZone || 'local');
      }
      
      if (date.isValid()) {
        // Cập nhật selectedDate
        selectedDate.value = date;
        
        // Cập nhật view của calendar
        calendar.gotoDate(date.toDate());
        
        // Force render lại để cập nhật highlighting
        calendar.render();
      }
    }
  }
}, { immediate: true });

// Thêm watch cho selectedDate để cập nhật highlighting
watch(selectedDate, (newDate) => {
  if (!calendarRef.value || !newDate) return;
  
  const calendar = calendarRef.value.getApi();
  calendar.render(); // Force render lại để cập nhật highlighting
});

// Watch for changes in events
watch(() => props.events, () => {
  if (calendarRef.value) {
    calendarRef.value.getApi().refetchEvents();
  }
}, { deep: true });

onMounted(() => {
  // Initialize calendar with current date
  selectedDate.value = dayjs();
  
  // If there's a date in the route, use it
  const route = router.currentRoute.value;
  if (route.name === 'calendar-day') {
    const { year, month, day } = route.params;
    const date = dayjs(`${year}-${month}-${day}`);
    if (date.isValid()) {
      selectedDate.value = date;
      if (calendarRef.value) {
        calendarRef.value.getApi().gotoDate(date.toDate());
      }
    }
  }
});
</script>

<style scoped>
.mini-calendar {
  background: #16c4b3;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px;
  font-size: 0.9rem;
}

:deep(.fc) {
  font-family: inherit;
  --fc-small-font-size: 0.85em;
  border: none !important;
}

:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th),
:deep(.fc-theme-standard .fc-scrollgrid) {
  border: none !important;
}

:deep(.fc-scrollgrid-section-header),
:deep(.fc-scrollgrid-section-body) {
  border: none !important;
}

:deep(.fc-scrollgrid) {
  border: none !important;
}

:deep(.fc-toolbar-title) {
  color: #fefefe !important;
  font-size: 0.95rem !important;
  font-weight: 500;
}

:deep(.fc-button) {
  padding: 0.15rem 0.35rem !important;
  font-size: 0.75rem !important;
}

:deep(.fc-col-header) {
  font-size: 0.8rem;
  background-color: #16c4b3;
}

:deep(.fc-col-header-cell) {
  color: #595959 !important;
  font-weight: 500;
  background-color: #16c4b3;
}

:deep(.fc-col-header-cell-cushion) {
  padding: 4px 2px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff;
}

:deep(.fc-daygrid-day) {
  min-height: 35px !important;
  height: 35px !important;
  max-height: 35px !important;
  width: 35px !important;
  padding: 0 !important;
  aspect-ratio: 1 / 1;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 35px !important;
  height: 35px !important;
  max-height: 35px !important;
  width: 35px!important;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 !important;
}

:deep(.fc-daygrid-day-top) {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 !important;
}

:deep(.fc-daygrid-day-events) {
  margin: 0 !important;
  padding: 0 !important;
  position: absolute;
  bottom: 2px;
  width: 100%;
  display: flex;
  justify-content: center;
}

:deep(.fc-daygrid-day-number) {
  color: #ffffff !important;
  font-weight: 500;
}
:deep(.fc-daygrid-day:hover .fc-daygrid-day-number) {
  transition: all 0.2s ease;
  padding: 2px 6px;
}


:deep(.fc-event) {
  border-radius: 50%;
  width: 4px !important;
  height: 4px !important;
  margin: 1px !important;
  background-color: #1890ff !important;
  border-color: #1890ff !important;
}

:deep(.fc-more-link) {
  color: #1890ff !important;
  font-size: 0.7rem;
  padding: 0;
  margin: 0;
  position: absolute;
  bottom: 2px;
}

:deep(.fc-day-today) {
  background: #FFCC77 !important;
  border-radius: 50% !important;
}

:deep(.fc-day-selected) {
  background: rgba(255, 255, 255, 0.2) !important;
}

:deep(.fc-day) {
  cursor: pointer;
}

:deep(.fc-day:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.fc-highlight) {
  background: rgba(255, 204, 119, 0.3) !important;
}

:deep(.fc-selecting) {
  background: rgba(255, 204, 119, 0.4) !important;
}

:deep(.fc-header-toolbar) {
  margin-bottom: 0.4rem !important;
}

:deep(.fc-toolbar-chunk) {
  display: flex;
  align-items: center;
}

:deep(.fc-prev-button),
:deep(.fc-next-button) {
  background-color: transparent !important;
  border-color: transparent !important;
  color: #ffffff !important;
  border-radius: 50%;
  padding: 15px 10px;
  
  &:focus {
    box-shadow: none !important;
  }
}

:deep(.fc-loading) {
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

:deep(.fc-day-other .fc-daygrid-day-number) {
  color: rgba(0, 0, 0, 0.7);
}

:deep(.fc-day-disabled) {
  background-color: #fafafa;
}

:deep(.mini-calendar) {
  max-width: fit-content;
}

:deep(.fc) {
  width: auto !important;
}

:deep(.fc-view) {
  width: fit-content !important;
}
</style> 