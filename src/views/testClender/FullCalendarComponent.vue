<template>
  <div>
    <a-select v-model:value="selectedTimezone" @change="handleTimezoneChange" style="width: 200px; margin-bottom: 20px;">
      <a-select-option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</a-select-option>
    </a-select>
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Select } from 'ant-design-vue';
import { DateTime } from 'luxon';
import luxonPlugin from '@fullcalendar/luxon3';

const selectedTimezone = ref('UTC');
const calendarRef = ref(null);

const timezones = [
  'UTC', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Asia/Ho_Chi_Minh'
];

// Dữ liệu gốc của sự kiện (lưu dưới dạng UTC để dễ xử lý)
const eventsData = [
    {
        "id": 1,
        "uuid": null,
        "user_id": 1,
        "tag_id": 1,
        "color_code": "#FF0000",
        "timezone_code": "Asia/Ho_Chi_Minh",
        "title": "Complete the project report.",
        "description": "This task involves completing the project report by the end of the week.",
        "start_time": "2025-02-28T17:16:08.000000Z",
        "end_time": "2025-02-28T18:16:08.000000Z",
        "is_reminder": 1,
        "reminder": [
            {
                "type": "email",
                "set_time": 5
            }
        ],
        "is_done": 0,
        "attendees": [
            {
                "user_id": 2,
                "first_name": "User1",
                "last_name": "bajsjbvjd",
                "email": "user1@gmail.com",
                "avatar": "path/to/avatar.jpg",
                "status": "yes",
                "role": "editor"
            },
            {
                "user_id": 3,
                "first_name": "User2",
                "last_name": "Example",
                "email": "user2@gmail.com",
                "avatar": "path/to/avatar.jpg",
                "status": "yes",
                "role": "viewer"
            }
        ],
        "location": "Office",
        "type": "task",
        "is_all_day": 0,
        "is_repeat": 1,
        "is_busy": 0,
        "path": null,
        "exclude_time": [
            "2025-02-22T00:00:00.000000Z",
            "2025-02-24T00:00:00.000000Z",
            "2025-03-01T00:00:00.000000Z"
        ],
        "parent_id": null,
        "deleted_at": null,
        "created_at": null,
        "updated_at": null,
        "rrule": {
            "freq": "daily",
            "interval": 1,
            "until": "2025-05-28T16:16:08.000000Z",
            "count": 30,
            "byweekday": null,
            "bymonthday": null,
            "bymonth": null,
            "bysetpos": null
        }
    },
    {
        "id": 2,
        "uuid": null,
        "user_id": 2,
        "tag_id": 2,
        "color_code": "#FF0000",
        "timezone_code": "Asia/Ho_Chi_Minh",
        "title": "Complete the project report.",
        "description": "This task involves completing the project report by the end of the week.",
        "start_time": "2025-02-28T18:16:08.000000Z",
        "end_time": "2025-02-28T19:16:08.000000Z",
        "is_reminder": 1,
        "reminder": [
            {
                "type": "email",
                "set_time": 5
            },
            {
                "type": "web",
                "set_time": 15
            }
        ],
        "is_done": 0,
        "attendees": [
            {
                "user_id": 3,
                "first_name": "User2",
                "last_name": "Example",
                "email": "user2@gmail.com",
                "avatar": "path/to/avatar.jpg",
                "status": "yes",
                "role": "editor"
            },
            {
                "user_id": 4,
                "first_name": "User3",
                "last_name": "Example",
                "email": "user3@gmail.com",
                "avatar": "path/to/avatar.jpg",
                "status": "yes",
                "role": "viewer"
            },
            {
                "user_id": 5,
                "first_name": "User4",
                "last_name": "Example",
                "email": "user4@gmail.com",
                "avatar": "path/to/avatar.jpg",
                "status": "yes",
                "role": "viewer"
            }
        ],
        "location": "Office",
        "type": "task",
        "is_all_day": 0,
        "is_repeat": 1,
        "is_busy": 0,
        "path": null,
        "exclude_time": [
            "2025-02-23T00:00:00.000000Z",
            "2025-04-04T01:16:54.000000Z",
            "2025-04-04T01:17:16.000000Z",
            "2025-03-17T18:16:08.000000Z"
        ],
        "parent_id": null,
        "deleted_at": null,
        "created_at": null,
        "updated_at": "2025-03-01T07:35:22.000000Z",
        "rrule": {
            "freq": null,
            "interval": 1,
            "until": "2025-03-21T01:17:25.000000Z",
            "count": 30,
            "byweekday": [
                "mo",
                "fr"
            ],
            "bymonthday": null,
            "bymonth": null,
            "bysetpos": null
        }
    }
];

// Chuyển đổi sự kiện sang múi giờ đã chọn
const convertedEvents = computed(() => {
  return eventsData.map(event => {
    return {
      ...event,
      start: DateTime.fromISO(event.start_time, { zone: 'utc' })
        .setZone(selectedTimezone.value)
        .toISO(),
      end: DateTime.fromISO(event.end_time, { zone: 'utc' })
        .setZone(selectedTimezone.value)
        .toISO()
    };
  });
});

watch(selectedTimezone, (newTimezone) => {
  if (calendarRef.value) {
    const calendarApi = calendarRef.value.getApi();
    calendarApi.setOption('timeZone', newTimezone);
    calendarApi.refetchEvents(); // Cập nhật lại lịch
  }
});

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, luxonPlugin],
  initialView: 'timeGridWeek',
  timeZone: selectedTimezone.value,
  editable: true,
  events: convertedEvents.value
}));
</script>
