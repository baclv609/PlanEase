<template>
  <a-modal
    :open="isModalOpen"
    :title="$t('settings.title')"
    width="650px"
    @ok="handleSave"
    centered
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="flex" style="min-height: 450px">
      <!-- Tabs Menu - Left Side -->
      <a-tabs v-model:activeKey="activeTabKey" tab-position="left" style="width: 100%">
        <!-- Giao diện Tab -->
        <a-tab-pane key="display" :tab="$t('settings.display')">
          <div class="tab-content">
            <h3>{{ $t('settings.display') }}</h3>
            <a-form layout="vertical">
              <a-form-item :label="$t('settings.displayMode')">
                <a-select v-model:value="tempSettings.displayMode" @change="changeView">
                  <a-select-option value="multiMonthYear">{{ $t('settings.multiMonthYear') }}</a-select-option>
                  <a-select-option value="listYear">{{ $t('settings.listYear') }}</a-select-option>
                  <a-select-option value="dayGridMonth">{{ $t('settings.dayGridMonth') }}</a-select-option>
                  <a-select-option value="timeGridWeek">{{ $t('settings.timeGridWeek') }}</a-select-option>
                  <a-select-option value="timeGridDay">{{ $t('settings.timeGridDay') }}</a-select-option>
                </a-select>
              </a-form-item>

              <!-- Tùy chọn hiển thị cho chế độ xem năm dạng lưới -->
              <template v-if="tempSettings.displayMode === 'multiMonthYear'">
                <a-form-item :label="$t('settings.multiMonthMaxColumns')">
                  <a-select
                    v-model:value="tempSettings.multiMonthMaxColumns"
                    @change="updateMultiMonthSettings"
                  >
                    <a-select-option :value="2">2 {{ $t('settings.columns') }}</a-select-option>
                    <a-select-option :value="3">3 {{ $t('settings.columns') }}</a-select-option>
                    <a-select-option :value="4">4 {{ $t('settings.columns') }}</a-select-option>
                  </a-select>
                </a-form-item>

                <!-- <a-form-item :label="$t('settings.showNonCurrentDates')">
                  <a-switch
                    v-model:checked="tempSettings.showNonCurrentDates"
                    @change="updateMultiMonthSettings"
                  />
                </a-form-item> -->
              </template>

              <!-- <a-form-item :label="$t('settings.showWeekNumbers')">
                <a-switch v-model:checked="tempSettings.showWeekNumbers" />
              </a-form-item> -->
            </a-form>
          </div>
        </a-tab-pane>

        <!-- Thời gian Tab -->
        <a-tab-pane key="time" :tab="$t('settings.time')">
          <div class="tab-content">
            <h3>{{ $t('settings.time') }}</h3>
            <a-form layout="vertical">
              <a-form-item :label="$t('settings.timeZone')">
                <a-select
                  v-model:value="tempSettings.timeZone"
                  show-search
                  :placeholder="$t('settings.selectTimeZone')"
                  :options="timeZoneOptions"
                  :filter-option="filterTimeZones"
                  @change="logTimeZone"
                />
              </a-form-item>

              <a-form-item :label="$t('settings.timeFormat')">
                <a-select v-model:value="selectedTimeFormat" @change="updateTimeFormat">
                  <a-select-option value="12h">{{ $t('settings.hour12') }}</a-select-option>
                  <a-select-option value="24h">{{ $t('settings.hour24') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- Lịch Tab -->
        <a-tab-pane key="calendar" :tab="$t('settings.calendar')">
          <div class="tab-content">
            <h3>{{ $t('settings.calendar') }}</h3>
            <a-form layout="vertical">
              <a-form-item :label="$t('settings.calendarTitleFormat')">
                <a-select v-model:value="selectedTitleFormat" @change="updateTitleFormat">
                  <a-select-option
                    v-for="option in titleFormatOptions"
                    :key="option.label"
                    :value="JSON.stringify(option.value)"
                  >
                    {{ $t(`settings.${option.translationKey}`) }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item :label="$t('settings.dayHeaderFormat')">
                <a-select
                  v-model:value="selectedDayHeaderFormat"
                  @change="updateColumnHeaderFormat"
                >
                  <a-select-option
                    v-for="option in columnHeaderFormatOptions"
                    :key="option.label"
                    :value="JSON.stringify(option.value)"
                  >
                    {{ $t(`settings.${option.translationKey}`) }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item :label="$t('settings.weekStartDay')">
                <a-select v-model:value="tempSettings.firstDay">
                  <a-select-option :value="0">{{ $t('settings.sunday') }}</a-select-option>
                  <a-select-option :value="1">{{ $t('settings.monday') }}</a-select-option>
                  <a-select-option :value="6">{{ $t('settings.saturday') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- Thông báo Tab -->
        <!-- <a-tab-pane key="notification" :tab="$t('settings.notification')">
          <div class="tab-content">
            <h3>{{ $t('settings.notification') }}</h3>
            <a-form layout="vertical">
              <a-form-item :label="$t('settings.notificationType')">
                <a-select
                  v-model:value="tempSettings.notificationType"
                  :placeholder="$t('settings.notificationType')"
                >
                  <a-select-option value="both">{{ $t('settings.notificationTypes.both') }}</a-select-option>
                  <a-select-option value="desktop">{{ $t('settings.notificationTypes.desktop') }}</a-select-option>
                  <a-select-option value="alerts">{{ $t('settings.notificationTypes.alerts') }}</a-select-option>
                  <a-select-option value="off">{{ $t('settings.notificationTypes.off') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane> -->

        <!-- Ngôn ngữ Tab -->
        <a-tab-pane key="language" :tab="$t('language')">
          <div class="tab-content">
            <h3>{{ $t("language") }}</h3>
            <a-form layout="vertical">
              <a-form-item :label="$t('language')">
                <a-select v-model:value="tempSettings.language" @change="changeLanguage">
                  <a-select-option value="vi">{{ $t('vietnamese') }}</a-select-option>
                  <a-select-option value="en">{{ $t('english') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <div class="flex justify-end mt-4 gap-2">
      <a-button @click="handleCancel">{{ $t('settings.cancel') }}</a-button>
      <a-button type="primary" :loading="isSaving" @click="handleSave">
        {{ isSaving ? $t('settings.saving') : $t('settings.save') }}
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, onMounted, watch } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";
import { message } from "ant-design-vue";

const { locale, t } = useI18n();
const props = defineProps({
  isModalOpen: Boolean,
});

const emit = defineEmits(["update:isModalOpen"]);

const settingsStore = useSettingsStore();
const settings = settingsStore.$state;

const activeTabKey = ref("display");

const columnHeaderFormatOptions = [
  {
    label: t('settings.shortDayDate'),
    translationKey: 'shortDayDate',
    value: { day: "numeric", weekday: "short", omitCommas: true },
  },
  {
    label: t('settings.longDayDate'),
    translationKey: 'longDayDate',
    value: { weekday: "long", day: "numeric" },
  },
  {
    label: t('settings.dayOnly'),
    translationKey: 'dayOnly',
    value: { weekday: "long" },
  },
  {
    label: t('settings.dateMonth'),
    translationKey: 'dateMonth',
    value: { day: "numeric", month: "short" },
  },
];

const titleFormatOptions = [
  {
    label: t('settings.monthYear'),
    translationKey: 'monthYear',
    value: { year: "numeric", month: "long" },
  },
  {
    label: t('settings.shortMonthYear'),
    translationKey: 'shortMonthYear',
    value: { year: "numeric", month: "short" },
  },
  {
    label: t('settings.numericMonthYear'),
    translationKey: 'numericMonthYear',
    value: { year: "numeric", month: "2-digit" },
  },
];

const timeFormatOptions = [
  {
    label: t('settings.hour12'),
    value: "12h",
  },
  {
    label: t('settings.hour24'),
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
const changeView = async (view) => {
  try {
    tempSettings.value.displayMode = view;
    
    Object.assign(settings, { displayMode: view });
    
    await settingsStore.saveToLocalStorage();
    await settingsStore.updateFullCalendar();

  } catch (error) {
    console.error('Lỗi khi thay đổi chế độ xem:', error);
    
    tempSettings.value.displayMode = settings.displayMode;
  }
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
    const previousLocale = locale.value;

    // Tạm thời áp dụng settings mới cho API call
    Object.assign(settings, tempSettings.value);

    // Save to API
    const success = await settingsStore.saveSettings();

    if (success) {
      // Nếu API thành công
      // Update language if changed
      if (settings.language && settings.language !== previousLocale) {
        locale.value = settings.language;
      }

      // Cập nhật calendar và lưu vào localStorage
      settingsStore.saveToLocalStorage();
      settingsStore.updateFullCalendar();

      message.success(t('settings.message.success'));
      emit("update:isModalOpen", false);
    } else {
      // Nếu API thất bại, khôi phục lại settings cũ
      Object.assign(settings, previousSettings);
      // Khôi phục lại tempSettings
      tempSettings.value = { ...previousSettings };
      // Khôi phục lại locale nếu cần
      if (locale.value !== previousLocale) {
        locale.value = previousLocale;
      }

      message.error(t('settings.message.error'));
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
      message.error(t('settings.message.error'));
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

  message.success(t('settings.message.reset'));
};

// Danh sách tháng 1-12
const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    label: t('settings.months', { month: i + 1 }),
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
  console.log(t('settings.log.timezone.selected', { timezone: value }));
  console.log(t('settings.log.timezone.utc', { offset: moment.tz(value).utcOffset() / 60 }));
};

onMounted(() => {
  tempSettings.value = { ...settings };
});

watch(
  () => settings.titleFormat,
  (newFormat) => {
    selectedTitleFormat.value = JSON.stringify(newFormat);
  }
);

// Cập nhật watch để theo dõi thay đổi displayMode
watch(
  () => settings.displayMode,
  (newMode) => {
    if (newMode && tempSettings.value.displayMode !== newMode) {
      tempSettings.value.displayMode = newMode;
    }
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
