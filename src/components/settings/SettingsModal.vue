<template>
  <a-modal
    :open="isModalOpen"
    title="Cài đặt lịch trình"
    width="650px"
    @cancel="closeModal"
  >
    <a-tabs :activeKey="activeTab" @change="(key) => (activeTab = key)">
      <!-- Tab Giao diện -->
      <a-tab-pane key="display" tab="Giao diện">
        <a-form layout="vertical">
          <a-form-item label="Chế độ hiển thị">
            <a-select
              v-model:value="settings.displayMode"
              @change="changeView(settings.displayMode)"
            >
              <a-select-option value="dayGridMonth">Tháng</a-select-option>
              <a-select-option value="timeGridWeek">Tuần</a-select-option>
              <a-select-option value="timeGridDay">Ngày</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Hiển thị ngày nghỉ">
            <a-switch v-model:checked="settings.showWeekNumbers" />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- Tab Thời gian -->
      <a-tab-pane key="time" tab="Thời gian">
        <a-form layout="vertical">
          <a-form-item label="Múi giờ">
            <a-select
              v-model:value="settings.timeZone"
              show-search
              placeholder="Chọn múi giờ..."
              :options="timeZoneOptions"
              :filter-option="filterTimeZones"
              @change="logTimeZone"
            />
          </a-form-item>
          <a-form-item label="Định dạng giờ">
            <a-select v-model:value="settings.timeFormat" @change="updateTimeFormat">
              <a-select-option
                v-for="option in timeFormatOptions"
                :key="option.label"
                :value="JSON.stringify(option.value)"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- Tab Lịch -->
      <a-tab-pane key="calendar" tab="Lịch">
        <a-form layout="vertical">
          <a-form-item label="Định dạng tiêu đề lịch">
            <a-select v-model:value="selectedTitleFormat" @change="updateTitleFormat">
              <a-select-option
                v-for="option in titleFormatOptions"
                :key="option.label"
                :value="JSON.stringify(option.value)"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Ngày bắt đầu tuần">
            <a-select v-model:value="settings.firstDay">
              <a-select-option :value="0">Chủ Nhật</a-select-option>
              <a-select-option :value="1">Thứ Hai</a-select-option>
              <a-select-option :value="6">Thứ Bảy</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- Tab Ngôn ngữ -->
      <a-tab-pane key="language" :tab="$t('language')">
        <a-form layout="vertical">
          <a-form-item label="Ngôn ngữ">
            <a-select v-model:value="settings.language" @change="changeLanguage">
              <a-select-option value="vi">Tiếng Việt</a-select-option>
              <a-select-option value="en">English</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <!-- Footer với nút Reset -->
    <template #footer>
      <a-button type="primary" danger @click="resetSettings">Reset</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";

const { locale } = useI18n();

const props = defineProps({
  isModalOpen: Boolean,
});

const emit = defineEmits(["update:isModalOpen"]);

const settingsStore = useSettingsStore();
const settings = settingsStore.$state;

const activeTab = ref(settingsStore.activeKey || "display");

const columnHeaderFormatOptions = [
  { label: "Thứ viết tắt + Ngày (VD: T2, 24)", value: { weekday: "short", day: "numeric", omitCommas: true } },
  { label: "Thứ + Ngày (VD: Thứ Hai, 24)", value: { weekday: "long", day: "numeric" } },
  { label: "Ngày + Tháng (VD: 24 Thg 2)", value: { day: "numeric", month: "short" } },
];

const titleFormatOptions = [
  { label: "Tháng Năm (VD: Tháng 2 2025)", value: { year: "numeric", month: "long" } },
  { label: "Tháng viết tắt + Năm (VD: Feb 2025)", value: { year: "numeric", month: "short" } },
  { label: "Năm/Tháng số (VD: 2025/02)", value: { year: "numeric", month: "2-digit" } },
];

const timeFormatOptions = [
  { label: "12 giờ (AM/PM)", value: { hour: "2-digit", minute: "2-digit", meridiem: "short", hour12: true } },
  { label: "24 giờ", value: { hour: "2-digit", minute: "2-digit", hour12: false } },
];

const selectedTitleFormat = ref(JSON.stringify(settings.titleFormat));
const selectedDayHeaderFormat = ref(JSON.stringify(settings.dayHeaderFormat));

const updateTitleFormat = (newValue) => {
  settings.titleFormat = JSON.parse(newValue);
  updateFullCalendar();
};

const updateTimeFormat = (newValue) => {
  settingsStore.eventTimeFormat = newValue;
  updateFullCalendar();
};

const changeView = (newView) => {
  settingsStore.updateDisplayMode(newView);
  updateFullCalendar();
};

const updateFullCalendar = () => {
  settingsStore.updateFullCalendar();
};

const changeLanguage = (newLang) => {
  settingsStore.language = newLang;
  locale.value = newLang;
  settingsStore.saveToLocalStorage();
};

const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: i + 1 }))
);

const timeZoneOptions = computed(() =>
  moment.tz.names().map((tz) => {
    const offset = moment.tz(tz).utcOffset() / 60;
    const offsetText = offset >= 0 ? `GMT+${offset}` : `GMT${offset}`;
    return { label: `${tz} (${offsetText})`, value: tz };
  })
);

const filterTimeZones = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const logTimeZone = (value) => {
  console.log("🔍 Múi giờ được chọn:", value);
};

const closeModal = () => {
  emit("update:isModalOpen", false);
};

const resetSettings = () => {
  settingsStore.$reset();
  updateFullCalendar();
};
</script>
