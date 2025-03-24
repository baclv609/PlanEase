import { defineStore } from "pinia";
import { useSettings } from "@/composables/useSettings";
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";
import { watchEffect } from "vue";
import axios from 'axios';
import { message } from 'ant-design-vue';

export const useSettingsStore = defineStore("settings", {
  state: () => {
    // Load initial state from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    return {
      // 🖥 Cài đặt giao diện
      displayMode: savedSettings.displayMode || "dayGridMonth",
      showWeekNumbers: savedSettings.showWeekNumbers || false,
      themeMode: savedSettings.themeMode || "light",

      // Cài đặt thời gian
      timeZone: savedSettings.timeZone || "Asia/Saigon",
      timeZoneOffset: savedSettings.timeZoneOffset || moment.tz("Asia/Saigon").utcOffset() / 60,
      timeFormat: savedSettings.timeFormat || "24h",
      slotDuration: savedSettings.slotDuration || "00:30:00",
      language: savedSettings.language || "vi",

      // Cài đặt lịch
      titleFormat: savedSettings.titleFormat || { year: "numeric", month: "long" },
      dayHeaderFormat: savedSettings.dayHeaderFormat || { weekday: "long", day: "numeric" },
      dateFormat: savedSettings.dateFormat || "YYYY-MM-DD",
      eventTimeFormat: savedSettings.eventTimeFormat || { hour: "2-digit", minute: "2-digit", hour12: false },
      initialDate: savedSettings.initialDate || new Date().toISOString().split("T")[0],
      firstDay: savedSettings.firstDay || 1,
      multiMonthYear: savedSettings.multiMonthYear || false,

      // Cài đặt hiển thị năm dạng lưới
      multiMonthMaxColumns: savedSettings.multiMonthMaxColumns || 3,
      showNonCurrentDates: savedSettings.showNonCurrentDates || false,

      // Thông báo & Nhắc nhở
      enableNotifications: savedSettings.enableNotifications ?? true,
      notificationType: savedSettings.notificationType || 'both',
      reminderTime: savedSettings.reminderTime || '15',

      // Sự kiện lặp lại
      enableRecurringEvents: savedSettings.enableRecurringEvents ?? true,
      defaultRecurrence: savedSettings.defaultRecurrence || "none",

      calendarRef: null,

      // Cập nhật định dạng thời gian cho các cột
      columnHeaderFormat: savedSettings.columnHeaderFormat || {
        weekday: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      },

      settings: savedSettings.settings || null,
      loading: false,
    };
  },

  getters: {
    getCurrentSettings: (state) => state.settings
  },

  actions: {
    // Initialize settings from API response
    initializeFromApi(apiSettings) {
      const transformedSettings = {
        // Cài đặt giao diện
        displayMode: apiSettings.display_type || "dayGridMonth",
        showWeekNumbers: apiSettings.is_display_dayoff ? true : false,
        themeMode: apiSettings.theme || "light",

        // Cài đặt thời gian
        timeZone: apiSettings.timezone_code || "Asia/Saigon",
        timeZoneOffset: moment.tz(apiSettings.timezone_code || "Asia/Saigon").utcOffset() / 60,
        timeFormat: apiSettings.hour_format || "24h",
        slotDuration: "00:30:00",
        language: apiSettings.language || "vi",

        // Cài đặt lịch
        titleFormat: apiSettings.tittle_format_options || { year: "numeric", month: "long" },
        dayHeaderFormat: {
          weekday: this.mapWeekdayFormat(apiSettings.column_header_format_option?.weekday) || "long",
          day: apiSettings.column_header_format_option?.day || "numeric",
        },
        dateFormat: apiSettings.date_format || "YYYY-MM-DD",
        eventTimeFormat: {
          hour: apiSettings.hour_format === "24h" ? "2-digit" : "numeric",
          minute: "2-digit",
          hour12: apiSettings.hour_format !== "24h",
        },
        initialDate: new Date().toISOString().split("T")[0],
        firstDay: Number(apiSettings.first) || 1,
        multiMonthYear: false,

        // Cài đặt hiển thị năm dạng lưới
        multiMonthMaxColumns: Number(apiSettings.multi_month_max_columns) || 3,
        showNonCurrentDates: apiSettings.show_non_current_dates === true,

        // Thông báo & Nhắc nhở
        enableNotifications: true,
        notificationType: apiSettings.notification_type || "both",
        reminderTime: apiSettings.reminder_time || "15",

        // Sự kiện lặp lại
        enableRecurringEvents: true,
        defaultRecurrence: "none",

        // Cập nhật định dạng thời gian cho các cột
        columnHeaderFormat: {
          weekday: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: apiSettings.hour_format !== "24h"
        }
      };

      // Update state
      Object.assign(this.$state, transformedSettings);
      
      // Save to localStorage
      this.saveToLocalStorage();
      
      // Update calendar
      this.updateFullCalendar();
    },

    // Add new method to map weekday format
    mapWeekdayFormat(weekday) {
      const formatMap = {
        'short': 'long',  // Map 'short' to 'long' for select option
        'narrow': 'long',
        'long': 'long'
      };
      return formatMap[weekday] || 'long';
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
        displayMode: this.displayMode,
        showWeekNumbers: this.showWeekNumbers,
        themeMode: this.themeMode,
        timeZone: this.timeZone,
        timeZoneOffset: this.timeZoneOffset,
        timeFormat: this.timeFormat,
        slotDuration: this.slotDuration,
        language: this.language,
        titleFormat: this.titleFormat,
        dayHeaderFormat: this.dayHeaderFormat,
        dateFormat: this.dateFormat,
        eventTimeFormat: this.eventTimeFormat,
        initialDate: this.initialDate,
        firstDay: this.firstDay,
        multiMonthYear: this.multiMonthYear,
        multiMonthMaxColumns: this.multiMonthMaxColumns,
        showNonCurrentDates: this.showNonCurrentDates,
        enableNotifications: this.enableNotifications,
        notificationType: this.notificationType,
        reminderTime: this.reminderTime,
        enableRecurringEvents: this.enableRecurringEvents,
        defaultRecurrence: this.defaultRecurrence,
        columnHeaderFormat: this.columnHeaderFormat,
        settings: this.settings
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
        try {
          const api = this.calendarRef.getApi();
          if (api) {
            api.refetchEvents();
          }
        } catch (error) {
          console.log("Calendar not ready yet, skipping update");
          // Có thể thêm logic retry ở đây nếu cần
        }
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