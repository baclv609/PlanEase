<template>
    <a-drawer :visible="visible" title="Chi tiết sự kiện" placement="right" :width="drawerWidth" @close="handleClose"
        @update:visible="(val) => emit('update:visible', val)" :destroyOnClose="true" :maskClosable="false">
        <template #extra>
            <!-- Buttons -->
            <div class="flex gap-2">
                <a-button type="primary" @click="handleSubmit">Lưu</a-button>
                <a-button>Hủy</a-button>
            </div>
        </template>
        <a-form layout="vertical" @submit.prevent="handleSubmit">
            <!-- Title -->
            <div class="flex items-center mb-4">
                <div class="w-6 h-6 mr-2">
                    <a-badge color="green" />
                </div>
                <a-input placeholder="Add title"
                    class="border-0 border-b border-gray-200 px-0 text-lg focus:shadow-none" :bordered="false"
                    v-model="formState.title" />
            </div>

            <!-- Date and Time -->
            <div class="flex items-center mb-4">
                <div class="w-6 h-6 mr-2">
                    <CalendarOutlined class="text-gray-500" />
                </div>
                <a-range-picker :value="[formState.start, formState.end]" show-time class="w-full md:w-1/2 lg:w-2/5"
                    format="YYYY-MM-DD HH:mm:ss" :disabled="formState.allDay">
                </a-range-picker>
                <div class="ml-4">
                    <a-select v-model:value="formState.timezone_code" show-search placeholder="Múi giờ"
                        :filter-option="filterOption" class="w-full"> <!-- Điều chỉnh chiều dài -->
                        <a-select-option v-for="timezone in timezones" :key="timezone" :value="timezone">
                            {{ timezone }} - {{ getGmtOffset(timezone) }}
                        </a-select-option>
                    </a-select>
                </div>
            </div>

            <!-- All day & Repeat -->
            <div class="flex items-center mb-4 ml-8">
                <a-checkbox v-model:checked="formState.allDay">Cả ngày</a-checkbox>
                <a-checkbox v-model:checked="formState.is_repeat" class="ml-6">Lặp lại</a-checkbox>
            </div>


            <!-- Location -->
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <EnvironmentOutlined class="text-gray-500" />
                </div>
                <a-input placeholder="Địa điểm" class="bg-gray-50" v-model="formState.location" />
            </div>

            <!-- Event Type -->
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <TagOutlined class="text-gray-500" />
                </div>
                <div class="w-full md:w-1/3">
                    <!-- <label class="block text-sm font-medium mb-2">Lịch trình</label> -->
                    <Select v-model:value="formState.type" placeholder="Loại sự kiện" class="w-full rounded-lg">
                        <Select.Option value="event">Sự kiện</Select.Option>
                        <Select.Option value="task">Việc cần làm</Select.Option>
                    </Select>
                </div>
                <div class="w-full md:w-1/3">
                    <a-select v-model="formState.color_code" placeholder="Chọn màu" class="w-full rounded-lg">
                        <a-select-option v-for="color in colors" :key="color.value" :value="color.value">
                            <div class="flex items-center">
                                <div class="w-4 h-4 mr-2" :style="{ backgroundColor: color.value }"></div>
                                <span>{{ color.label }}</span>
                            </div>
                        </a-select-option>
                    </a-select>
                </div>
            </div>

            <!-- Calendar -->
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <CalendarOutlined class="text-gray-500" />
                </div>
                <a-select v-model="formState.tag_id" class="w-full bg-gray-50" placeholder="Chọn loại">
                    <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id"> {{ tag.name }}</a-select-option>
                </a-select>
            </div>

            <!-- Privacy & Add to calendar -->
            <div class="flex items-center mb-4 ml-8">
                <a-checkbox v-model="formState.isPrivate">Riêng tư</a-checkbox>
                <a-checkbox v-model="formState.addToCalendar" class="ml-6">Thêm vào lịch rảnh/bận</a-checkbox>
            </div>

            <!-- URL -->
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <LinkOutlined class="text-gray-500" />
                </div>
                <a-input placeholder="Nhập url" class="bg-gray-50" v-model="formState.url" />
            </div>


            <!-- Participants -->
            <div class="flex mb-4" v-if="formState.type == 'event'">
                <div class="w-6 h-6 mr-2">
                    <UserOutlined class="text-gray-500" />
                </div>
                <div class="flex-1">
                    <a-select v-model:value="formState.attendees" v-if="formState.type == 'event'" mode="multiple"
                        label-in-value placeholder="Khách mời" style="width: 100%" :filter-option="false"
                        :not-found-content="state.fetching ? undefined : null" :options="state.data"
                        @search="fetchUser">
                        <template v-if="state.fetching" #notFoundContent>
                            <a-spin size="small" />
                        </template>
                    </a-select>
                    <!-- <a-input placeholder="Mời người tham gia cá nhân hoặc các nhóm của bạn" class="bg-gray-50 mb-1"
                        v-model="formState.participants" /> -->
                    <!-- <div class="flex items-center text-sm text-blue-600">
                        <span>Quản lý xem rảnh rỗi...</span>
                        <a-checkbox v-model="formState.allowSendMessage" class="ml-6">Cho Phép Gửi Chuyển</a-checkbox>
                    </div> -->
                    <div>
                        <a-switch v-model="formState.shareLink" /> Chia sẻ sự kiện
                        <span v-if="formState.shareLink">Link: {{ generatedLink }}</span>
                        <div class="flex mb-4">
                            <a-checkbox v-model="formState.accessView">Cho phép xem sự kiện</a-checkbox>
                            <a-checkbox v-model="formState.accessEdit" class="ml-4">Cho phép chỉnh sửa sự
                                kiện</a-checkbox>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sharing Options -->



            <!-- Notification -->
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <BellOutlined class="text-gray-500" />
                </div>
                <div class="flex items-center gap-2">
                    <Col span="24">
                    <div class="flex items-center">
                        <Checkbox v-model:checked="formState.is_reminder">Bật nhắc nhở</Checkbox>
                        <div class="flex ml-8" v-if="formState.is_reminder" @click="addReminder">
                            <a class="text-blue-600 text-sm">Thêm thông báo nhắc</a>
                        </div>

                    </div>
                    <div v-if="formState.is_reminder" class="mt-2">
                        <div v-for="(reminder, index) in formState.reminder" :key="index" class="mb-2">
                            <Row :gutter="8" align="middle">
                                <Col span="7" class="flex items-center">
                                <Select v-model:value="reminder.type" placeholder="Chọn loại nhắc nhở" style="flex: 1;">
                                    <Select.Option value="email">Email</Select.Option>
                                    <Select.Option value="web">Web</Select.Option>
                                </Select>
                                <span class="ml-4">trước</span>
                                </Col>
                                <Col span="5">
                                <InputNumber v-model:value="reminder.time" min="1"
                                    @blur="reminder.time = reminder.time || 1" placeholder="Thời gian"
                                    style="width: 100%;" />
                                </Col>
                                <Col span="5">
                                <Select v-model:value="reminder.unit" placeholder="Đơn vị" style="width: 100%;">
                                    <Select.Option value="minutes">Phút</Select.Option>
                                    <Select.Option value="hours">Giờ</Select.Option>
                                </Select>
                                </Col>
                                <Col span="3">
                                <Button type="danger" @click="removeReminder(index)">
                                    <DeleteOutlined class="text-red-500 text-xl" />
                                </Button>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    </Col>
                </div>
            </div>

            <!-- Rich Text Editor -->
            <div class="mb-4 border rounded">
                <!-- <QuillEditor v-model:content="formState.richText" contentType="html" :options="editorOptions" /> -->
            </div>


            <!-- Attachment -->
            <div class="flex mb-6">
                <div class="w-6 h-6 mr-2">
                    <PaperClipOutlined class="text-gray-500" />
                </div>
                <a class="text-blue-600 text-sm">Thêm Tập Tin Đính Kèm</a>
            </div>

            <!-- Zoho Mail Integration -->
            <!-- <div class="border rounded p-4 mb-6">
                <div class="flex items-center mb-2">
                    <LinkOutlined class="mr-2" />
                    <span class="font-medium">Liên kết với</span>
                </div>
                <div class="ml-6">
                    <a-checkbox v-model="formState.zohoMailTask">Tác Vụ Zoho Mail</a-checkbox>
                </div>
                <div class="ml-6">
                    <a-checkbox v-model="formState.zohoMailNote">Ghi Chú Zoho Mail</a-checkbox>
                </div>
            </div> -->
            <div class="my-2"></div>
            <template v-if="formState.is_repeat">
                <Card title="Cài đặt lặp lại" size="small">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-4"> <!-- Thay đổi gap và padding -->
                        <!-- Cột trái -->
                        <div class="flex flex-col space-y-6"> <!-- Tăng khoảng cách giữa các phần tử -->
                            <div class="w-full">
                                <label class="font-semibold">Kiểu lặp lại</label>
                                <Select v-model:value="formState.rrule.freq" :options="freqOptions" />
                            </div>

                            <div class="w-full" v-if="formState.rrule.freq === 'weekly'">
                                <label class="font-semibold">Ngày trong tuần</label>
                                <Checkbox.Group v-model:value="formState.rrule.byweekday" :options="weekDays" />
                            </div>

                            <div class="w-full" v-if="formState.rrule.freq === 'monthly'">
                                <label class="font-semibold">Lặp vào các ngày</label>
                                <a-select v-model:value="formState.rrule.bymonthday" mode="multiple"
                                    placeholder="Chọn ngày" style="width: 100%;"
                                    :options="monthDays.map(day => ({ label: `Ngày ${day}`, value: day }))" />
                            </div>

                            <div class="w-full">
                                <label class="font-semibold">Khoảng cách lặp lại</label>
                                <Input v-model:value="formState.rrule.interval" type="number" min="1"
                                    @blur="formState.rrule.interval = formState.rrule.interval || 1" />
                            </div>
                        </div>

                        <!-- Cột phải -->
                        <div class="flex flex-col space-y-6"> <!-- Tăng khoảng cách giữa các phần tử -->
                            <div class="w-full">
                                <label class="font-semibold">Kết thúc</label>
                                <a-radio-group v-model:value="formState.rrule.endType" class="mb-3">
                                    <a-radio value="">Không bao giờ</a-radio>
                                    <a-radio value="until">Ngày cụ thể</a-radio>
                                    <a-radio value="count">Số lần lặp</a-radio>
                                </a-radio-group>
                            </div>
                            <div class="flex gap-8"> <!-- Tăng khoảng cách giữa các cột -->
                                <div class="w-[48%]" v-if="formState.rrule.endType === 'count'">
                                    <label class="font-semibold">Giới hạn số lần lặp</label>
                                    <Input v-model:value="formState.rrule.count" type="number" min="1" class="w-full" />
                                </div>

                                <div class="w-[48%]" v-if="formState.rrule.endType === 'until'">
                                    <label class="font-semibold">Ngày kết thúc</label>
                                    <a-date-picker v-model:value="formState.rrule.until" placeholder="Chọn ngày"
                                        class="w-full" />
                                </div>

                                <div class="w-[48%]">
                                    <label class="font-semibold">Loại trừ ngày</label>
                                    <DatePicker v-model:value="selectedDate" format="YYYY-MM-DD" class="w-full"
                                        @change="handleExcludeDate" />
                                    <div v-if="formState.exclude_time.length">
                                        <Tag v-for="(date, index) in formState.exclude_time" :key="index" closable
                                            @close="removeExcludeDate(index)">
                                            {{ dayjs(date).format('YYYY-MM-DD') }}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </template>

        </a-form>
    </a-drawer>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, defineProps, defineEmits, watchEffect, watch, nextTick } from 'vue';
import {
    CalendarOutlined,
    UserOutlined,
    EnvironmentOutlined,
    TagOutlined,
    LinkOutlined,
    BellOutlined,
    DeleteOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    PaperClipOutlined
} from '@ant-design/icons-vue';
import { Button, Checkbox, Col, InputNumber, message, Row, Card, Tag, Select, DatePicker, Input } from 'ant-design-vue';
import { QuillEditor } from '@vueup/vue-quill';
import 'quill/dist/quill.snow.css';
import moment from "moment-timezone";
import debounce from 'lodash/debounce';
import axios from 'axios';

const editorOptions = {
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // In đậm, nghiêng, gạch chân, gạch ngang
            [{ list: 'ordered' }, { list: 'bullet' }], // Danh sách đánh số, gạch đầu dòng
            ['link', 'image'], // Chèn link, ảnh
            [{ align: [] }], // Căn chỉnh văn bản
        ],
    },
    placeholder: 'Nhập nội dung...',
};
const drawerWidth = ref('100%');
const props = defineProps({
    visible: Boolean,
    event: Object,
});
const emit = defineEmits(['update:visible']);

const selectedDate = ref(null);
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const timezones = moment.tz.names();
const tags = ref([]);



const updateDrawerWidth = () => {
    drawerWidth.value = window.innerWidth > 768 ? '50%' : '100%';
};
const handleClose = () => {
    // Đóng drawer và phát ra sự kiện update:visible
    emit('update:visible', false);
};

onMounted(() => {
    updateDrawerWidth();
    window.addEventListener('resize', updateDrawerWidth);
});


watch(() => props.event, async (newEvent) => {
    if (newEvent) {
        console.log("🎯 props.event:", newEvent);

        // Đợi Vue cập nhật DOM trước khi set dữ liệu
        await nextTick();

        // Cập nhật từng thuộc tính, tránh gán toàn bộ object
        formState.value.title = newEvent.title || "";
        formState.value.startDate = newEvent.start ? newEvent.start.split("T")[0] : null;
        formState.value.startTime = newEvent.start ? newEvent.start.split("T")[1].slice(0, 5) : null;
        formState.value.endDate = newEvent.end_time ? newEvent.end_time.split("T")[0] : null;
        formState.value.endTime = newEvent.end_time ? newEvent.end_time.split("T")[1].slice(0, 5) : null;
        formState.value.allDay = newEvent.is_all_day || false;
        formState.value.repeat = newEvent.recurrence > 0;
        formState.value.participants = newEvent.attendees || "";
        formState.value.location = newEvent.location || "";
        formState.value.url = newEvent.url || "";
        formState.value.richText = newEvent.description || "";
    }
}, { deep: true, immediate: true });

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDrawerWidth);
});

const formState = ref({
    id: null,
    title: '',
    start: null,
    end: null,
    allDay: false,
    repeat: false,
    attendees: [],
    sendMail: null,
    tag_id: null,
    type: "event",

    color_code: "#ff4d4f",

    is_reminder: false,
    reminder_time: [],
    reminder: [],
    is_repeat: false,
    rrule: null,

    extendedProps: {
        createdBy: "", // Người tạo sự kiện (String - Email)
        lastUpdated: null, // Thời gian cập nhật cuối (String - ISO 8601)
        notes: "", // Ghi chú bổ sung (String)
    },
    event_type: "",
    exclude_time: [],
    timezone_code: localStorage.getItem("userSettings")
        ? JSON.parse(localStorage.getItem("userSettings")).timeZone
        : "Asia/Saigon",

    participants: '',
    shareLink: false,
    location: '',
    eventType: 'meeting',
    calendar: 'luongvandon02',
    isPrivate: false,
    addToCalendar: true,
    url: '',
    notificationType: 'email',
    notificationTime: 'before',
    notificationDuration: '15',
    allowSendMessage: false,
    richText: '',
    zohoMailTask: false,
    zohoMailNote: false,
});
//  Watch khi người dùng bật/tắt chế độ lặp lại
// Watch cho is_repeat
watch(
    () => formState.value.is_repeat,
    (newValue) => {
        console.log("is_repeat đã thay đổi:", newValue);
    }
);
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
            // Giữ nguyên ngày nhưng set giờ về 00:00:00 và 23:59:59
            formState.value.start = dayjs(formState.value.start).hour(0).minute(0).second(0);
            formState.value.end = dayjs(formState.value.end).hour(23).minute(59).second(59);
        }
    }
);

const freqOptions = [
    { label: "Hàng ngày", value: "daily" },
    { label: "Hàng tuần", value: "weekly" },
    { label: "Hàng tháng", value: "monthly" },
    { label: "Hàng năm", value: "yearly" },
];

const weekDays = [
    { label: "T2", value: "MO" },
    { label: "T3", value: "TU" },
    { label: "T4", value: "WE" },
    { label: "T5", value: "TH" },
    { label: "T6", value: "FR" },
    { label: "T7", value: "SA" },
    { label: "CN", value: "SU" },
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

const addReminder = () => {
    if (!Array.isArray(formState.value.reminder)) {
        formState.value.reminder = [];
    }

    if (formState.value.reminder.length < 3) {
        formState.value.reminder.push({ type: "email", time: 5, unit: "minutes" });
    } else {
        message.warning('Chỉ được thêm tối đa 3 thông báo nhắc trước lịch');
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
};
const colors = [
    { label: 'Đỏ', value: '#ff4d4f' }, // Đỏ
    { label: 'Xanh lá cây', value: '#52c41a' }, // Xanh lá cây
    { label: 'Xanh dương', value: '#1890ff' }, // Xanh dương
    { label: 'Vàng', value: '#faad14' }, // Vàng
    { label: 'Tím', value: '#722ed1' }, // Tím
    { label: 'Xám', value: '#bfbfbf' }, // Xám
];
const selectColor = (color) => {
    formState.value.color_code = color;
};

// cập nhật giờ thông báo
watch(
    () => formState.value.reminder,
    (newReminders) => {
        newReminders.forEach((reminder) => {
            if (reminder.unit === "hours" && reminder.time > 24) {
                message.info('Chỉ được thông báo trước 24 giờ');
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


const getAllTagByUser = async () => {
    try {
        const res = await axios.get(`${dirApi}tags`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.data.code == 200) {
            tags.value = res.data.data;
        }
    } catch (error) {
        console.log('Loi lay tags', error);
    }
}
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

        state.value.data = response.data.data.map(user => ({
            label: `${user.email}`,
            value: user.id
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        state.value.data = [];
    } finally {
        state.value.fetching = false;
    }
}, 300);
// Kết thúc hàm lấy thông tin khách mời

const getGmtOffset = (timezone) => {
    const offset = moment.tz(timezone).utcOffset();
    const hours = Math.floor(Math.abs(offset / 60));
    const minutes = Math.abs(offset % 60);
    return `UTC${offset >= 0 ? '+' : '-'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
const filterOption = (input, option) => {
    return option.value.toLowerCase().includes(input.toLowerCase());
};
const handleExcludeDate = (date) => {
    if (date) {
        const formattedDate = dayjs(date).hour(dayjs(formState.value.start).hour()).minute(dayjs(formState.value.start).minute()).format("YYYY-MM-DDTHH:mm");
        if (!formState.value.exclude_time.includes(formattedDate)) {
            formState.value.exclude_time.push(formattedDate);
        }
    }
};
const handleSubmit = () => {
    const [start, end] = formState.value.start && formState.value.end;
    console.log("📌 Form Submitted:", { ...formState.value, start, end });
};

</script>

<style scoped>
:deep(.ant-input-borderless) {
    background: transparent;
}

:deep(.ant-select-selector) {
    background-color: rgb(249, 250, 251) !important;
}
/* Tăng khoảng cách giữa các phần tử */
.grid {
    gap: 1.5rem; /* Tăng khoảng cách giữa các cột */
}

.switch-checkbox {
    /* Tùy chỉnh cho checkbox nếu cần */
}

/* Tùy chỉnh cho các thành phần chọn và nhập */
.a-select, .ant-input {
    border-radius: 8px; /* Tạo góc bo tròn */
}

/* Tùy chỉnh cho Tag */
.ant-tag {
    margin-top: 0.5rem; /* Tăng khoảng cách trên cho tag */
}
</style>