<template>
  <a-card :bodyStyle="{ padding: '16px' }">
    <!-- Lịch -->
    <div class="calendar-section">
      <a-calendar v-model:value="selectedDate" :fullscreen="false" @select="handleDateSelect">
        <template #headerRender="{ value, onChange }">
          <div class="custom-header">
            <a-button type="text" @click="prevMonth(onChange, value)">
              <left-outlined />
            </a-button>

            <span class="header-title">
              {{ selectedDate.format("MMMM YYYY") }}
            </span>

            <a-button type="text" @click="nextMonth(onChange, value)">
              <right-outlined />
            </a-button>
          </div>
        </template>
      </a-calendar>
    </div>

    <!-- Get Things Done -->
    <div class="mt-5">
      <h4>Get Things Done</h4>
      <a-list :data-source="tasks" bordered>
        <template #renderItem="{ item }">
          <a-list-item> <a-badge :color="item.color" /> {{ item.name }} </a-list-item>
        </template>
      </a-list>
      <a-button type="primary" class="mt-4" block>+ Create New Event</a-button>
    </div>

    <!-- Upcoming Events -->
    <div class="mt-5">
      <h4>Upcoming Events</h4>
      <p>Don't Miss Scheduled Events</p>
      <a-list :data-source="events" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="w-full flex items-center justify-between">
              <a-badge color="blue" />
              <div class="event-details">
                <strong>{{ item.date }}</strong>
                <p>{{ item.name }}</p>
              </div>
              <a-tag color="blue">{{ item.time }}</a-tag>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </a-card>
</template>

<script setup>
import { LeftOutlined, RightOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const selectedDate = ref(dayjs());

const tasks = ref([
  { name: "New Event Planning", color: "green" },
  { name: "Meeting", color: "blue" },
  { name: "Generating Reports", color: "red" },
  { name: "Create New theme", color: "purple" },
]);

const events = ref([
  { date: "04 Jan 2022", name: "World Braille Day", time: "5 am - 9 am" },
  { date: "30 Jan 2022", name: "World Man Day", time: "5 am - 9 am" },
  { date: "04 Jan 2022", name: "World Plants Day", time: "5 am - 10 am" },
]);

const handleDateSelect = (date) => {
    const year = date.format("YYYY");
    const month = date.format("MM");
    const day = date.format("DD");

    console.log("Chuyển hướng tới:", `/calendar/day/${year}/${month}/${day}`);

    router.push(`/calendar/day/${year}/${month}/${day}`);
};


// Chuyển sang tháng trước
const prevMonth = (onChange, value) => {
  const newDate = value.subtract(1, "month");
  onChange(newDate);
  selectedDate.value = newDate;
};

// Chuyển sang tháng sau
const nextMonth = (onChange, value) => {
  const newDate = value.add(1, "month");
  onChange(newDate);
  selectedDate.value = newDate;
};
</script>

<style scoped>
.event-details {
  flex-grow: 1;
  margin-left: 10px;
}
.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  font-size: 16px;
  font-weight: bold;
}

.header-title {
  text-transform: capitalize;
}

a-button {
  font-size: 18px;
}
</style>
