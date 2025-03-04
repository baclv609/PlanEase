<template>
  <a-card :bodyStyle="{ padding: '16px' }">
    <!-- Lịch -->
    <a-button type="primary" class="my-2" block>+ Create New Event</a-button>

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

    <!-- Sự kiện sắp tới -->
    <div class="mt-5">
      <h2>Sự kiện sắp tới</h2>
      <p>Đừng bỏ lỡ các sự kiện đã lên lịch</p>
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

    <!-- tags -->
    <div>
      <div class="flex justify-between items-center cursor-pointer" @click="toggleMyCalendars">
        <h3 class="font-semibold">Lịch của tôi

          
        </h3> 
        <div>
          <PlusOutlined class="cursor-pointer text-blue-500 text-base" @click.stop="addCalendar" />
          <CaretDownOutlined v-if="showMyCalendars" />
          <CaretRightOutlined v-else />
        </div>
      </div>
      <transition name="fade">
        <div v-if="showMyCalendars" class="mt-2">
          <a-checkbox-group v-model:value="selectedCalendars" class="flex flex-col gap-2">
            <div v-for="calendar in myCalendars" :key="calendar.id" 
              class="flex items-center p-1 rounded-md"
              :style="{ borderLeft: `4px solid ${calendar.color}` }"
            >
              <a-checkbox :value="calendar.id" class="ml-2">
                <span class="text-sm">{{ calendar.name }}</span>
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </transition>
    </div>

  </a-card>
</template>

<script setup>
import { LeftOutlined, RightOutlined ,CaretDownOutlined, CaretRightOutlined, PlusOutlined} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { ref } from "vue";
import { useRouter } from "vue-router";


const router = useRouter();

const selectedDate = ref(dayjs());

const showMyCalendars = ref(true);
const showOtherCalendars = ref(true);

const toggleMyCalendars = () => (showMyCalendars.value = !showMyCalendars.value);
const toggleOtherCalendars = () => (showOtherCalendars.value = !showOtherCalendars.value);

// Danh sách lịch
const selectedCalendars = ref(["1", "3"]);
const myCalendars = ref([
  { id: "1", name: "Văn Bắc Lê", color: "#3498db" },
  { id: "2", name: "Gia đình", color: "#9b59b6" },
  { id: "3", name: "Lịch mới", color: "#9b59b6" },
  { id: "4", name: "Sinh nhật", color: "#e67e22" },
]);

const otherCalendars = ref([
  { id: "7", name: "Ngày lễ ở Việt Nam", color: "#27ae60" },
]);

const addCalendar = () => {
  console.log("Thêm lịch mới...");
};

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
.small-calendar {
  max-width: 250px !important;
  font-size: 14px;
}

.small-calendar .ant-picker-calendar-mini {
  padding: 8px;
}

.custom-header {
  font-size: 14px;
}

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

.sidebar-container {
  width: 280px;
}
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
