import { defineStore } from "pinia";
import { useSettings } from "@/composables/useSettings";
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";
import { watchEffect } from "vue";
import axios from 'axios';
import { message } from 'ant-design-vue';

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    // 🖥 Cài đặt giao diện
    displayMode: localStorage.getItem("displayMode") || "dayGridMonth", // Lưu chế độ xem vào localStorage
    showWeekNumbers: false,
    themeMode: "light",

    // Cài đặt thời gian
    timeZone: "Asia/Saigon",
    timeZoneOffset: moment.tz("Asia/Saigon").utcOffset() / 60, 
    timeFormat: localStorage.getItem("timeFormat") || "24h",
    slotDuration: "00:30:00",
    language: localStorage.getItem("appLanguage") || "vi",

    // Cài đặt lịch
    titleFormat: { year: "numeric", month: "long" }, // Định dạng tiêu đề lịch
    dayHeaderFormat: { weekday: "long", day: "numeric" }, // Định dạng ngày trong cột
    dateFormat: "YYYY-MM-DD", // Mặc định hiển thị theo chuẩn YYYY-MM-DD
    eventTimeFormat: { hour: "2-digit", minute: "2-digit", hour12: false }, // Định dạng ngày trong sự kiện
    initialDate: new Date().toISOString().split("T")[0], // Ngày bắt đầu
    firstDay: 1, 
    multiMonthYear: false, // Hiển thị nhiều tháng

    // validRange: { start: "2025-01-01", end: "2025-12-31" }, // Giới hạn ngày

    // Cài đặt hiển thị năm dạng lưới
    multiMonthMaxColumns: parseInt(localStorage.getItem("multiMonthMaxColumns")) || 3,
    showNonCurrentDates: localStorage.getItem("showNonCurrentDates") === "true",

    // Thông báo & Nhắc nhở
    enableNotifications: true,
    notificationType: 'both',
    reminderTime: '15',

    // Sự kiện lặp lại
    enableRecurringEvents: true,
    defaultRecurrence: "none",

    calendarRef: null, // Lưu tham chiếu đến FullCalendar

    // Cập nhật định dạng thời gian cho các cột
    columnHeaderFormat: {
      weekday: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    },

    settings: null,
    loading: false,
  }),

  getters: {
    getCurrentSettings: (state) => state.settings
  },

  actions: {
    // Initialize settings from API response
    initializeFromApi(apiSettings) {
      // Convert API settings to match our store format
      const convertedSettings = {
        user_id: Number(apiSettings.user_id),
        displayMode: apiSettings.display_type || 'dayGridMonth',
        language: apiSettings.language || 'vi',
        timeZone: apiSettings.timezone_code || 'Asia/Saigon',
        timeFormat: apiSettings.hour_format || '24h',
        dateFormat: apiSettings.date_format || 'YYYY-MM-DD',
        firstDay: Number(apiSettings.first) || 1,
        themeMode: apiSettings.theme || 'light',
        titleFormat: apiSettings.tittle_format_option ? JSON.parse(apiSettings.tittle_format_option) : { year: 'numeric', month: 'long' },
        dayHeaderFormat: apiSettings.column_header_format_option ? JSON.parse(apiSettings.column_header_format_option) : { weekday: 'long' },
        showWeekNumbers: Boolean(apiSettings.is_display_dayoff),
        multiMonthMaxColumns: Number(apiSettings.multi_month_max_columns) || 3,
        showNonCurrentDates: Boolean(apiSettings.show_non_current_dates),
        notificationType: apiSettings.notification_type || 'both',
        reminderTime: apiSettings.reminder_time || '15'
      };

      // Update state
      Object.assign(this.$state, convertedSettings);
      
      // Save to localStorage
      this.saveToLocalStorage();
      
      // Update calendar
      this.updateFullCalendar();
    },

    // Save settings to API
    async saveSettings() {
      try {
        const dirApi = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('access_token');
        
        const apiSettings = {
          display_type: this.displayMode, // dayGridMonth, timeGridWeek, timeGridDay, listWeek
          language: this.language, // vi, en
          timezone_code: this.timeZone, // Asia/Saigon
          first: this.firstDay, // 1: chủ nhật, 2: thứ hai, 3: thứ ba, 4: thứ tư, 5: thứ năm, 6: thứ sáu, 7: thứ bảy 
          is_display_dayoff: this.showWeekNumbers ? 1 : 0, // 0: không hiển thị, 1: hiển thị 
          column_header_format_option: this.dayHeaderFormat, // định dạng ngày trong cột
          date_format: this.dateFormat, // YYYY-MM-DD
          hour_format: this.timeFormat, // 24h, 12h
          theme: this.themeMode, // light, dark
          notification_type: this.notificationType, // email, notification, both
          tittle_format_options: this.titleFormat, // định dạng tiêu đề lịch
        };

        const response = await axios.put(`${dirApi}setting/change`, apiSettings, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.code === 200) {
          return true;
        }
        
        throw new Error(response.data.message || 'Failed to save settings');
      } catch (error) {
        console.error('Error saving settings:', error);
        throw error; // Ném lỗi để component có thể xử lý
      }
    },

    // Save to localStorage
    saveToLocalStorage() {
      // Tạo một object mới chỉ chứa các thuộc tính cần thiết
      const settingsToSave = {
        id: this.id,
        user_id: this.user_id,
        displayMode: this.displayMode,
        language: this.language,
        timeZone: this.timeZone,
        timeFormat: this.timeFormat,
        firstDay: this.firstDay,
        titleFormat: this.titleFormat,
        dayHeaderFormat: this.dayHeaderFormat,
        showWeekNumbers: this.showWeekNumbers,
        multiMonthMaxColumns: this.multiMonthMaxColumns,
        showNonCurrentDates: this.showNonCurrentDates,
        notificationType: this.notificationType,
        reminderTime: this.reminderTime
      };

      // Lưu object đã lọc vào localStorage
      localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
    },

    // Load from localStorage
    loadFromLocalStorage() {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Chỉ cập nhật các thuộc tính đã được lưu
        Object.assign(this.$state, parsedSettings);
      }
    },

    // Update FullCalendar
    updateFullCalendar() {
      if (this.calendarRef && this.calendarRef.getApi) {
        this.calendarRef.getApi().refetchEvents();
      } else {
        console.warn("calendarRef is not available when calling updateFullCalendar");
      }
    },

    // Set default settings
    setDefaultSettings() {
      const defaultSettings = {
        displayMode: 'dayGridMonth',
        showWeekNumbers: false,
        themeMode: 'light',
        timeZone: 'Asia/Saigon',
        language: 'vi',
        firstDay: 1,
        enableRecurringEvents: true,
        reminderTime: '15',
        showNonCurrentDates: false,
        dayHeaderFormat: {
          weekday: 'long',
          day: 'numeric'
        },
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      };

      this.settings = defaultSettings;
      this.saveToLocalStorage();
    },

    // Clear settings
    clearSettings() {
      this.settings = null;
      localStorage.removeItem('settings');
    },

    updateTimeFormat(newValue) {
      console.log("Updating time format to:", newValue);
      this.timeFormat = newValue;
      
      // Cập nhật định dạng thời gian cho sự kiện
      this.eventTimeFormat = {
        hour: "2-digit",
        minute: "2-digit",
        meridiem: newValue === "12h" ? "short" : false,
        hour12: newValue === "12h"
      };

      // Cập nhật định dạng cho các cột
      this.columnHeaderFormat = {
        ...this.columnHeaderFormat,
        hour: "2-digit",
        minute: "2-digit",
        meridiem: newValue === "12h" ? "short" : false,
        hour12: newValue === "12h"
      };
      
      // Lưu vào localStorage
      localStorage.setItem("timeFormat", newValue);
      this.saveToLocalStorage();
      
      // Cập nhật FullCalendar nếu có
      if (this.calendarRef && this.calendarRef.getApi) {
        const calendarApi = this.calendarRef.getApi();
        
        // Cập nhật định dạng thời gian cho sự kiện
        calendarApi.setOption('eventTimeFormat', this.eventTimeFormat);
        
        // Cập nhật định dạng thời gian cho các khe thời gian
        calendarApi.setOption('slotLabelFormat', this.eventTimeFormat);
        
        // Buộc calendar refresh để áp dụng thay đổi
        calendarApi.refetchEvents();
      }
    },
    
    toggleTimeFormat() {
      this.timeFormat = this.timeFormat === "24h" ? "12h" : "24h";  
      this.saveToLocalStorage();
      this.updateFullCalendar();
    },    
    changeLanguage(newLang) {
      this.language = newLang;
      localStorage.setItem(
        "userSettings",
        JSON.stringify({ language: newLang })
      );

      const { locale } = useI18n();
      locale.value = newLang; // Cập nhật Vue I18n
    },
    // Cập nhật cài đặt lịch
    updateColumnHeaderFormat(newValue) {
      console.log("Updating column header format:", newValue);
      this.dayHeaderFormat = newValue;
      
      // Cập nhật FullCalendar
      if (this.calendarRef && this.calendarRef.getApi) {
        const calendarApi = this.calendarRef.getApi();
        calendarApi.setOption('dayHeaderFormat', newValue);
        calendarApi.refetchEvents();
      }
      
      this.saveToLocalStorage();
    },
    // Định dạng tiêu đề lịch
    updateTitleFormat(newValue) {
      console.log("Updating title format:", newValue);
      this.titleFormat = newValue;
      
      // Cập nhật FullCalendar
      if (this.calendarRef && this.calendarRef.getApi) {
        const calendarApi = this.calendarRef.getApi();
        calendarApi.setOption('titleFormat', newValue);
        
        // Cập nhật lại view hiện tại
        const currentView = calendarApi.view.type;
        calendarApi.changeView(currentView);
        
        // Cập nhật lại sự kiện
        calendarApi.refetchEvents();
      }
      
      // Lưu vào localStorage
      const settingsToSave = {
        ...JSON.parse(localStorage.getItem("userSettings") || "{}"),
        titleFormat: newValue
      };
      localStorage.setItem("userSettings", JSON.stringify(settingsToSave));
    },
    setCalendarRef(ref) {
      this.calendarRef = ref;
    },
    
    updateDisplayMode(newMode) {
      this.displayMode = newMode;
      localStorage.setItem("displayMode", newMode); 
    },

    updateSetting(key, value) {
      this[key] = value;
      this.saveToLocalStorage(); // Luôn lưu lại khi cập nhật
      this.updateFullCalendar();
    },
  
    updateMultiMonthSettings(columns, showNonCurrent) {
      this.multiMonthMaxColumns = columns;
      this.showNonCurrentDates = showNonCurrent;
      localStorage.setItem("multiMonthMaxColumns", columns);
      localStorage.setItem("showNonCurrentDates", showNonCurrent);
      this.updateFullCalendar();
    },

    setSettings(settings) {
      try {
        const validatedSettings = this.validateAndConvertSettings(settings);
        this.settings = validatedSettings;
        localStorage.setItem('userSettings', JSON.stringify(validatedSettings));
      } catch (error) {
        console.error('Error setting settings:', error);
        this.setDefaultSettings();
      }
    },

    validateAndConvertSettings(settings) {
      return {
        ...settings,
        // Các trường cơ bản
        id: Number(settings.id) || 0,
        user_id: Number(settings.user_id) || 0,
        
        // Giao diện
        theme: String(settings.theme || 'light'),
        language: String(settings.language || 'en'),
        
        // Định dạng thời gian
        timezone_code: String(settings.timezone_code || 'UTC'),
        time_format: String(settings.time_format || 'H:mm'),
        date_format: String(settings.date_format || 'Y-m-d'),
        
        // Calendar settings
        displayMode: String(settings.displayMode || 'dayGridMonth'),
        firstDay: Number(settings.firstDay || 1),
        multiMonthMaxColumns: Number(settings.multiMonthMaxColumns || 3),
        
        // Event settings
        enableRecurringEvents: Boolean(settings.enableRecurringEvents ?? true),
        eventTimeFormat: settings.eventTimeFormat || {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        },
        
        // Display settings
        showWeekNumbers: Boolean(settings.showWeekNumbers ?? false),
        showNonCurrentDates: Boolean(settings.showNonCurrentDates ?? false),
        
        // Header format
        dayHeaderFormat: settings.dayHeaderFormat || {
          weekday: 'long',
          day: 'numeric'
        },
        
        // Title format
        titleFormat: settings.titleFormat || {
          year: 'numeric',
          month: 'long'
        },
        
        // Reminder settings
        reminderTime: String(settings.reminderTime || '15'),
        
        // Time zone offset
        timezoneOffset: Number(settings.timezoneOffset || 0)
      };
    },

    // Add method to update settings from login API response
    updateSettingsFromLogin(apiSettings) {
      // Update all settings from API response
      Object.assign(this.$state, apiSettings);
      // Save to localStorage
      this.saveToLocalStorage();
      // Update calendar if needed
      this.updateFullCalendar();
    },
  },
});

// watchEffect(() => {
//   const settingsStore = useSettingsStore();
//   settingsStore.saveToLocalStorage();
// });