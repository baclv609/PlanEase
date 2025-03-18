<template>
    <a-drawer :visible="visible" :rules="rules" title="Chi tiết sự kiện" placement="right" :width="drawerWidth"
        @close="handleClose" @update:visible="(val) => emit('update:visible', val)" :destroyOnClose="true"
        :maskClosable="false">
        <template #extra>
            <!-- Buttons -->
            <div class="flex gap-2">
                <a-button type="primary" @click="handleSubmit">Lưu</a-button>
                <a-button>Hủy</a-button>
            </div>
        </template>
        <a-form layout="vertical" @submit.prevent="handleSubmit">
            <!-- Title -->
            <a-form-item label="Tiêu đề" name="title">
                <div class="flex items-center mb-4">
                    <div class="w-6 h-6 mr-2">
                        <a-badge color="green" />
                    </div>
                    <a-input placeholder="Add title"
                        class="border-0 border-b border-gray-200 px-0 text-lg focus:shadow-none" :bordered="false"
                        v-model:value="formState.title" />
                </div>
            </a-form-item>

            <!-- Date and Time -->
            <div class="flex items-center mb-4">
                <div class="w-6 h-6 mr-2">
                    <CalendarOutlined class="text-gray-500" />
                </div>

                <a-form-item label="Thời gian bắt đầu" name="start">
                    <DatePicker v-model:value="formState.start" show-time class="w-full min-w-[200px]"
                        format="YYYY-MM-DD HH:mm" :disabled="formState.allDay" />
                </a-form-item>
                <a-form-item label="Thời gian kết thúc" name="end">
                    <DatePicker v-model:value="formState.end" show-time class="w-full min-w-[200px]"
                        format="YYYY-MM-DD HH:mm" :disabled="formState.allDay" />
                </a-form-item>
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
                <a-input placeholder="Địa điểm" class="bg-gray-50" v-model:value="formState.location" />
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
                    <a-select v-model:value="formState.color_code" placeholder="Chọn màu" class="w-full rounded-lg">
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
                <a-select v-model:value="formState.tags" class="w-full bg-gray-50" placeholder="Chọn loại"
                    :options="tags" :maxTagCount="5" </a-select>


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

                    <div class="mt-2">

                        <div class="flex mb-4" v-if="formState.attendees && formState.attendees.length > 0">
                            <a-checkbox v-model="formState.accessView">Cho phép xem sự kiện</a-checkbox>
                            <a-checkbox v-model="formState.accessEdit" class="ml-4">Cho phép chỉnh sửa sự
                                kiện</a-checkbox>
                        </div>

                        <!-- <a-switch class="mr-2 mb-2" v-model="formState.uuid" /> Chia sẻ sự kiện -->
                        <!-- <span v-if="formState?.uuid">Link: {{
                            `${origin}/calendar/event/${formState?.uuid}/invite`
                        }}</span> -->

                        <!-- <div v-if="formState?.uuid"
                            class="flex items-center p-2 border rounded-lg bg-gray-100 space-x-2">
                            <router-link :to="`/calendar/event/${formState?.uuid}/invite`"
                                class="text-blue-600 hover:underline truncate w-48">
                                {{ `${origin}/calendar/event/${formState?.uuid}/invite` }}
                            </router-link>

                            <button @click="copyToClipboard" class="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                <CopyOutlined />
                            </button>
                        </div> -->
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
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <TagOutlined class="text-gray-500" />
                </div>
                <a-textarea v-model:value="formState.description" placeholder="Nội dung" :rows="4" />
                <!-- <a-form-item label="Nội dung" name="description w-full">
                    <a-textarea v-model:value="formState.description" class="bg-gray-50 w-full" placeholder="Nội dung" :rows="4" />
                </a-form-item> -->
            </div>



            <!-- Attachment -->
            <div class="flex mb-6">
                <div class="w-6 h-6 mr-2">
                    <PaperClipOutlined class="text-gray-500" />
                </div>
                <a class="text-blue-600 text-sm">Thêm Tập Tin Đính Kèm</a>
            </div>

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
import { onBeforeUnmount, onMounted, ref, defineProps, defineEmits, watchEffect, watch, nextTick, computed, h } from 'vue';
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
    PaperClipOutlined,
    CopyOutlined
} from '@ant-design/icons-vue';
import { Button, Checkbox, Col, InputNumber, message, Row, Card, Tag, Select, DatePicker, Input, Modal } from 'ant-design-vue';
import { QuillEditor } from '@vueup/vue-quill';
import 'quill/dist/quill.snow.css';
// import moment from "moment-timezone";
import moment from 'moment';
import debounce from 'lodash/debounce';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DateTime } from "luxon";

dayjs.extend(utc);
dayjs.extend(timezone);

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
const origin = ref(typeof window !== 'undefined' ? window.location.origin : '');

const originalIsRepeat = ref(false); // Lưu trạng thái ban đầu của is_repeat


const editOption = ref("EDIT_1");

const updateDrawerWidth = () => {
    drawerWidth.value = window.innerWidth > 768 ? '50%' : '100%';
};
const handleClose = () => {
    // Đóng drawer và phát ra sự kiện update:visible
    emit('update:visible', false);
};

onMounted(async () => {
    updateDrawerWidth();
    window.addEventListener('resize', updateDrawerWidth);

    await getAllTagByUser();
});
const formatDateTime = (isoString) => {
    return DateTime.fromISO(isoString).toFormat("yyyy-MM-dd HH:mm");
};

const updateFormStateFromProps = (event) => {
    if (event) {
        console.log("Dữ liệu sự kiện:", event);

        originalIsRepeat.value = event.recurrence === 1;

        formState.value = {
            ...formState.value, // Giữ nguyên dữ liệu cũ
            id: event.id || null,
            title: event.title || "",
            start: event.start ? dayjs(event.start) : dayjs(),
            end: event.end ? dayjs(event.end) : dayjs().add(1, 'hour'),
            allDay: event.is_all_day || false,
            type: event.type || "event",
            location: event.location || "",
            url: event.url || "",
            attendees: Array.isArray(event.attendees)
                ? event.attendees.map(att => ({
                    label: att.email,
                    value: att.id
                }))
                : [],
            tags: Array.isArray(event.tags)
                ? event.tags.map(tag => ({
                    label: tag.name,
                    value: tag.id
                }))
                : null,
            color_code: event.color || "#ff4d4f",
            is_reminder: event.is_reminder || false,
            reminder: Array.isArray(event.reminder) ? [...event.reminder] : [],
            is_repeat: event.recurrence === 1,
            exclude_time: event.info?.extendedProps?.exclude_time || [],
            timezone_code: event.info?.extendedProps?.timezone || "UTC",
            description: event.info?.extendedProps?.description || "",
            uuid: event.uuid ? event.uuid : null,
            is_busy: event.is_busy || false,
            parent_id: event.parent_id ? event.parent_id : null,

            // Nếu sự kiện lặp lại (is_repeat = true), cập nhật rrule
            rrule: event.recurrence === 1 ? {
                freq: event.info?.extendedProps?.freq || "daily",
                interval: event.info?.extendedProps?.interval ?? 1,
                count: event.info?.extendedProps?.count ?? null,
                until: event.info?.extendedProps?.until
                    ? dayjs(event.info?.extendedProps?.until).format("YYYY-MM-DD HH:mm:ss")
                    : dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
                byweekday: event.info?.extendedProps?.byweekday ?? [],
                bymonthday: event.info?.extendedProps?.bymonthday ?? [],
                bymonth: event.info?.extendedProps?.bymonth ?? [],
                bysetpos: event.info?.extendedProps?.bysetpos ?? [],
            } : {
                freq: null,
                interval: 1,
                count: null,
                until: dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
                byweekday: [],
                bymonthday: [],
                bymonth: [],
                bysetpos: [],
            }
        };
    }
};



// Theo dõi sự thay đổi của props.event
watch(() => props.event, async (newEvent) => {
    await nextTick();
    // console.log("uuid", newEvent.uuid);
    updateFormStateFromProps(newEvent);
}, { immediate: true });

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDrawerWidth);
});


const formState = ref({
    id: null,
    title: "",
    start: null,
    end: null,
    allDay: false,
    type: "event",
    location: "",
    url: "",
    attendees: [],
    color_code: "#ff4d4f",
    is_reminder: false,
    reminder: [],
    is_repeat: false,
    is_done: false,
    is_busy: false,
    parent_id: null,

    tags: null,

    recurrence: null,
    timezone_code: "UTC",
    description: "",
    exclude_time: [],
    uuid: "",
    rrule: {
        freq: null,
        interval: 1,
        count: null,
        until: dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
        byweekday: [],
        bymonthday: [],
        bymonth: [],
        bysetpos: [],
    },
    shareLink: false,
});

const rules = {
    title: [
        { required: true, message: "Tiêu đề không được để trống", trigger: "blur" },
        { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự", trigger: "blur" },
    ],
    time: [
        { required: true, message: "Vui lòng chọn thời gian", trigger: "change" },
        {
            validator: (_, value) => {
                if (!value || value.length !== 2) return Promise.reject("Thời gian không hợp lệ");
                if (dayjs(value[0]).isAfter(value[1])) return Promise.reject("Thời gian bắt đầu không thể sau thời gian kết thúc");
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    timezone_code: [
        { required: true, message: "Vui lòng chọn múi giờ", trigger: "change" },
        {
            validator: (_, value) => {
                return moment.tz.names().includes(value)
                    ? Promise.resolve()
                    : Promise.reject("Múi giờ không hợp lệ");
            },
            trigger: "change",
        },
    ],
    attendees: [
        {
            validator: (_, value) => {
                if (value.length > 10) return Promise.reject("Không thể thêm quá 10 khách mời");
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    reminder: [
        {
            validator: (_, value) => {
                if (value.length > 3) return Promise.reject("Chỉ có thể thêm tối đa 3 nhắc nhở");
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    rrule: {
        freq: [
            { required: true, message: "Vui lòng chọn kiểu lặp lại.", trigger: "change" },
        ],
        interval: [
            { required: true, message: "Khoảng cách lặp lại không được để trống.", trigger: "change" },
            { type: 'number', min: 1, message: "Khoảng cách lặp lại phải lớn hơn 0.", trigger: "change" },
        ],
        until: [
            {
                validator: (_, value) => {
                    if (formState.value.is_repeat && !value) {
                        return Promise.reject("Ngày kết thúc không được để trống khi lặp lại.");
                    }
                    return Promise.resolve();
                },
                trigger: "change",
            },
        ],
        byweekday: [
            {
                validator: (_, value) => {
                    if (formState.value.rrule.freq === 'weekly' && (!value || value.length === 0)) {
                        return Promise.reject("Vui lòng chọn ít nhất một ngày trong tuần.");
                    }
                    return Promise.resolve();
                },
                trigger: "change",
            },
        ],
        bymonthday: [
            {
                validator: (_, value) => {
                    if (formState.value.rrule.freq === 'monthly' && (!value || value.length === 0)) {
                        return Promise.reject("Vui lòng chọn ít nhất một ngày trong tháng.");
                    }
                    return Promise.resolve();
                },
                trigger: "change",
            },
        ],
    },
};


watch(
    () => formState.value.is_repeat,
    async (newValue) => {
        // console.log("Cập nhật is_repeat:", newValue);
        await nextTick(); // Chờ Vue cập nhật xong trước khi gán dữ liệu mới

        if (newValue) {
            // Nếu bật lặp lại, đảm bảo rrule có dữ liệu mặc định
            formState.value.rrule = formState.value.rrule || {
                freq: "daily",
                interval: 1,
                count: null,
                until: null,
                byweekday: [],
                bymonthday: [],
                bymonth: [],
                bysetpos: [],
                endType: "",
            };
        } else {
            formState.value.rrule = {
                freq: null,
                interval: 1,
                count: null,
                until: null,
                byweekday: [],
                bymonthday: [],
                bymonth: [],
                bysetpos: [],
                endType: "",
            };
        }
    },
    { immediate: true }
);

watch(
    () => formState.value.allDay,
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

const copyToClipboard = () => {
    navigator.clipboard.writeText(`${origin}/calendar/event/${formState.value.uuid}/invite`).then(() => {
        message.success('Đã sao chép liên kết!');
    });
};

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
const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
        start.value = dates[0]; // Cập nhật biến start
        end.value = dates[1];   // Cập nhật biến end
        console.log("Thời gian bắt đầu:", start.value.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Thời gian kết thúc:", end.value.format("YYYY-MM-DD HH:mm:ss"));
    }
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

        if (res.data.code === 200) {
            tags.value = res.data.data.map(tag => ({
                label: tag.name,
                value: tag.id
            }));

            // Nếu chưa có tag nào được chọn, gán mặc định tag đầu tiên
            if (!formState.value.tags && tags.value.length > 0) {
                formState.value.tags = tags.value[0].value;
            }
        }
    } catch (error) {
        console.log('Loi lay tags', error);
    }
}

const transformAttendeesData = (data) => {
    return data.map(option => ({
        user_id: option.value,
        status: 'pending',
        role: 'viewer'
    }));
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

        // state.value.data = response.data.data.map(user => ({
        //     label: `${user.email}`,
        //     value: user.id
        // }));

        const fetchedUsers = response.data.data.map(user => ({
            label: `${user.email}`,
            value: user.id
        }));

        // So sánh với attendees đã chọn trước đó
        const selectedAttendees = formState.value.attendees.map(att => att.value);

        state.value.data = fetchedUsers.map(user => ({
            ...user,
            selected: selectedAttendees.includes(user.value) // Đánh dấu user đã chọn
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


// Xử lý cập nhật sự kiện
const handleSubmit = () => {
    if (originalIsRepeat.value === true) {
        Modal.confirm({
            title: "Cập nhật sự kiện lặp lại",
            width: 500,
            content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
                h("div", { class: "mb-3" }, [
                    h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                        h("input", {
                            type: "radio",
                            name: "editOption",
                            value: "EDIT_1",
                            class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                            checked: editOption.value === "EDIT_1",
                            onInput: (e) => {
                                editOption.value = e.target.value;
                            },
                        }),
                        h("span", { class: "text-lg" }, "Chỉ cập nhật sự kiện này"),
                    ]),
                ]),
                h("div", { class: "mb-3" }, [
                    h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                        h("input", {
                            type: "radio",
                            name: "editOption",
                            value: "EDIT_1B",
                            class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                            checked: editOption.value === "EDIT_1B",
                            onInput: (e) => {
                                editOption.value = e.target.value;
                            },
                        }),
                        h("span", { class: "text-lg" }, "Cập nhật sự kiện này và những sự kiện tiếp theo"),
                    ]),
                ]),
                h("div", { class: "mb-3" }, [
                    h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                        h("input", {
                            type: "radio",
                            name: "editOption",
                            value: "EDIT_A",
                            class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                            checked: editOption.value === "EDIT_A",
                            onInput: (e) => {
                                editOption.value = e.target.value;
                            },
                        }),
                        h("span", { class: "text-lg" }, "Cập nhật tất cả sự kiện"),
                    ]),
                ]),
            ]),
            okText: "Cập nhật",
            cancelText: "Hủy",
            onOk() {
                updateEvent({ code: editOption.value, date: formState.value.start, id: formState.value.id });
            },
        });
    } else {
        // Nếu không có lặp lại, cập nhật ngay lập tức
        updateEvent({ code: "EDIT_N", date: formState.value.start, id: formState.value.id });
    }
};

// Hàm cập nhật sự kiện
const updateEvent = async ({ code, date, id }) => {
    try {
        const dataApi = {
            id: id,
            code: code,
            start_time: formState.value.start
                ? formState.value.start.format("YYYY-MM-DD HH:mm:ss")
                : null,
            title: formState.value.title,
            updated_date: formState.value.start
                ? formState.value.start.format("YYYY-MM-DD HH:mm:ss")
                : null,
            end_time: formState.value.end
                ? formState.value.end.format("YYYY-MM-DD HH:mm:ss")
                : null,
            description: formState.value.description || null,
            location: formState.value.location || null,
            attendees: formState.value.attendees ? transformAttendeesData(formState.value.attendees) : null,
            sendMail: formState.value.sendMail,
            is_reminder: formState.value.is_reminder || 0,
            reminder: formatReminders(formState.value.reminder) || null,
            color_code: formState.value.color_code || null,
            is_busy: formState.value.is_busy || 0,
            is_all_day: formState.value.allDay || 0,
            is_repeat: formState.value.is_repeat || 0,
            parent_id: formState.value.parent_id || null,
            rrule: formState.value.rrule || null,
            exclude_time: formState.value.exclude_time || null,
            timezone_code: formState.value.timezone_code || null,
            type: formState.value.type || null,
            freq: formState.value.rrule?.freq || null,
            interval: formState.value.rrule?.interval ?? 1,
            count: formState.value.rrule?.count ?? null,
            until: formState.value.rrule?.until
                ? dayjs(formState.value.rrule?.until).format("YYYY-MM-DD HH:mm:ss")
                : dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
            byweekday: formState.value.rrule?.byweekday.length ? formState.value.rrule.byweekday : null,
            bymonthday: formState.value.rrule?.bymonthday.length ? formState.value.rrule.bymonthday : null,
            bymonth: formState.value.rrule?.bymonth.length ? formState.value.rrule.bymonth : null,
        };
        console.log("formState.value.rrule", formState.value.rrule);
        console.log("formState", formState.value);

        console.log("🔎 Cập nhật sự kiện:", dataApi);
        const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}tasks/${id}`, dataApi, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });

        if (res.data.code === 200) {
            message.success(res.data.message || "Cập nhật sự kiện thành công");
            // Có thể thêm logic để cập nhật giao diện hoặc dữ liệu khác
        } else {
            message.error(res.data.message || "Cập nhật sự kiện không thành công.");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật sự kiện:", error);
        message.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
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
    gap: 1.5rem;
    /* Tăng khoảng cách giữa các cột */
}

.switch-checkbox {
    /* Tùy chỉnh cho checkbox nếu cần */
}

/* Tùy chỉnh cho các thành phần chọn và nhập */
.a-select,
.ant-input {
    border-radius: 8px;
    /* Tạo góc bo tròn */
}

/* Tùy chỉnh cho Tag */
.ant-tag {
    margin-top: 0.5rem;
    /* Tăng khoảng cách trên cho tag */
}
</style>