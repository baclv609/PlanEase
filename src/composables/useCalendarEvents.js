import { ref, computed, onMounted } from "vue";
import axios from "axios";
import scheduleApi from "@/api/scheduleApi";

export function useCalendarEvents() {
  const rawEvents = ref([]);
  const { getSchedules } = scheduleApi;

  const fetchEvents = async () => {
    try {
      const response = await getSchedules();
      console.log("Dữ liệu nhận được từ API:", response.data);
      if (!Array.isArray(response.data.data)) {
        console.error(
          "Lỗi: response.data không phải là một mảng!",
          response.data
        );
        return;
      }

      rawEvents.value = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      console.log("rawEvents.value", rawEvents.value);
    } catch (error) {
      console.error("Lỗi khi tải lịch trình:", error);
    }
  };

  //   onMounted(async () => {
  //     await fetchEvents();
  //   });
  const formattedEvents = computed(() =>
    rawEvents.value.map((event) => {
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start_time ? event.start_time.replace(" ", "T") : null,
        end: event.end_time ? event.end_time.replace(" ", "T") : null,
        allDay: event.is_all_day === 1,
        backgroundColor: event.color_code || "#3788d8",
        borderColor: event.color_code || "#3788d8",
        location: event.location,
        extendedProps: {
          is_reminder: event.is_reminder === 1,
          reminder: event.reminder || [],
          attendees: event.attendees || [],
          is_done: event.is_done === 1,
          is_busy: event.is_busy === 1,
        },
        // rrule: event.is_repeat
        //   ? {
        //       freq:
        //         event.rrule && event.rrule.freq ? event.rrule.freq : "daily",
        //       interval: event.rrule?.interval || 1,
        //       until: event.rrule?.until
        //         ? event.rrule.until.replace(" ", "T")
        //         : null,
        //       count: event.rrule?.count || null,
        //       exdate: event.exclude_time
        //         ? event.exclude_time
        //             .map((date) => date.replace(" ", "T"))
        //             .join(",")
        //         : null,
        //     }
        //   : null,
        rrule: event.is_repeat && event.rrule
          ? {
              freq: event.rrule.freq || "daily",
              interval: event.rrule.interval || 1,
              until: event.rrule.until ? event.rrule.until.replace(" ", "T") : null,
              count: event.rrule.count || null,
              byweekday: event.rrule.byweekday || null,
              bymonth: event.rrule.bymonth || null,
              bymonthday: event.rrule.bymonthday || null,
              byyearday: event.rrule.byyearday || null,
              byweekno: event.rrule.byweekno || null,
              byhour: event.rrule.byhour || null,
              byminute: event.rrule.byminute || null,
              bysecond: event.rrule.bysecond || null,
              wkst: event.rrule.wkst || null,
              exdate: Array.isArray(event.exclude_time)
                ? event.exclude_time.map((date) => date.replace(" ", "T")).join(",")
                : null,
            }
          : null,
      };
    })
  );

  return {
    formattedEvents,
    fetchEvents,
  };
}
