<script setup>
import { ref, watch, defineProps, defineEmits, computed, onMounted, h } from "vue";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  TimePicker,
  Button,
  Checkbox,
  Card,
  Row,
  Col,
  InputNumber,
  Radio,
  message,
  Tag,
  Drawer,
  Upload,
} from "ant-design-vue";
import debounce from 'lodash/debounce';
import { 
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  TagOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  CheckSquareOutlined,
  ReloadOutlined,
  BellOutlined,
  UserOutlined,
  TeamOutlined,
  ScheduleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  UploadOutlined,
  LinkOutlined,
  AlignLeftOutlined,
  PaperClipOutlined,
  LockOutlined,
  CaretDownOutlined,
} from '@ant-design/icons-vue';
import moment from "moment-timezone";
import dayjs from "dayjs";
import axios from "axios";
import Editor from 'primevue/editor';
import { useI18n } from 'vue-i18n';
import unknowUser from '@/assets/images/unknow_user.jpg';

const props = defineProps({
  isAddEventModalVisible: Boolean,
  event: Object,
  AddEventModalSuccess: Object,
});

const eventData = computed(() => props.event || {});
const formRef = ref(null);
const emit = defineEmits(["save", 'cancel',"cancelAddEventModalVisible", 'AddEventModalSuccess']);
const selectedDate = ref(null);
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const userSettings = JSON.parse(localStorage.getItem('userSettings'));
const timezones = moment.tz.names();
const tags = ref([]);
const isLoading = ref(false);
const presignedUrls = ref([]);
const fileUploads = ref([]);

const { t } = useI18n();

const colors = [
  { label: 'blue', value: '#1890ff' }, 
  { label: 'red', value: '#ff4d4f' }, 
  { label: 'green', value: '#52c41a' },
  { label: 'yellow', value: '#faad14' }, 
  { label: 'purple', value: '#722ed1' },
  { label: 'gray', value: '#bfbfbf' }, 
  { label: 'orange', value: '#fa541c' }, 
  { label: 'pink', value: '#eb2f96' }, 
  { label: 'brown', value: '#a97c50' }, 
  { label: 'cyan', value: '#13c2c2' }, 
  { label: 'emerald', value: '#237804' }, 
  { label: 'navy', value: '#003a8c' },
  { label: 'black', value: '#000000' }
];

const formState = ref({
  id: null,
  title: "",
  description: "",
  location: "",
  attendees: [], // Danh sách người tham gia (Array[String])
  sendMail: null,
  tag_id: null,
  role: 'viewer', // Thêm role mặc định là viewer
  is_private: false,
  start: null,
  end: null,
  allDay: false,
  type: "event",
  attachments: [], // Thêm trường attachments
  link: null,
  isPastTime: false, // Thêm biến để theo dõi thời gian trong quá khứ

  // Màu sắc
  backgroundColor: colors[0].value,
  borderColor: colors[0].value,
  color_code: colors[0].value,
  // Nhắc nhở (Reminders)
  is_reminder: false, // Có bật nhắc nhở không? (Boolean)
  reminder_time: [], // Thời gian nhắc nhở (String - "HH:mm")
  reminder: [], // Danh sách nhắc nhở (Array[Object])

  // Lặp lại sự kiện (Recurring Rule - RRule)
  is_repeat: false,
  rrule: null,

  // Metadata mở rộng (Extended Props của FullCalendar)
  extendedProps: {
    createdBy: "", // Người tạo sự kiện (String - Email)
    lastUpdated: null, // Thời gian cập nhật cuối (String - ISO 8601)
    notes: "", // Ghi chú bổ sung (String)
  },
  event_type: "", // Công việc, Cuộc họp, Sự kiện khác
  exclude_time: [],
  timezone_code: localStorage.getItem("userSettings")
    ? JSON.parse(localStorage.getItem("userSettings")).timeZone
    : "Asia/Saigon",
});

const myTags = ref([]);
const myShareTags = ref([]);
const allTags = ref([]);

// Lấy tag của người dùng
const getAllTagByUser = async () => {
  try {
    const res = await axios.get(`${dirApi}tags/list`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if(res.data.code == 200) {
      myTags.value = res.data.data.owned;
      myShareTags.value = res.data.data.shared_as_editor;
      
      allTags.value = [...myTags.value, ...myShareTags.value];

      tags.value = allTags.value;

      // Set default first tag if available
      if (tags.value.length > 0) {
        formState.value.tag_id = tags.value[0].id;
      }
    }
  } catch (error) {
    console.log('Loi lay tags', error);
  }
}

// Add watcher for isAddEventModalVisible
watch(
  () => props.isAddEventModalVisible,
  (newVal) => {
    if (newVal) {
      getAllTagByUser();
    }
  },
  { immediate: true }
);

watch(
  eventData,
  (newVal) => {
    if (newVal) {
      formState.value.start = newVal.start ? dayjs(newVal.start) : null;
      formState.value.end = newVal.end ? dayjs(newVal.end) : null;
      formState.value.is_all_day = newVal.allDay;
      formState.value.type = newVal.type || 'event';
    }
  },
  { immediate: true }
);

watch(
  () => formState.value.is_private,
  (newVal) => {
    if(newVal) {
      formState.value.attendees = [];
    }
  }
)

onMounted(() => {
  if(props.isAddEventModalVisible) {
    // Set default color
    formState.value.color_code = colors[0].value;
    formState.value.backgroundColor = colors[0].value;
    formState.value.borderColor = colors[0].value;
  }
});

const resetForm = () => {
  formState.value = {
    id: null,
    title: "",
    description: "",
    location: "",
    attendees: [], // Danh sách người tham gia (Array[String])
    tag_id: null,
    role: 'viewer', // Thêm role mặc định là viewer
    is_private: false,
    start: null,
    end: null,
    allDay: false,
    type: "event",
    attachments: [], // Thêm trường attachments
    isPastTime: false,

    // Màu sắc
    backgroundColor: colors[0].value,
    borderColor: colors[0].value,
    color_code: colors[0].value,
    // Nhắc nhở (Reminders)
    is_reminder: false, // Có bật nhắc nhở không? (Boolean)
    reminder_time: [], // Thời gian nhắc nhở (String - "HH:mm")
    reminder: [], // Danh sách nhắc nhở (Array[Object])

    // Lặp lại sự kiện (Recurring Rule - RRule)
    is_repeat: false,
    rrule: null,

    // Metadata mở rộng (Extended Props của FullCalendar)
    extendedProps: {
      createdBy: "", // Người tạo sự kiện (String - Email)
      lastUpdated: null, // Thời gian cập nhật cuối (String - ISO 8601)
      notes: "", // Ghi chú bổ sung (String)
    },
    event_type: "", // Công việc, Cuộc họp, Sự kiện khác
    exclude_time: [],
    timezone_code: localStorage.getItem("userSettings")
      ? JSON.parse(localStorage.getItem("userSettings")).timeZone
      : "Asia/Saigon",
    }
  }

const rules = {
  title: [
    { required: true, message: t('validation.title.required'), trigger: "blur" },
    { min: 3, message: t('validation.title.min'), trigger: "blur" },
    { max: 255, message: t('validation.title.max'), trigger: "blur" }
  ],
  start: [
    { required: true, message: t('validation.time.required'), trigger: "change" },
    {
      validator: (_, value) => {
        if (!value) {
          return Promise.reject(t('validation.time.required'));
        }
        return Promise.resolve();
      },
      trigger: "change"
    }
  ],
  end: [
    { required: true, message: t('validation.time.required'), trigger: "change" },
    {
      validator: (_, value) => {
        if (!value) {
          return Promise.reject(t('validation.time.required'));
        }
        if (formState.value.is_all_day) {
          // Nếu là cả ngày, kiểm tra ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày
          const startDate = dayjs(formState.value.start).startOf('day');
          const endDate = dayjs(value).startOf('day');
          if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
            return Promise.reject(t('validation.time.start_after_end'));
          }
        } else {
          // Nếu không phải cả ngày, kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
          if (formState.value.type === 'event' && dayjs(value).isBefore(dayjs(formState.value.start))) {
            return Promise.reject(t('validation.time.invalid'));
          }
        }
        return Promise.resolve();
      },
      trigger: "change",
    },
  ],
  description: [
    { max: 1000, message: t('validation.descriptionMaxLength'), trigger: "blur" }
  ],
  location: [
    { max: 255, message: t('validation.locationMaxLength'), trigger: "blur" }
  ],
  link: [
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve(); // optional field
        const urlRegex = /^(https?:\/\/)([\w-]+(\.[\w-]+)+)(:\d+)?(\/[\w-./?%&=]*)?$/;
        if (!urlRegex.test(value)) {
          return Promise.reject(t('validation.linkInvalid'));
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    }
  ],
  attendees: [
    {
        validator: (_, value) => {
            if (value && value.length > 10) {
                return Promise.reject(t('validation.attendees.max'));
            }
            return Promise.resolve();
        },
        trigger: "change"
    }
  ],
  byweekday: [
    {
      validator: () => {
        if (formState.value.is_repeat && formState.value.rrule?.freq === "WEEKLY") {
          if (formState.value.rrule.byweekday.length === 0) {
            return Promise.reject(t('validation.rrule.byweekday'));
          }
        }
        return Promise.resolve();
      },
    },
  ],
  // Thêm rules cho phần lặp lại
  'rrule.until': [
    {
      validator: () => {
        if (formState.value.is_repeat && formState.value.rrule?.endType === 'until') {
          if (!formState.value.rrule.until) {
            return Promise.reject(t('validation.rrule.until.required'));
          }
          const untilDate = dayjs(formState.value.rrule.until);
          const startDate = dayjs(formState.value.start);
          if (untilDate.isBefore(startDate) || untilDate.isSame(startDate)) {
            return Promise.reject(t('validation.rrule.until.after_start'));
          }
        }
        return Promise.resolve();
      },
    },
  ],
  'rrule.count': [
    {
      validator: () => {
        if (formState.value.is_repeat && formState.value.rrule?.endType === 'count') {
          if (!formState.value.rrule.count) {
            return Promise.reject(t('validation.rrule.count.required'));
          }
          if (formState.value.rrule.count < 1) {
            return Promise.reject(t('validation.rrule.count.min'));
          }
        }
        return Promise.resolve();
      },
    },
  ],
  'rrule.interval': [
    {
      validator: () => {
        if (formState.value.is_repeat) {
          if (!formState.value.rrule.interval) {
            return Promise.reject(t('validation.rrule.interval.required'));
          }
          if (formState.value.rrule.interval < 1) {
            return Promise.reject(t('validation.rrule.interval.min'));
          }
        }
        return Promise.resolve();
      },
    },
  ],
};

const handleExcludeDate = (date) => {
  if (date) {
    const formattedDate = dayjs(date).hour(dayjs(formState.value.start).hour()).minute(dayjs(formState.value.start).minute()).second(0).format("YYYY-MM-DD HH:mm:ss");
    if (!formState.value.exclude_time.includes(formattedDate)) {
      formState.value.exclude_time.push(formattedDate);
    }
  }
};

const removeExcludeDate = (index) => {
  formState.value.exclude_time.splice(index, 1);
};
//  Watch khi người dùng bật/tắt chế độ lặp lại
watch(
  () => formState.value.is_repeat,
  (newValue) => {
    if (newValue) {
      // Nếu bật lặp lại, tạo rrule mặc định
      formState.value.rrule = {
        freq: "daily",
        interval: 1,
        count: null,
        until: null,
        byweekday: [],
        bymonthday: [],
        bymonth: [],
        bysetpos: [],
        endType: "", // 'count' hoặc 'until'
      };
    } else {
      // Nếu tắt, xóa rrule
      formState.value.rrule = null;
    }
  },
  { immediate: true }
);

watch(
  () => formState.value.is_all_day,
  (newValue) => {
    if (newValue) {
      // Khi bật cả ngày
      formState.value.start = dayjs(formState.value.start).startOf('day');
      // Chỉ set end date nếu chưa có hoặc nếu end date trước start date
      if(formState.value.end.isSame(formState.value.start) || formState.value.end.isBefore(formState.value.start)) {
        formState.value.end = dayjs(formState.value.start).add(1, 'day').startOf('day');
      } else {
        formState.value.end = dayjs(formState.value.end).startOf('day');
      }
    }
  }
);

const freqOptions = [
  { label: t('eventModal.sections.recurrence.freq.daily'), value: "daily" },
  { label: t('eventModal.sections.recurrence.freq.weekly'), value: "weekly" },
  { label: t('eventModal.sections.recurrence.freq.monthly'), value: "monthly" },
  { label: t('eventModal.sections.recurrence.freq.yearly'), value: "yearly" },
];

const weekDays = [
  { label: t('eventModal.sections.recurrence.weekDays.monday'), value: "MO" },
  { label: t('eventModal.sections.recurrence.weekDays.tuesday'), value: "TU" },
  { label: t('eventModal.sections.recurrence.weekDays.wednesday'), value: "WE" },
  { label: t('eventModal.sections.recurrence.weekDays.thursday'), value: "TH" },
  { label: t('eventModal.sections.recurrence.weekDays.friday'), value: "FR" },
  { label: t('eventModal.sections.recurrence.weekDays.saturday'), value: "SA" },
  { label: t('eventModal.sections.recurrence.weekDays.sunday'), value: "SU" },
];

const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

watch(
  () => formState.value?.rrule?.endType,
  (newVal) => {
    if (newVal === "count") {
      formState.value.rrule.until = null;
    } else if (newVal === "until") {
      formState.value.rrule.count = null;
    }
  }
);

// Xử lý thêm
const checkPossibleTime = async (start, end, timezone) => {
  try {
    const response = await axios.post(
      `${dirApi}tasks/checkPossibleStartTime`,
      {
        start_time: start.format("YYYY-MM-DD HH:mm:ss"),
        end_time: end.format("YYYY-MM-DD HH:mm:ss"),
        timezone_code: timezone,
        not_check_id: null
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('response', response);
    if (response.data.code === 477) {
      return new Promise((resolve) => {
        Modal.confirm({
          title: t('eventModal.timeConflict.title'),
          content: t('eventModal.timeConflict.content'),
          okText: t('eventModal.timeConflict.continue'),
          cancelText: t('eventModal.timeConflict.cancel'),
          onOk: () => resolve(true),
          onCancel: () => resolve(false)
        });
      });
    }

    return true;
  } catch (error) {
    console.log('Loi khi kiem tra thoi gian', error);
  }
};

// Sửa lại hàm handleSave để sử dụng checkPossibleTime
const handleSave = async () => {
  isLoading.value = true;
  try {
    const dataApi = {
      title: formState.value.title,
      start_time: formState.value.start
        ? formState.value.start.format("YYYY-MM-DD HH:mm:ss")
        : null,
      end_time: formState.value.end
        ? formState.value.end.format("YYYY-MM-DD HH:mm:ss")
        : null,
      description: formState.value.description ? formState.value.description : null,
      location: formState.value.location ? formState.value.location : null,
      attendees: formState.value.attendees ? transformAttendeesData(formState.value.attendees) : null,
      sendMail: formState.value.sendMail,
      is_reminder: formState.value.is_reminder || 0,
      reminder: formatReminders(formState.value.reminder) || null,
      color_code: formState.value.color_code || null,
      borderColor: formState.value.borderColor || null,
      is_busy: formState.value.is_busy,
      is_all_day: formState.value.is_all_day || 0,
      is_repeat: formState.value.is_repeat || 0,
      default_permission: formState.value.role || 'viewer',
      link: formState.value.link || null,
      rrule: formState.value.rrule || null,
      exclude_time: formState.value.exclude_time || null,
      timezone_code: formState.value.timezone_code ? formState.value.timezone_code : null,
      type: formState.value.type ? formState.value.type : null,
      tag_id: formState.value.type == 'event' ? formState.value.tag_id : null,
      is_private: formState.value.is_private ? 1 : 0,
      default_permission: formState.value.role || 'viewer',
      freq: formState.value.rrule?.freq ? formState.value.rrule?.freq : null,
      interval: formState.value.rrule?.interval ?? 1,
      count: formState.value.rrule?.count ?? null,
      until: formState.value.rrule?.until
        ? dayjs(formState.value.rrule?.until).format("YYYY-MM-DD HH:mm:ss")
        : null,
      byweekday: formState.value.rrule?.byweekday.length
        ? formState.value.rrule.byweekday
        : null,
      bymonthday: formState.value.rrule?.bymonthday.length
        ? formState.value.rrule.bymonthday
        : null,
      bymonth: formState.value.rrule?.bymonth.length
        ? formState.value.rrule.bymonth
        : null,
    };

    // Kiểm tra thời gian trước khi lưu
    const canProceed = await checkPossibleTime(
      formState.value.start,
      formState.value.end,
      formState.value.timezone_code
    );

    if (!canProceed) {
      isLoading.value = false;
      return;
    }

    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}tasks`, dataApi, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    
    if (res.data.code === 200) {

      if(presignedUrls.value && presignedUrls.value.length > 0) {
        await Promise.all(
          presignedUrls.value.map(async (info, index) => {
            // Upload file to S3
            try {
              await axios.put(info.url, fileUploads.value[index], {
                headers: {
                  "Content-Type": info.metadata.mime
                }
              });

              // Save file information to database with required fields
              await axios.post(
                `${dirApi}file-entry/store/file`,
                {
                  files: [{
                    file_name: info.metadata.file_name,
                    client_name: info.metadata.client_name,
                    extension: info.metadata.extension,
                    size: info.metadata.size,
                    mime: info.metadata.mime,
                    task_id: res.data.data.id
                  }]
                },
                {
                  headers: { 
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
            } catch (error) {
              console.error("Error uploading file:", error);
            }
          })
        );
      }

      message.success(t('eventModal.message.success'));
      emit("save", dataApi);
      resetForm();
      filePresignedMap.value = {};
      emit("cancel");
    }

  } catch (error) {
    console.log("Loi", error);
  } finally {
    isLoading.value = false;
  }
};

// Submit form add
const handleSubmitAdd = async () => {
  try {
    // Kiểm tra validation trước khi tiếp tục
    await formRef.value.validate();
    
    if (formState.value.attendees.length > 0) {
      Modal.confirm({
        title: t('options.sendMail.title'),
        content: t('options.sendMail.content'),
        okText: t('options.sendMail.send'),
        width: 600,
        centered: true,
        onCancel() {
          Modal.destroyAll()
        },
        footer: () =>
          h("div", { class: "w-full flex justify-end space-x-4 p-4" }, [
            // Nút "Quay lại"
            h("button",
              {
                class: "text-gray-500 hover:text-gray-700 border-0 px-4 py-2 cursor-pointer font-semibold rounded-lg transition duration-200 text-sm",
                onClick: () => Modal.destroyAll(),
              },t('options.sendMail.back')),

            // Nút "Không gửi"
            h(
              "button",
              {
                class: "text-red-500 hover:text-red-700 border-0 rounded-lg px-4 py-2 cursor-pointer font-semibold transition duration-200 text-sm",
                onClick: () => {
                  formState.value.sendMail = "no";
                  Modal.destroyAll();
                  handleSave();
                },
              },
              t('options.sendMail.dontSend')
            ),

            // Nút "Gửi"
            h(
              "button",
              {
                class: "text-blue-500 hover:text-blue-700 hover:bg-gray-200 rounded-lg px-4 py-2 cursor-pointer font-semibold border-0 transition duration-200 text-sm",
                onClick: () => {
                  formState.value.sendMail = "yes";
                  Modal.destroyAll();
                  handleSave();
                },
              },
              t('options.sendMail.send')
            ),
          ]),
      });
    } else {
      // Nếu không có attendees, gửi luôn
      handleSave();
    }
  } catch (error) {
    
  }
};

let reminderWarningShown = false;

const addReminder = () => {
  if (!Array.isArray(formState.value.reminder)) {
    formState.value.reminder = [];
  }

  if (formState.value.reminder.length < 3) {
    formState.value.reminder.push({ type: "email", time: 5, unit: "minutes" });
  } else {
    if (!reminderWarningShown) {
      reminderWarningShown = true;
      message.warning(t('validation.reminder.max'));

      setTimeout(() => {
        reminderWarningShown = false;
      }, 3000);
    }
  }
};
const formatReminders = (reminders) => {
  if (!Array.isArray(reminders)) {
    return [];
  }

  const formattedReminders = reminders.map(({ type, time, unit }) => ({
    type,
    set_time: unit === "hours" ? time * 60 : time, // Chuyển đổi giờ thành phút
  }));

  // Loại bỏ các phần tử trùng lặp
  return formattedReminders.filter((reminder, index, self) =>
    index === self.findIndex((r) => r.type === reminder.type && r.set_time === reminder.set_time)
  );
};
const removeReminder = (index) => {
  formState.value.reminder.splice(index, 1);
  // Tắt nhắc nhở nếu không còn reminder nào
  if (formState.value.reminder.length == 0) {
    formState.value.is_reminder = false;
  }
};
const handleCancel = () => {
  formRef.value?.clearValidate();
  presignedUrls.value = [];
  resetForm();
  emit("cancel");
};

// Lấy thông tin khách mời
const state = ref({
  data: [],
  fetching: false
});

let lastFetchId = 0;

const fetchUser = debounce(async (value) => {
  if (!value) {
    state.value.data = [];
    return;
  }

  lastFetchId += 1;
  const fetchId = lastFetchId;

  state.value.fetching = true;
  
  try {
    const response = await axios.get(`${dirApi}guest?search=${value}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (fetchId !== lastFetchId) return;

    state.value.data = response.data.data
      .map((user) => ({
          label: {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar
          },
          value: user.id,
      }));
  } catch (error) {
    console.error('Error fetching users:', error);
    state.value.data = [];
  } finally {
    state.value.fetching = false;
  }
}, 300);
// Kết thúc hàm lấy thông tin khách mời

// Hiển thị khách mời
const handleUserSelect = (user) => {
  const exists = formState.value.attendees.some(attendee => attendee.user_id == user.value);
  if (exists) {
    message.info(t('attendees.exists'));
    return;
  }

  formState.value.attendees.push({
    avatar: user.label.avatar,
    email: user.label.email,
    first_name: user.label.first_name,
    last_name: user.label.last_name,
    role: "viewer",
    status: "pending",
    user_id: user.value
  });
};

// Đổi quyền khách mời
const handleRoleChange = (user, newRole) => {
    user.role = newRole;
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Xóa khách mời
const removeAttendee = (user) => {
  formState.value.attendees = formState.value.attendees.filter(att => att.user_id != user.user_id);
}

// Reset data khi component thay đổi
watch(state, () => {
  state.value.data = [];
  state.value.fetching = false;
});

// Format lại mảng của người tham gia
const transformAttendeesData = (data) => {
  return data.map(option => ({
    user_id: option.user_id,
    status: 'pending',
    role: option.role
  }));
};

// search select timezone
const filterOption = (input, option) => {
  return option.value.toLowerCase().includes(input.toLowerCase());
};

// lấy offset timezone
const getGmtOffset = (tz) => {
  const offset = moment.tz(tz).utcOffset(); // Lấy offset tính bằng phút
  return `UTC${offset >= 0 ? "+" : ""}${offset / 60}`; // Định dạng UTC
};

// cập nhật giờ thông báo
watch(
  () => formState.value.reminder,
  (newReminders) => {
    newReminders.forEach((reminder) => {
      if (reminder.unit === "hours" && reminder.time > 24) {
        message.warning(t('eventModal.sections.reminder.warning.maxHours'));
        reminder.time = 24; // Giới hạn tối đa 24 giờ
      }
      if (reminder.unit === "minutes" && reminder.time > 60) {
        reminder.unit = "hours"; // Chuyển sang giờ
        reminder.time = Math.floor(reminder.time / 60); // Chuyển đổi thành giờ
      }
    });
  },
  { deep: true }
);

// Cập nhật các trường về dạng mặc định khi đổi qua loại sự kiện là task
const resetEventSpecificFields = () => {
  formState.value.attendees = [];
  formState.value.is_busy = false;
};

// chọn thứ mặc định khi chọn lặp tuần
watch(
  () => formState.value.rrule?.freq,
  (newVal) => {
    if (newVal === 'weekly' && formState.value.start) {
      const startDay = dayjs(formState.value.start).day();
      const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      formState.value.rrule.byweekday = [weekdays[startDay]];
    } else if (newVal === 'monthly' && formState.value.start) {
      // Lấy ngày trong tháng từ ngày bắt đầu
      const startDay = dayjs(formState.value.start).date();
      formState.value.rrule.bymonthday = [startDay];
    }
  }
);

// chọn mặc định thứ của ngày bắt đầu khi không chọn thứ
watch(
  () => formState.value.rrule?.byweekday,
  (newVal) => {
    if (formState.value.rrule?.freq === 'weekly' && (!newVal || newVal.length === 0) && formState.value.start) {
      
      const startDay = dayjs(formState.value.start).day();
      
      const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      formState.value.rrule.byweekday = [weekdays[startDay]];
    }
  }
);

watch(
  () => formState.value.rrule?.bymonthday,
  (newVal) => {
    if (formState.value.rrule?.freq === 'monthly' && (!newVal || newVal.length === 0) && formState.value.start) {
      // Lấy ngày trong tháng từ ngày bắt đầu
      const startDay = dayjs(formState.value.start).date();
      formState.value.rrule.bymonthday = [startDay];
    }
  }
);

const filePresignedMap = ref({});
// handle before upload
const handleBeforeUpload = async (info) => {
  const { file, fileList } = info;

  // Trường hợp người dùng xóa file
  if (file.status === 'removed') {
    // Xóa khỏi fileUploads
    fileUploads.value = fileUploads.value.filter(f => f.uid !== file.uid);

    // Xóa khỏi danh sách attachments hiển thị
    formState.value.attachments = formState.value.attachments.filter(f => f.uid !== file.uid);

    // Xóa presigned URL tương ứng
    delete filePresignedMap.value[file.uid];

    // Cập nhật lại danh sách presignedUrls
    presignedUrls.value = Object.values(filePresignedMap.value);

    console.log('Đã xóa file:', file.name);
    console.log('Danh sách presigned còn lại:', presignedUrls.value);
    return false;
  }

  // Trường hợp người dùng thêm file
  const newFiles = fileList
    .filter(f => f.originFileObj && !filePresignedMap.value[f.uid]) // Tránh reupload file đã xử lý
    .map(f => f.originFileObj);

  if (newFiles.length === 0) return false;

  const formData = new FormData();
  newFiles.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });

  try {
    const { data } = await axios.post(
      `${dirApi}s3/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('API Response:', data);

    if (data.presigned_urls && data.presigned_urls.length > 0) {
      data.presigned_urls.forEach((url, index) => {
        const uid = fileList[fileList.length - data.presigned_urls.length + index]?.uid;
        if (uid) {
          filePresignedMap.value[uid] = url;
        }
      });

      // Cập nhật danh sách presignedUrls
      presignedUrls.value = Object.values(filePresignedMap.value);

      // Cập nhật fileUploads
      fileUploads.value = fileList
        .filter(f => f.originFileObj)
        .map(f => f.originFileObj);

      console.log('File uploads:', fileUploads.value);
    } else {
      console.warn('No presigned URLs received');
    }

  } catch (error) {
    console.error("Upload failed", error);
    presignedUrls.value = [];
    fileUploads.value = [];
    filePresignedMap.value = {};
  }

  return false; // Ngăn Upload tự động xử lý
};


// Hàm xóa file đính kèm
const removeAttachment = (index) => {
  fileUploads.value.splice(index, 1);
  
  // Xóa presignedUrl tương ứng
  if (presignedUrls.value && presignedUrls.value.length > index) {
    presignedUrls.value.splice(index, 1);
  }

  console.log('File Uploads:', fileUploads.value);
  console.log('Presigned URLs:', presignedUrls.value);
};

watch(
  [
    () => formState.value.type,
    () => formState.value.start,
    () => formState.value.end,
    () => formState.value.is_all_day
  ],
  ([newType, newStart, newEnd, isAllDay]) => {
    const startDate = newStart ? dayjs(newStart) : null;
    const endDate = newEnd ? dayjs(newEnd) : null;

    //Kiểm tra nếu là "task"
    if (newType === 'task' && startDate && endDate) {
      if (isAllDay) {
        const expectedStart = startDate.startOf('day');
        const expectedEnd = startDate.add(1, 'day').startOf('day');

        if (!startDate.isSame(expectedStart)) {
          formState.value.start = expectedStart;
        }

        if (!endDate.isSame(expectedEnd)) {
          formState.value.end = expectedEnd;
        }
      } else {
        // Nếu end không cùng ngày với start, sửa lại end
        if (!endDate.isSame(startDate, 'day')) {
          const expectedEnd = startDate.endOf('day');
          if (!endDate.isSame(expectedEnd)) {
            formState.value.end = expectedEnd;
          }
        }
      }

      //Reset các trường phụ nếu là task
      formState.value.attendees = [];
      formState.value.is_busy = false;
      formState.value.is_private = false;
      formState.value.is_reminder = false;
      formState.value.reminder = [];
      formState.value.location = '';
      formState.value.link = '';
      formState.value.sendMail = null;
      formState.value.attachments = [];
      presignedUrls.value = [];
    }

    // Kiểm tra nếu thời gian start trong quá khứ
    formState.value.isPastTime = startDate ? startDate.isBefore(dayjs(), 'minute') : false;
  }
);


watch(
  () => formState.value.is_reminder,
  (newVal) => {
    if (newVal && (!formState.value.reminder || formState.value.reminder.length === 0)) {
      formState.value.reminder = [{ type: "email", time: 5, unit: "minutes" }];
    }
  }
);

const results = ref([]);
let debounceTimeout = null;
const loadingSearchLocation = ref(false)

// Hàm xử lý khi người dùng nhập vào input
const onInput = async () => {

  if (formState.value.location.trim() === '') {
    results.value = [];
    return;
  }

  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(async () => {
    if (formState.value.location.length < 3) {
      results.value = [];
      return;
    }

    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formState.value.location)}&format=json&addressdetails=1&limit=5`)
    results.value = await res.json()
  }, 300)
}

const selectPlace = (place) => {
  formState.value.location = place.display_name;
  results.value = [];
}
</script>

<template>
  <Drawer 
    :open="isAddEventModalVisible" 
    :title="t(`eventModal.title`)" 
    @close="handleCancel"
    width="50%"
    class="event-drawer"
  >
    <template #extra>
      <Button type="primary" @click="handleSubmitAdd" class="rounded-md" :loading="isLoading">{{ t('eventModal.save') }}</Button>
    </template>
    <Form layout="vertical" :rules="rules" :required-mark="false" :model="formState" ref="formRef">
      <div class="h-full flex flex-col">
        <div class="flex-1">
          <!-- Warning message for past time -->
          <div v-if="formState.isPastTime" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center text-yellow-800">
              <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#6b7280" width="18" height="18" class="mr-2"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>time-history</title> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"></rect> </g> <g id="icons_Q2" data-name="icons Q2"> <path d="M46,24A22,22,0,0,1,4.3,33.7a2,2,0,0,1,.5-2.6,2,2,0,0,1,3,.7A18,18,0,1,0,10.6,12h5.3A2.1,2.1,0,0,1,18,13.7,2,2,0,0,1,16,16H6a2,2,0,0,1-2-2V4.1A2.1,2.1,0,0,1,5.7,2,2,2,0,0,1,8,4V8.9A22,22,0,0,1,46,24Z"></path> <path d="M34,32a1.7,1.7,0,0,1-1-.3L22,25.1V14a2,2,0,0,1,4,0v8.9l9,5.4a1.9,1.9,0,0,1,.7,2.7A1.9,1.9,0,0,1,34,32Z"></path> </g> </g> </g></svg>
              <span>{{ t('eventModal.sections.pastTime.message') }}</span>
            </div>
          </div>

          <!-- Title Section -->
          <div class="form-section">
            <div class="section-title">
              <EditOutlined class="text-gray-500 mr-2" />
              <span>{{ t('eventModal.sections.title.label') }}</span><span class="text-red-500 ml-1">*</span>
            </div>
            <div class="flex items-center">
              <Form.Item name="title" class="mb-0 flex-1">
                <Input v-model:value="formState.title" :placeholder="t('eventModal.sections.title.placeholder')" class="bg-gray-50 rounded-lg">
                </Input>
              </Form.Item>
            </div>
          </div>

          <!-- Event Type Section -->
          <div class="form-section">
            <div class="section-title">
              <TagOutlined class="text-gray-500 mr-2" />
              <span>{{ t('eventModal.sections.eventType.label') }}</span>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Form.Item name="type" class="mb-0">
                <template #label>
                  {{ t('eventModal.sections.eventType.type') }}
                </template>
                <Select v-model:value="formState.type" :placeholder="t('eventModal.sections.eventType.label')" class="rounded-lg w-full">
                  <Select.Option value="event">{{ t('eventModal.sections.eventType.options.event') }}</Select.Option>
                  <Select.Option value="task">{{ t('eventModal.sections.eventType.options.task') }}</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="color_code" class="mb-0">
                <template #label>
                  {{ t('eventModal.sections.color.label') }}
                </template>
                <a-select v-model:value="formState.color_code" :placeholder="t('eventModal.sections.color.label')" class="rounded-lg w-full">
                  <a-select-option v-for="color in colors" :key="color.value" :value="color.value">
                    <div class="flex items-center">
                      <div class="h-4 w-4 rounded-full mr-2" :style="{ backgroundColor: color.value }"></div>
                      <span>{{ t(`eventModal.sections.color.options.${color.label}`) }}</span>
                    </div>
                  </a-select-option>
                </a-select>
              </Form.Item>

              <Form.Item name="tag" class="mb-0" v-if="formState.type == 'event'">
                <template #label>
                  {{ t('eventModal.sections.eventType.tag') }}
                </template>
                <Select v-model:value="formState.tag_id" :placeholder="t('eventModal.sections.eventType.label')" class="rounded-lg w-full">
                  <Select.Option v-for="tag in tags" :key="tag.id" :value="tag.id">
                    {{ tag.name }}
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <!-- Date and Time Section -->
          <div class="form-section">
            <div class="section-title">
              <CalendarOutlined class="text-gray-500 mr-2" />
              <span>{{ t('eventModal.sections.dateTime.label') }}</span>
            </div>
            <div class="grid grid-cols-1 gap-3">
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Form.Item name="start" class="mb-0">
                  <template #label>
                    {{ t('eventModal.sections.dateTime.start') }}<span class="text-red-500 ml-1">*</span>
                  </template>
                  <DatePicker 
                    v-model:value="formState.start" 
                    :show-time="!formState.is_all_day"
                    class="w-full rounded-lg" 
                    :format="formState.is_all_day ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                    :disabled-time="formState.is_all_day ? () => ({ disabledHours: () => Array.from({ length: 24 }, (_, i) => i) }) : undefined"
                    :allow-clear="false"
                  >
                    <template #prefix>
                      <CalendarOutlined class="text-gray-400" />
                    </template>
                  </DatePicker>
                </Form.Item>
                <Form.Item name="end" class="mb-0">
                  <template #label>
                    {{ t('eventModal.sections.dateTime.end') }}<span class="text-red-500 ml-1">*</span>
                  </template>
                  <DatePicker 
                    v-model:value="formState.end" 
                    :show-time="!formState.is_all_day"
                    class="w-full rounded-lg" 
                    :format="formState.is_all_day ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                    :disabled-time="formState.is_all_day ? () => ({ disabledHours: () => Array.from({ length: 24 }, (_, i) => i) }) : undefined"
                    :allow-clear="false"
                  >
                    <template #prefix>
                      <CalendarOutlined class="text-gray-400" />
                    </template>
                  </DatePicker>
                </Form.Item>
              </div>
              <Form.Item v-if="formState.type != 'task'" :label="t('eventModal.sections.dateTime.timezone')" name="timezone" class="mb-0">
                <a-select
                  v-model:value="formState.timezone_code"
                  show-search
                  :placeholder="t('eventModal.sections.dateTime.timezone')"
                  :filter-option="filterOption"
                  class="w-full rounded-lg"
                >
                  <template #prefix>
                    <GlobalOutlined class="text-gray-400" />
                  </template>
                  <a-select-option v-for="timezone in timezones" :key="timezone" :value="timezone">
                    {{ timezone }} - {{ getGmtOffset(timezone) }}
                  </a-select-option>
                </a-select>
              </Form.Item>
              <div class="flex items-center">
                <Form.Item name="is_all_day" class="mb-0">
                  <Checkbox v-model:checked="formState.is_all_day">{{ t('eventModal.sections.dateTime.allDay') }}</Checkbox>
                </Form.Item>
                <Form.Item name="is_repeat" class="mb-0 ml-6">
                  <Checkbox v-model:checked="formState.is_repeat">{{ t('eventModal.sections.dateTime.repeat') }}</Checkbox>
                </Form.Item>
              </div>
            </div>
          </div>
    
          <!-- Recurrence Section -->
          <template v-if="formState.is_repeat">
            <div class="form-section">
              <div class="section-title">
                <CalendarOutlined class="text-gray-500 mr-2" />
                <span>{{ t('eventModal.sections.recurrence.label') }}</span>
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-7">
                <div class="space-y-4 col-span-3">
                  <div>
                    <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.type') }}</label>
                    <Select v-model:value="formState.rrule.freq" :options="freqOptions" class="w-full" />
                  </div>

                  <div v-if="formState.rrule.freq === 'weekly'">
                    <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.weekDays.label') }}</label>
                    <Checkbox.Group v-model:value="formState.rrule.byweekday" :options="weekDays" 
                      class="grid grid-cols-4 gap-2" />
                  </div>

                  <div v-if="formState.rrule.freq === 'monthly'">
                    <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.monthDays.label') }}</label>
                    <a-select v-model:value="formState.rrule.bymonthday" mode="multiple"
                      :placeholder="t('eventModal.sections.recurrence.monthDays.placeholder')" class="w-full"
                      :options="monthDays.map(day => ({ label: `${t('eventModal.sections.recurrence.monthDays.label')} ${day}`, value: day }))" />
                  </div>

                  <div>
                    <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.interval.label') }}</label>
                    <Form.Item name="rrule.interval" class="mb-0">
                      <Input v-model:value="formState.rrule.interval" 
                        type="number" 
                        min="1"
                        :max="999"
                        @input="(e) => {
                          const value = parseInt(e.target.value);
                          if (value < 1) formState.rrule.interval = 1;
                        }"
                        @blur="!formState.rrule.interval || formState.rrule.interval < 1 ? formState.rrule.interval = 1 : formState.rrule.interval" 
                        class="w-full" />
                    </Form.Item>
                  </div>
                </div>

                <div class="space-y-4 col-span-4">
                  <div class="flex flex-col gap-2 mb-8">
                    <label class="text-gray-700 font-medium">{{ t('eventModal.sections.recurrence.endType.label') }}</label>
                    <a-radio-group v-model:value="formState.rrule.endType" class="flex">
                      <a-radio value="">{{ t('eventModal.sections.recurrence.endType.never') }}</a-radio>
                      <a-radio value="until">{{ t('eventModal.sections.recurrence.endType.until') }}</a-radio>
                      <a-radio value="count">{{ t('eventModal.sections.recurrence.endType.count') }}</a-radio>
                    </a-radio-group>
                  </div>

                  <div class="grid grid-cols-1">
                    <div v-if="formState.rrule.endType === 'count'">
                      <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.count.label') }}</label>
                      <Form.Item name="rrule.count" class="mb-0">
                        <Input v-model:value="formState.rrule.count" type="number" min="1" :placeholder="t('eventModal.sections.recurrence.count.placeholder')"
                          class="w-full" />
                      </Form.Item>
                    </div>

                    <div v-if="formState.rrule.endType === 'until'">
                      <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.until.label') }}</label>
                      <Form.Item name="rrule.until" class="mb-0">
                        <a-date-picker v-model:value="formState.rrule.until" :placeholder="t('eventModal.sections.recurrence.until.placeholder')"
                          class="w-full" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Description Section -->
          <div class="form-section">
            <div class="flex justify-between items-center">
              <div class="section-title">
                <AlignLeftOutlined class="text-gray-500 mr-2" />
                <span>{{ t('eventModal.sections.description.label') }}</span>
              </div>
              <div class="section-title" v-if="formState.type == 'event'">
                <!-- <PaperClipOutlined class="text-gray-500 mr-2" /> -->
                <Upload
                  v-model:file-list="formState.attachments"
                  :before-upload="() => false"
                  multiple
                  @change="handleBeforeUpload"
                  list-type="picture-card"
                  :max-count="5"
                  class="text-blue-600 cursor-pointer hover:text-blue-800"
                >
                  {{ t('eventModal.sections.description.addAttachment') }}
                </Upload>
              </div>
            </div>

            <Editor
              v-model="formState.description"
              editorStyle="min-height: 200px; max-height: 400px; overflow-y: auto; background-color: white;"
              class="w-full"
              :pt="{
                toolbar: {
                  root: { class: 'bg-gray-50 p-2' }
                },
                content: {
                  root: { class: 'bg-white' }
                }
              }"
              :toolbar="[
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                ['list-ordered', 'list-unordered', 'indent-left', 'indent-right'],
                ['align-left', 'align-center', 'align-right', 'align-justify'],
                ['text-color', 'background-color'],
                ['link', 'image', 'video'],
                ['code-block', 'blockquote'],
                ['script-sub', 'script-super'],
                ['clean']
              ]"
            />
          </div>

          <!-- Location Section -->
          <div class="form-section" v-if="formState.type == 'event'">
            <div class="section-title">
              <EnvironmentOutlined class="text-gray-500 mr-2" />
              <span>{{ t('eventModal.sections.location.label') }}</span>
            </div>
            <Form.Item name="location" class="mb-0">
              <Input v-model:value="formState.location" :placeholder="t('eventModal.sections.location.placeholder')" class="bg-gray-50 rounded-lg"
              @input="onInput" />
            </Form.Item>

            <!-- Kết quả tìm kiếm -->
            <ul 
              v-if="results.length" 
              class="mt-2 border bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto w-full transition-all ease-in-out duration-300"
            >
              <li 
                v-for="(item, index) in results" 
                :key="index" 
                @click="selectPlace(item)"
                class="p-2 cursor-pointer hover:bg-gray-100 list-none flex items-center transition-all ease-in-out duration-200"
              >
                <EnvironmentOutlined class="text-gray-500 mr-2" />
                {{ item.display_name }}
              </li>
            </ul>
          </div>

          <!-- Participants Section -->
          <div class="form-section" v-if="formState.type == 'event'">
            <div class="section-title">
              <UserOutlined class="text-gray-500 mr-2" />
              <span>{{ t('eventModal.sections.participants.label') }}</span>
            </div>
            <div class="space-y-4">
              <Form.Item name="attendees" class="mb-0">
                <a-select
                  label-in-value
                  show-search
                  :placeholder="t('eventModal.sections.participants.placeholder')"
                  class="w-full rounded-lg"
                  :filter-option="false"
                  :value="null"
                  :not-found-content="state.fetching ? undefined : null"
                  :options="state.data"
                  @select="handleUserSelect"
                  @search="fetchUser"
                >
                  <template #prefix>
                    <TeamOutlined class="text-gray-400" />
                  </template>
                  <!-- <template v-if="state.fetching" #notFoundContent>
                    <a-spin size="small" />
                  </template> -->
                  <template #option="{ label, value }">
                    <div class="flex items-center">
                        <a-avatar :src="label.avatar || unknowUser" :size="24" class="mr-2" />
                        <div>
                            <div class="font-medium">{{ label.first_name }} {{ label.last_name }}</div>
                            <div class="text-xs text-gray-500">{{ label.email }}</div>
                        </div>
                    </div>
                  </template>
                </a-select>

                <!-- List attendees -->
                <div v-if="formState.attendees && formState.attendees.length > 0" class="max-h-[200px] overflow-y-auto rounded-xl shadow-md bg-white p-2 my-1">
                  <div v-for="(user, index) in formState.attendees" :key="index"
                      class="flex items-center p-1 border-b last:border-b-0 hover:bg-gray-100 rounded-lg">
                      <a-avatar class="w-7 h-7" :src="user.avatar || unknowUser">
                      </a-avatar>

                      <div class="ml-3">
                          <div class="font-medium text-sm">{{ user.first_name }} {{ user.last_name }}</div>
                          <div class="text-xs text-gray-500">{{ user.email }}</div>
                      </div>

                      <div class="ml-auto flex items-center">
                          <a-dropdown :trigger="['click']">
                              <template #overlay>
                                  <a-menu>
                                      <a-menu-item key="editor"
                                          @click="() => handleRoleChange(user, 'editor')">{{ $t('event.roles.editor') }}</a-menu-item>
                                      <a-menu-item key="viewer"
                                          @click="() => handleRoleChange(user, 'viewer')">{{ $t('event.roles.viewer') }}</a-menu-item>
                                  </a-menu>
                              </template>
                              <a-button type="text" size="small">
                                  {{ capitalizeFirstLetter(t(`attendees.${user.role}`)) }}
                                  <CaretDownOutlined />
                              </a-button>
                          </a-dropdown>
                          <!-- <a-tag :color="getStatusColor(user.status)" class="ml-2">{{
                              capitalizeFirstLetter(t(`attendees.${user.status}`))
                          }}</a-tag> -->
                          <a-button type="text" danger size="small" class="ml-2"
                              @click="() => removeAttendee(user)">
                              <DeleteOutlined />
                          </a-button>
                      </div>
                  </div>
                </div>
              </Form.Item>
              <div class="flex gap-3">
                <span>{{ t('eventModal.sections.participants.permissions.label') }}</span>
                <div class="flex gap-4 items-center">
                  <a-radio-group v-model:value="formState.role" class="flex gap-4">
                    <a-radio value="viewer">{{ t('eventModal.sections.participants.permissions.viewer') }}</a-radio>
                    <a-radio value="editor">{{ t('eventModal.sections.participants.permissions.editor') }}</a-radio>
                  </a-radio-group>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section flex flex-col gap-2">
            <!-- Privacy and Notification Section -->
            <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div v-if="formState.type == 'event'">
                <div class="section-title">
                  <LockOutlined class="text-gray-500 mr-2" />
                  <span>{{ t('eventModal.sections.privacy.label') }}</span>
                </div>
                <div class="flex gap-6 items-center">
                  <Form.Item name="is_private" class="mb-0">
                    <Checkbox v-model:checked="formState.is_private">{{ t('eventModal.sections.privacy.private') }}</Checkbox>
                  </Form.Item>
                  <Form.Item name="is_busy" class="mb-0">
                    <Checkbox v-model:checked="formState.is_busy">{{ t('eventModal.sections.privacy.busy') }}</Checkbox>
                  </Form.Item>
                </div>
              </div>
  
              <div>
                <div class="section-title">
                  <BellOutlined class="text-gray-500 mr-2" />
                  <span>{{ t('eventModal.sections.notifications.label') }}</span>
                </div>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <Form.Item name="is_reminder" class="mb-0">
                      <Checkbox v-model:checked="formState.is_reminder">{{ t('eventModal.sections.notifications.enable') }}</Checkbox>
                    </Form.Item>
                    <div v-if="formState.is_reminder" @click="addReminder" class="cursor-pointer">
                      <a class="text-blue-600 hover:text-blue-800">{{ t('eventModal.sections.notifications.add') }}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="formState.is_reminder" class="space-y-2 w-full">
              <div v-for="(reminder, index) in formState.reminder" :key="index" 
                class="bg-gray-50 p-2 rounded-lg">
                <Row :gutter="8" align="middle">
                  <Col span="8" class="flex items-center">
                    <Select 
                      v-model:value="reminder.type" 
                      :placeholder="t('eventModal.sections.notifications.types.label')" 
                      class="w-full text-sm"
                      size="small"
                    >
                      <Select.Option value="email">{{ t('eventModal.sections.notifications.types.email') }}</Select.Option>
                      <Select.Option value="web">{{ t('eventModal.sections.notifications.types.web') }}</Select.Option>
                    </Select>
                    <span class="ml-2 text-sm">{{ t('eventModal.sections.notifications.before') }}</span>
                  </Col>
                  <Col span="6">
                    <InputNumber 
                      v-model:value="reminder.time" 
                      min="1"
                      size="small"
                      @blur="reminder.time = reminder.time || 1" 
                      :placeholder="t('eventModal.sections.notifications.time')"
                      class="w-full text-sm" 
                    />
                  </Col>
                  <Col span="7">
                    <Select 
                      v-model:value="reminder.unit" 
                      :placeholder="t('eventModal.sections.notifications.units.label')" 
                      class="w-full text-sm"
                      size="small"
                    >
                      <Select.Option value="minutes">{{ t('eventModal.sections.notifications.units.minutes') }}</Select.Option>
                      <Select.Option value="hours">{{ t('eventModal.sections.notifications.units.hours') }}</Select.Option>
                    </Select>
                  </Col>
                  <Col span="3">
                    <Button 
                      type="text" 
                      size="small"
                      @click="removeReminder(index)" 
                      class="text-red-500 hover:!text-red-700 px-1"
                    >
                      <DeleteOutlined class="text-lg" />
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </div>

          <!-- URL Section -->
          <div class="form-section"  v-if="formState.type == 'event'">
            <div class="section-title">
              <LinkOutlined class="text-gray-500 mr-2" />
              <span>{{ t('eventModal.sections.link.label') }}</span>
            </div>
            <Form.Item name="link" class="mb-0">
              <Input v-model:value="formState.link" :placeholder="t('eventModal.sections.link.placeholder')" class="bg-gray-50 rounded-lg">
              </Input>
            </Form.Item>
          </div>
        </div>
      </div>
    </Form>
  </Drawer>
</template>

<style scoped>
.form-section {
  background-color: white;
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.event-drawer :deep(.ant-drawer-content-wrapper) {
  max-width: 80%;
}

.event-drawer :deep(.ant-drawer-content) {
  overflow: hidden;
}

.event-drawer :deep(.ant-drawer-wrapper-body) {
  overflow: hidden;
}

.event-drawer :deep(.ant-drawer-header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.event-drawer :deep(.ant-drawer-body) {
  padding: 16px;
  height: calc(100% - 55px);
  overflow: hidden;
}

.event-drawer :deep(.ant-form) {
  height: 100%;
  overflow: hidden;
}

.event-drawer :deep(.flex-1) {
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.form-section {
  margin-bottom: .75rem;
}

.event-drawer :deep(.ant-input),
.event-drawer :deep(.ant-select-selector),
.event-drawer :deep(.ant-picker) {
  border-radius: 0.5rem !important;
  height: 32px !important;
  border-color: #d9d9d9;
  width: 100%;
}

.event-drawer :deep(.ant-input:hover),
.event-drawer :deep(.ant-select-selector:hover),
.event-drawer :deep(.ant-picker:hover) {
  border-color: #4096ff;
}

.event-drawer :deep(.ant-input-textarea textarea) {
  height: 60px !important;
  border-radius: 0.5rem;
}

.event-drawer :deep(.ant-btn) {
  border-radius: 0.5rem;
  height: 32px;
  font-weight: 500;
}

.event-drawer :deep(.ant-tag) {
  border-radius: 0.5rem;
  padding: 0 6px;
  height: 22px;
  line-height: 20px;
  font-size: 12px;
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #595959;
}

.event-drawer :deep(.ant-checkbox-wrapper) {
  margin-right: 0 !important;
  font-size: 13px;
}

.event-drawer :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

.event-drawer :deep(.ant-select-multiple .ant-select-selector) {
  padding: 0 4px !important;
  min-height: 32px;
}

.event-drawer :deep(.ant-select-multiple .ant-select-selection-item) {
  margin: 2px 4px;
  padding: 0 6px;
  height: 22px;
  line-height: 20px;
  font-size: 12px;
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  border-radius: 0.5rem;
  max-width: calc(100% - 8px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-drawer :deep(.ant-select-multiple .ant-select-selection-item-remove) {
  margin-left: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.event-drawer :deep(.ant-input-number) {
  width: 100% !important;
}

.event-drawer :deep(.ant-input-number-input) {
  height: 30px !important;
}

.event-drawer :deep(.ant-switch) {
  height: 20px;
  min-width: 36px;
}

.event-drawer :deep(.ant-switch-inner) {
  height: 16px;
  font-size: 12px;
}

.event-drawer :deep(.ant-radio-wrapper) {
  font-size: 13px;
}

.event-drawer :deep(.ant-select-selection-item) {
  font-size: 13px;
}

.event-drawer :deep(.ant-select-selection-placeholder) {
  font-size: 13px;
  line-height: 30px;
  color: #8c8c8c;
}

.event-drawer :deep(.ant-input-affix-wrapper) {
  border-radius: 0.5rem !important;
}

.event-drawer :deep(.ant-input-affix-wrapper .ant-input) {
  height: 32px !important;
}

.event-drawer :deep(.ant-input-affix-wrapper .ant-input-prefix) {
  margin-right: 8px;
  color: #8c8c8c;
}

.event-drawer :deep(.ant-select .ant-select-selector .ant-select-selection-item) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-drawer :deep(.ant-select .ant-select-selector .ant-select-selection-item .anticon) {
  margin-right: 4px;
}

.event-drawer :deep(.ant-picker-time-panel) {
  display: none !important;
}

.event-drawer :deep(.ant-picker-time-panel-column) {
  display: none !important;
}

/* Giảm size của thumbnail upload */
:deep(.ant-upload-list-picture-card .ant-upload-list-item-container) {
  width: 70px !important;
  height: 70px !important;
}
:deep(.ant-upload-list-picture-card .ant-upload-list-item) {
  width: 70px !important;
  height: 70px !important;
  font-size: 12px !important;
  margin: 0 !important;
}

:deep(.ant-upload-picture-card-wrapper .ant-upload-select) {
  width: 70px !important;
  height: 70px !important;
  font-size: 12px !important;
  margin: 0 !important;
}
</style>
