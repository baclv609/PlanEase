import { useSettingsStore } from "@/stores/settingsStore";
import moment from "moment-timezone";

export const useSettings = () => {
    const settingsStore = useSettingsStore(); 

    const transformSettings = (apiSettings) => {
        return {
            displayMode: apiSettings.display_type,
            showWeekNumbers: false,
            themeMode: apiSettings.theme,
            timeZone: apiSettings.timezone_code,
            dayHeaderFormat: {
                day: apiSettings.column_header_format_option.day,
                weekday: apiSettings.column_header_format_option.weekday,
            },
            enableNotifications: true,
            enableRecurringEvents: true,
            eventTimeFormat: {
                hour: apiSettings.hour_format == "24h" ? "2-digit" : "numeric",
                minute: "2-digit",
                hour12: apiSettings.hour_format != "24h",
            },
            firstDay: Number(apiSettings.first),
            language: apiSettings.language,
            multiMonthMaxColumns: 3,
            reminderTime: "10m",
            showNonCurrentDates: false,
            showWeekNumbers: false,
            timeFormat: apiSettings.time_format,
            timeZoneOffset: moment.tz(apiSettings.timezone_code).utcOffset() / 60,
            titleFormat: apiSettings.tittle_format_options,
        };
    };

    const initSettings = () => {
        const savedSettings = JSON.parse(localStorage.getItem("userSettings"));

        if (savedSettings) {
            settingsStore.$patch(savedSettings);
        } else {
            const defaultSettings = {
                timeZone: moment.tz.guess(),
                timeFormat: new Intl.DateTimeFormat(navigator.language, { hour: "numeric" })
                    .resolvedOptions().hourCycle.includes("h12") ? "12h" : "24h",
                language: navigator.language.startsWith("vi") ? "vi" : "en",
                themeMode: "light",
                firstDay: 1,
                displayMode: "dayGridMonth",
                columnHeaderFormatOption: { weekday: "long", day: "numeric" },
                showWeekNumbers: false,
                multiMonthMaxColumns: 3,
                showNonCurrentDates: false,
                titleFormat: { year: "numeric", month: "long", day: "numeric" },
                hourFormat: new Intl.DateTimeFormat(navigator.language, { hour: "numeric" })
                    .resolvedOptions().hourCycle.includes("h12") ? "12h" : "24h",
                dateFormat: "YYYY-MM-DD",
                eventTimeFormat: { hour: "2-digit", minute: "2-digit", hour12: false },
                reminderTime: "10m"
                
            };

            settingsStore.$patch(defaultSettings);
            localStorage.setItem("userSettings", JSON.stringify(defaultSettings));
        }
    };

    const getUserTimezone = () => {
        return settingsStore.timeZone; // Hoặc giá trị mặc định nếu cần
    };

    return { initSettings, getUserTimezone, transformSettings };
};