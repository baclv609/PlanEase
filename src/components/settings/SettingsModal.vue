<template>
  <a-modal
    :open="isModalOpen"
    title="Cài đặt lịch trình"
    width="650px"
    @ok="handleSave"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="flex" style="min-height: 450px">
      <!-- Tabs Menu - Left Side -->
      <a-tabs v-model:activeKey="activeTabKey" tab-position="left" style="width: 100%">
        <!-- Giao diện Tab -->
        <a-tab-pane key="display" tab="Giao diện">
          <div class="tab-content">
            <h3>Giao diện</h3>
            <a-form layout="vertical">
              <a-form-item label="Chế độ hiển thị">
                <a-select v-model:value="tempSettings.displayMode" @change="changeView">
                  <a-select-option value="multiMonthYear">Năm (Lưới)</a-select-option>
                  <a-select-option value="listYear">Ngày (Danh sách)</a-select-option>
                  <a-select-option value="dayGridMonth">Tháng</a-select-option>
                  <a-select-option value="timeGridWeek">Tuần</a-select-option>
                  <a-select-option value="timeGridDay">Ngày</a-select-option>
                </a-select>
              </a-form-item>

              <!-- Tùy chọn hiển thị cho chế độ xem năm dạng lưới -->
              <template v-if="tempSettings.displayMode === 'multiMonthYear'">
                <a-form-item label="Số cột hiển thị">
                  <a-select
                    v-model:value="tempSettings.multiMonthMaxColumns"
                    @change="updateMultiMonthSettings"
                  >
                    <a-select-option :value="2">2 cột</a-select-option>
                    <a-select-option :value="3">3 cột</a-select-option>
                    <a-select-option :value="4">4 cột</a-select-option>
                  </a-select>
                </a-form-item>

                <a-form-item label="Hiển thị ngày ngoài tháng">
                  <a-switch
                    v-model:checked="tempSettings.showNonCurrentDates"
                    @change="updateMultiMonthSettings"
                  />
                </a-form-item>
              </template>

              <a-form-item label="Hiển thị ngày nghỉ">
                <a-switch v-model:checked="tempSettings.showWeekNumbers" />
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- Thời gian Tab -->
        <a-tab-pane key="time" tab="Thời gian">
          <div class="tab-content">
            <h3>Thời gian</h3>
            <a-form layout="vertical">
              <a-form-item label="Múi giờ">
                <a-select
                  v-model:value="tempSettings.timeZone"
                  show-search
                  placeholder="Chọn múi giờ..."
                  :options="timeZoneOptions"
                  :filter-option="filterTimeZones"
                  @change="logTimeZone"
                />
              </a-form-item>

              <a-form-item label="Định dạng giờ">
                <a-select v-model:value="selectedTimeFormat" @change="updateTimeFormat">
                  <a-select-option
                    v-for="option in timeFormatOptions"
                    :key="option.label"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- Lịch Tab -->
        <a-tab-pane key="calendar" tab="Lịch">
          <div class="tab-content">
            <h3>Lịch</h3>
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

              <a-form-item label="Định dạng ngày trong cột">
                <a-select
                  v-model:value="selectedDayHeaderFormat"
                  @change="updateColumnHeaderFormat"
                >
                  <a-select-option
                    v-for="option in columnHeaderFormatOptions"
                    :key="option.label"
                    :value="JSON.stringify(option.value)"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="Ngày bắt đầu tuần">
                <a-select v-model:value="tempSettings.firstDay">
                  <a-select-option :value="0">Chủ Nhật</a-select-option>
                  <a-select-option :value="1">Thứ Hai</a-select-option>
                  <a-select-option :value="6">Thứ Bảy</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- Thông báo Tab -->
        <a-tab-pane key="notification" tab="Thông báo">
          <div class="tab-content">
            <h3>Thông báo</h3>
            <a-form layout="vertical">
              <a-form-item label="Loại thông báo">
                <a-select
                  v-model:value="tempSettings.notificationType"
                  placeholder="Chọn loại thông báo"
                >
                  <a-select-option value="both"
                    >Hệ thống và cửa sổ thông báo trình duyệt</a-select-option
                  >
                  <a-select-option value="desktop"
                    >Chỉ thông báo hệ thống</a-select-option
                  >
                  <a-select-option value="alerts"
                    >Cửa sổ thông báo trình duyệt</a-select-option
                  >
                  <a-select-option value="off">Tắt thông báo</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- Ngôn ngữ Tab -->
        <a-tab-pane key="language" :tab="$t('language')">
          <div class="tab-content">
            <h3>{{ $t("language") }}</h3>
            <a-form layout="vertical">
              <a-form-item label="Ngôn ngữ">
                <a-select v-model:value="tempSettings.language" @change="changeLanguage">
                  <a-select-option value="vi">Tiếng Việt</a-select-option>
                  <a-select-option value="en">English</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <div class="flex justify-end mt-4 gap-2">
      <a-button @click="handleCancel">Hủy</a-button>
      <a-button type="primary" :loading="isSaving" @click="handleSave">
        {{ isSaving ? "Đang lưu..." : "Lưu thay đổi" }}
      </a-button>
      <a-button type="primary" danger @click="resetSettings">Reset</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, onMounted, watch } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";
import { message } from "ant-design-vue";

const { locale } = useI18n();
const props = defineProps({
  isModalOpen: Boolean,
});

const emit = defineEmits(["update:isModalOpen"]);

const settingsStore = useSettingsStore();
const settings = settingsStore.$state;

const activeTabKey = ref("display");

const columnHeaderFormatOptions = [
  {
    label: "Thứ viết tắt + Ngày (VD: T2, 24)",
    value: { day: "numeric", weekday: "short",
      omitCommas: true,
    },
  },
  {
    label: "Thứ + Ngày (VD: Thứ Hai, 24)",
    value: { weekday: "long", day: "numeric" },
  },
  {
    label: "Chỉ thứ (VD: Thứ Hai)",
    value: { weekday: "long" },
  },
  {
    label: "Ngày + Tháng (VD: 24 Thg 2)",
    value: { day: "numeric", month: "short" },
  },
];

const titleFormatOptions = [
  {
    label: "Tháng Năm (VD: Tháng 2 2025)",
    value: { year: "numeric", month: "long" },
  },
  {
    label: "Tháng viết tắt + Năm (VD: Feb 2025)",
    value: { year: "numeric", month: "short" },
  },
  {
    label: "Năm/Tháng số (VD: 2025/02)",
    value: { year: "numeric", month: "2-digit" },
  },
];

const timeFormatOptions = [
  {
    label: "12 giờ (AM/PM)",
    value: "12h",
  },
  {
    label: "24 giờ",
    value: "24h",
  },
];

const selectedTitleFormat = ref(JSON.stringify(settings.titleFormat));
const selectedDayHeaderFormat = ref(JSON.stringify(settings.dayHeaderFormat));
const selectedTimeFormat = ref(settings.timeFormat);
const formState = ref({});

const defaultNotificationSettings = {
  notificationType: "email",
  reminderTime: "15",
};

const tempSettings = ref({
  ...settings,
  notificationType:
    settings.notificationType || defaultNotificationSettings.notificationType,
  reminderTime: settings.reminderTime || defaultNotificationSettings.reminderTime,
});

const isSaving = ref(false);

onMounted(() => {
  // Khởi tạo formState với giá trị từ store
  formState.value = { ...settingsStore.getCurrentSettings };
  // console.log('Initial form state:', formState.value); // Debug log
});

// Cập nhật lại các hàm xử lý sự kiện
const changeView = (view) => {
  tempSettings.value.displayMode = view;
};

const updateTimeFormat = (newValue) => {
  tempSettings.value.timeFormat = newValue;
};

const updateTitleFormat = (newValue) => {
  tempSettings.value.titleFormat = JSON.parse(newValue);
};

const updateColumnHeaderFormat = (newValue) => {
  tempSettings.value.dayHeaderFormat = JSON.parse(newValue);
};

const changeLanguage = (newLang) => {
  tempSettings.value.language = newLang;
};

const updateMultiMonthSettings = () => {
  // Không cần thay đổi gì vì đã sử dụng v-model với tempSettings
};

// Cập nhật hàm handleSave
const handleSave = async () => {
  try {
    isSaving.value = true;

    // Lưu settings hiện tại để có thể khôi phục nếu API fail
    const previousSettings = { ...settings };

    // Tạm thời áp dụng settings mới cho API call
    Object.assign(settings, tempSettings.value);

    // Save to API
    const success = await settingsStore.saveSettings();

    if (success) {
      // Nếu API thành công
      // Update language if changed
      if (settings.language !== locale.value) {
        locale.value = settings.language;
      }

      // Cập nhật calendar và lưu vào localStorage
      settingsStore.saveToLocalStorage();
      settingsStore.updateFullCalendar();

      message.success("Cài đặt đã được lưu");
      emit("update:isModalOpen", false);
    } else {
      // Nếu API thất bại, khôi phục lại settings cũ
      Object.assign(settings, previousSettings);
      // Khôi phục lại tempSettings
      tempSettings.value = { ...previousSettings };

      message.error("Không thể lưu cài đặt, vui lòng thử lại");
    }
  } catch (error) {
    // Trong trường hợp có lỗi, cũng khôi phục settings cũ
    Object.assign(settings, previousSettings);
    tempSettings.value = { ...previousSettings };

    console.error("Error saving settings:", error);

    // Hiển thị lỗi cụ thể nếu có
    if (error.response?.data?.message) {
      message.error(error.response.data.message);
    } else {
      message.error("Đã xảy ra lỗi khi lưu cài đặt");
    }
  } finally {
    isSaving.value = false;
  }
};

// Cập nhật hàm handleCancel
const handleCancel = () => {
  // Reset tempSettings về giá trị từ store
  tempSettings.value = { ...settings };
  emit("update:isModalOpen", false);
};

// Cập nhật hàm resetSettings
const resetSettings = () => {
  settingsStore.$reset();
  tempSettings.value = { ...settingsStore.$state };

  // Cập nhật lại các hàm xử lý sự kiện
  changeView(settingsStore.displayMode);
  updateTimeFormat(settingsStore.timeFormat);
  updateTitleFormat(JSON.stringify(settingsStore.titleFormat));
  updateColumnHeaderFormat(JSON.stringify(settingsStore.dayHeaderFormat));
  changeLanguage(settingsStore.language);
  updateMultiMonthSettings();

  message.success("Cài đặt đã được reset");
};

// Danh sách tháng 1-12
const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: i + 1,
  }))
);

// Lấy danh sách múi giờ kèm theo UTC offset
const timeZoneOptions = computed(() => {
  return moment.tz.names().map((tz) => {
    const offset = moment.tz(tz).utcOffset() / 60; // Lấy offset theo giờ
    const offsetText = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
    return {
      label: `${tz} (${offsetText})`,
      value: tz,
    };
  });
});

// Hiển thị múi giờ đã chọn với UTC offset
const selectedTimeZone = computed(() => {
  const tz = settings.timeZone || moment.tz.guess();
  const offset = moment.tz(tz).utcOffset() / 60;
  const offsetText = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
  return `${tz} (${offsetText})`;
});

// Lọc múi giờ theo từ khóa tìm kiếm
const filterTimeZones = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

// Log giá trị múi giờ khi thay đổi
const logTimeZone = (value) => {
  console.log("🔍 Múi giờ được chọn:", value);
  console.log("🕒 Giờ UTC:", moment.tz(value).utcOffset() / 60);
};

// Khi component được mounted
onMounted(() => {
  // Khởi tạo tempSettings với giá trị từ store
  tempSettings.value = { ...settings };
});

// Watch sự thay đổi từ store để cập nhật select
watch(
  () => settings.titleFormat,
  (newFormat) => {
    selectedTitleFormat.value = JSON.stringify(newFormat);
  }
);
</script>

<style scoped>
.tab-content {
  /* padding: 0 24px; */
  height: 500px;
  overflow-y: auto;
}

:deep(.ant-tabs-tab) {
  padding: 8px 12px !important;
}

:deep(.ant-tabs-content) {
  height: 100%;
}

:deep(.ant-tabs-left) {
  .ant-tabs-nav {
    border-right: 1px solid #f0f0f0;
  }
}
</style>
