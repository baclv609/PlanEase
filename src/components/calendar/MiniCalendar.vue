<template>
  <div class="mini-calendar">
    <div class="calendar-toolbar">
      <a-space>
        <a-button
          type="primary"
          :loading="syncing"
          @click="handleSync"
          size="small"
        >
          <template #icon><SyncOutlined /></template>
          Đồng bộ
        </a-button>
      </a-space>
    </div>
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
import { useRouter } from 'vue-router';
import { useCalendarStore } from '@/stores/calendarStore';
import { useSettingsStore } from '@/stores/settingsStore';
import axios from 'axios';
import { SyncOutlined } from '@ant-design/icons-vue';
import syncService from '@/services/syncService';
import { message } from 'ant-design-vue';

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['dateSelect', 'rangeSelect', 'viewChange', 'eventsLoaded']);

const router = useRouter();
const calendarStore = useCalendarStore();
const settingsStore = useSettingsStore();
const calendarRef = ref(null);

const selectedDate = ref(dayjs());
const startDate = ref(null);
const endDate = ref(null);
const isLoading = ref(false);
const selectedEvents = ref([]);

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

const syncing = ref(false);

// Add debounce function at the top of script
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

// Add flag to track click source
const isDateClick = ref(false);

// Add flag to track selection type
const isRangeSelect = ref(false);

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

// Calendar options
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev',
    center: 'title',
    right: 'next'
  },
  dayMaxEvents: 2,
  height: 'auto',
  events: transformedEvents.value,
  selectable: true, // Enable range selection
  select: handleRangeSelect,
  dateClick: handleDateClick,
  eventClick: handleEventClick,
  eventDisplay: 'dot',
  displayEventTime: false,
  firstDay: settingsStore.firstDay,
  locale: settingsStore.language,
  buttonText: {
    today: 'Hôm nay'
  },
  dayHeaderFormat: { weekday: 'short' },
  moreLinkContent: (args) => {
    return `+${args.num} sự kiện`;
  }
}));

// Fetch events for a specific date
const fetchEventsForDate = async (date) => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${dirApi}events`, {
      params: {
        date: date.format('YYYY-MM-DD'),
        calendar_ids: calendarStore.selectedCalendars
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.code === 200) {
      selectedEvents.value = response.data.data;
      emit('eventsLoaded', selectedEvents.value);
    } else {
      console.error('Error fetching events:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    isLoading.value = false;
  }
};

// Handle date click with debounce
const handleDateClick = debounce(async (info) => {
  try {
    const date = dayjs(info.dateStr);
    if (!date.isValid()) return;
    
    isDateClick.value = true;
    
    // Check if we're already on this date
    const currentRoute = router.currentRoute.value;
    if (currentRoute.name === 'calendar-day') {
      const { year, month, day } = currentRoute.params;
      const currentDateStr = `${year}-${month}-${day}`;
      if (currentDateStr === date.format('YYYY-MM-DD')) {
        isDateClick.value = false;
        return; // Already on this date, no need to update
      }
    }
    
    // Update router with the selected date
    const year = date.format('YYYY');
    const month = date.format('MM');
    const day = date.format('DD');
    
    // First update the router - use query for source
    await router.push({
      name: 'calendar-day',
      params: { year, month, day },
      query: { source: 'dateClick' }
    });
    
    // Then emit date selection event
    emit('dateSelect', {
      date,
      events: props.events.filter(event => 
        dayjs(event.start_time).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
      )
    });
    
    // Reset flag after navigation
    setTimeout(() => {
      isDateClick.value = false;
    }, 100);
  } catch (error) {
    console.error('Navigation error:', error);
    isDateClick.value = false;
  }
}, 100);

// Handle range selection
const handleRangeSelect = debounce(async (info) => {
  try {
    const start = dayjs(info.start);
    const end = dayjs(info.end).subtract(1, 'day'); // Adjust end date
    
    if (!start.isValid() || !end.isValid()) return;
    
    // Set flag to prevent duplicate calls
    isRangeSelect.value = true;
    
    // Check if we're already on this range
    const currentRoute = router.currentRoute.value;
    if (currentRoute.name === 'calendar-range') {
      const { range } = currentRoute.params;
      if (range) {
        const [currentStart] = range.split('/');
        if (currentStart === start.format('YYYY-MM-DD')) {
          isRangeSelect.value = false;
          return;
        }
      }
    }
    
    // Update router with the selected range - use query for source
    await router.push({
      name: 'calendar-range',
      params: { range: `${start.format('YYYY-MM-DD')}/${end.format('YYYY-MM-DD')}` },
      query: { source: 'rangeSelect' }
    });
    
    // Emit range selection event
    emit('rangeSelect', {
      start,
      end,
      events: props.events.filter(event => {
        const eventDate = dayjs(event.start_time);
        return eventDate.isAfter(start, 'day') && eventDate.isBefore(end, 'day');
      })
    });
    
    // Reset flag after navigation
    setTimeout(() => {
      isRangeSelect.value = false;
    }, 100);
  } catch (error) {
    console.error('Navigation error:', error);
    isRangeSelect.value = false;
  }
}, 100);

// Update route watcher to handle both date and range selection
watch(() => router.currentRoute.value, (newRoute, oldRoute) => {
  if (!calendarRef.value) return;
  
  // Skip if this is from a date or range click - check query instead of params
  if (isDateClick.value || isRangeSelect.value || 
      (newRoute.query.source === 'dateClick' || newRoute.query.source === 'rangeSelect')) {
    return;
  }
  
  // Prevent handling if it's the same route
  if (oldRoute && newRoute.fullPath === oldRoute.fullPath) return;
  
  const calendar = calendarRef.value.getApi();
  
  try {
    if (newRoute.name === 'calendar-day') {
      const { year, month, day } = newRoute.params;
      if (year && month && day) {
        const date = dayjs(`${year}-${month}-${day}`);
        if (date.isValid()) {
          calendar.gotoDate(date.toDate());
          selectedDate.value = date;
          
          // Only emit if route change wasn't triggered by date click
          emit('viewChange', {
            mode: 'day',
            date: date,
            events: props.events.filter(event => 
              dayjs(event.start_time).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
            )
          });
        }
      }
    } else if (newRoute.name === 'calendar-range') {
      const { range } = newRoute.params;
      if (range) {
        const [start, end] = range.split('/');
        const startDate = dayjs(start);
        const endDate = dayjs(end);
        
        if (startDate.isValid() && endDate.isValid()) {
          calendar.gotoDate(startDate.toDate());
          
          // Emit view change event without API call
          emit('viewChange', {
            mode: 'range',
            start: startDate,
            end: endDate,
            events: props.events.filter(event => {
              const eventDate = dayjs(event.start_time);
              return eventDate.isAfter(startDate, 'day') && eventDate.isBefore(endDate, 'day');
            })
          });
        }
      }
    }
  } catch (error) {
    console.error('Error handling route change:', error);
  }
}, { immediate: false });

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
  if (calendarRef.value) {
    calendarRef.value.getApi().changeView('dayGridMonth');
  }
});

// Watch for changes in events
watch(() => props.events, () => {
  if (calendarRef.value) {
    calendarRef.value.getApi().refetchEvents();
  }
}, { deep: true });

// Thêm hàm đồng bộ
const handleSync = async () => {
  if (syncing.value) return;
  
  // Kiểm tra đăng nhập Google
  if (!localStorage.getItem('google_token')) {
    message.warning('Vui lòng đăng nhập với Google để đồng bộ lịch');
    return;
  }
  
  syncing.value = true;
  try {
    await syncService.performSync();
    message.success('Đồng bộ thành công');
    // Sau khi đồng bộ xong, cập nhật lại calendar
    await fetchEventsForDate(selectedDate.value);
  } catch (error) {
    console.error('Error syncing:', error);
    if (error.message.includes('Chưa đăng nhập với Google')) {
      message.error('Vui lòng đăng nhập lại với Google để tiếp tục');
    } else {
      message.error('Không thể đồng bộ. Vui lòng thử lại sau.');
    }
  } finally {
    syncing.value = false;
  }
};

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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px;
  font-size: 0.9rem;
}

:deep(.fc) {
  font-family: inherit;
  --fc-small-font-size: 0.85em;
}

:deep(.fc-toolbar-title) {
  font-size: 0.95rem !important;
  font-weight: 500;
}

:deep(.fc-button) {
  padding: 0.15rem 0.35rem !important;
  font-size: 0.75rem !important;
}

:deep(.fc-col-header) {
  font-size: 0.8rem;
}

:deep(.fc-col-header-cell) {
  padding: 4px 0 !important;
  text-transform: capitalize;
}

:deep(.fc-col-header-cell-cushion) {
  padding: 4px 2px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.fc-daygrid-day) {
  min-height: 36px !important;
  height: 36px !important;
  max-height: 36px !important;
  width: 36px !important;
  padding: 0 !important;
  aspect-ratio: 1 / 1;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 36px !important;
  height: 36px !important;
  max-height: 36px !important;
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
  font-size: 0.8rem;
  margin: 0;
  padding: 0 !important;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.fc-event) {
  border-radius: 50%;
  width: 4px !important;
  height: 4px !important;
  margin: 1px !important;
}

:deep(.fc-more-link) {
  font-size: 0.7rem;
  padding: 0;
  margin: 0;
  position: absolute;
  bottom: 2px;
}

:deep(.fc-day-today) {
  background-color: #e6f7ff !important;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  color: #1890ff;
  font-weight: 600;
}

:deep(.fc-highlight) {
  background-color: rgba(24, 144, 255, 0.1) !important;
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
  color: #595959 !important;
  
  &:hover {
    background-color: #f0f0f0 !important;
  }
  
  &:focus {
    box-shadow: none !important;
  }
}

:deep(.fc-loading) {
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

:deep(.fc-day-other) {
  .fc-daygrid-day-number {
    opacity: 0.5;
  }
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

.calendar-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
</style> 