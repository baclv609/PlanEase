<template>
    <a-drawer :open="visible" :rules="rules" title="Chi tiết sự kiện" placement="right" :width="drawerWidth"
        @close="handleClose" @update:open="(val) => emit('update:visible', val)" :destroyOnClose="true"
        :maskClosable="false">
        <template #extra>
            <div class="flex gap-2">
                <a-button type="primary" @click="handleSubmit" :loading="isLoading" class="px-6">Lưu</a-button>
            </div>
        </template>
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules" @submit.prevent="handleSubmit" class="event-form">
            <!-- Title Section -->
            <div class="form-section">
                <div class="section-title">
                    <EditOutlined class="text-gray-500 mr-2" />
                    <span>Tiêu đề</span>
                </div>
                <div class="flex items-center">
                    <div class="flex h-8 justify-center w-8 items-center mr-3">
                        <div :style="{ backgroundColor: formState.color_code, width: '12px', height: '12px', borderRadius: '50%' }"></div>
                    </div>
                    <a-input placeholder="Add title"
                        class="bg-gray-50 rounded-lg w-full min-w-[200px]" 
                        v-model:value="formState.title" />
                </div>
            </div>

            <!-- Date and Time Section -->
            <div class="form-section">
                <div class="section-title">
                    <CalendarOutlined class="text-gray-500 mr-2" />
                    <span>Thời gian</span>
                </div>
                <div class="grid grid-cols-1 gap-3">
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <a-form-item label="Thời gian bắt đầu" name="start">
                            <DatePicker v-model:value="formState.start" 
                                :show-time="!formState.allDay"
                                :format="formState.allDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                                class="w-full"
                                :disabled-time="formState.allDay ? () => ({
                                    disabledHours: () => Array.from({ length: 24 }, (_, i) => i),
                                    disabledMinutes: () => Array.from({ length: 60 }, (_, i) => i),
                                    disabledSeconds: () => Array.from({ length: 60 }, (_, i) => i)
                                }) : undefined"
                                :allow-clear="false"
                                />
                        </a-form-item>
                        <a-form-item label="Thời gian kết thúc" name="end">
                            <DatePicker v-model:value="formState.end" 
                                :show-time="!formState.allDay"
                                :format="formState.allDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                                class="w-full"
                                :disabled-time="formState.allDay ? () => ({
                                    disabledHours: () => Array.from({ length: 24 }, (_, i) => i),
                                    disabledMinutes: () => Array.from({ length: 60 }, (_, i) => i),
                                    disabledSeconds: () => Array.from({ length: 60 }, (_, i) => i)
                                }) : undefined"
                                :allow-clear="false"
                                />
                        </a-form-item>
                    </div>
                    <a-form-item label="Múi giờ" name="timezone_code">
                        <a-select v-model:value="formState.timezone_code" show-search placeholder="Múi giờ"
                            :filter-option="filterOption" class="w-full">
                            <a-select-option v-for="timezone in timezones" :key="timezone" :value="timezone">
                                {{ timezone }} - {{ getGmtOffset(timezone) }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                    <div class="flex items-center">
                        <a-checkbox v-model:checked="formState.allDay">Cả ngày</a-checkbox>
                        <a-checkbox v-model:checked="formState.is_repeat" class="ml-6">Lặp lại</a-checkbox>
                    </div>
                </div>
            </div>

            <!-- Description Section -->
            <div class="form-section">
                <div class="flex justify-between items-center">
                    <div class="section-title">
                        <AlignLeftOutlined class="text-gray-500 mr-2" />
                        <span>Mô tả</span>
                    </div>
    
                    <div class="section-title">
                        <PaperClipOutlined class="text-gray-500 mr-2" />
                        <a-upload
                            :file-list="formState.attachments"
                            :show-upload-list="true"
                            class="text-blue-600 cursor-pointer hover:text-blue-800"
                        >
                            Thêm Tập Tin Đính Kèm
                        </a-upload>
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

                <!-- Display attached files -->
                <div v-if="formState.attachments && formState.attachments.length > 0" class="mt-4">
                    <div class="text-sm font-medium text-gray-700 mb-2">Tập tin đính kèm:</div>
                    <div class="space-y-2">
                        <div v-for="(file, index) in formState.attachments" :key="index" 
                            class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div class="flex items-center">
                                <PaperClipOutlined class="text-gray-500 mr-2" />
                                <span class="text-sm text-gray-600">{{ file.name }}</span>
                            </div>
                            <a-button type="text" danger @click="removeAttachment(index)">
                                <DeleteOutlined />
                            </a-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Location Section -->
            <div class="form-section">
                <div class="section-title">
                    <EnvironmentOutlined class="text-gray-500 mr-2" />
                    <span>Địa điểm</span>
                </div>
                <a-form-item name="location" class="w-full">
                    <a-input placeholder="Địa điểm" class="rounded-lg" v-model:value="formState.location" />
                </a-form-item>
            </div>

            <!-- Participants Section -->
            <div class="form-section" v-if="formState.type == 'event'">
                <div class="section-title">
                    <UserOutlined class="text-gray-500 mr-2" />
                    <span>Người tham gia</span>
                </div>
                <div class="space-y-4">
                    <a-select v-model:value="formState.attendees" mode="multiple"
                        label-in-value placeholder="Khách mời" class="w-full" :filter-option="false"
                        :not-found-content="state.fetching ? undefined : null" :options="state.data"
                        @search="fetchUser"
                        :disabled="formState.user_id != user.id">
                        <template v-if="state.fetching" #notFoundContent>
                            <a-spin size="small" />
                        </template>
                    </a-select>
                    <div class="flex gap-3" v-if="formState.user_id == user.id">
                        <span>Quyền của khách:</span>
                        <div class="flex gap-4 items-center">
                            <a-radio-group v-model:value="formState.attendeeRole" class="flex gap-4">
                                <a-radio value="viewer">Chỉ xem</a-radio>
                                <a-radio value="editor">Được sửa</a-radio>
                            </a-radio-group>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Event Type Section -->
            <div class="form-section">
                <div class="section-title">
                    <TagOutlined class="text-gray-500 mr-2" />
                    <span>Loại sự kiện</span>
                </div>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <a-form-item name="type">
                        <Select v-model:value="formState.type" placeholder="Loại sự kiện" class="rounded-lg w-full" disabled>
                            <Select.Option value="event">Sự kiện</Select.Option>
                            <Select.Option value="task">Việc cần làm</Select.Option>
                        </Select>
                    </a-form-item>
                    <a-form-item name="color_code">
                        <a-select v-model:value="formState.color_code" placeholder="Chọn màu" class="rounded-lg w-full">
                            <a-select-option v-for="color in colors" :key="color.value" :value="color.value">
                                <div class="flex items-center">
                                    <div class="h-4 rounded-full w-4 mr-2" :style="{ backgroundColor: color.value }"></div>
                                    <span>{{ color.label }}</span>
                                </div>
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <!-- Calendar Section -->
                    <a-form-item name="tags" class="w-full">
                        <a-select v-model:value="formState.tags" class="bg-gray-50 rounded-lg w-full" placeholder="Chọn loại"
                            :options="tags"
                            :disabled="formState.user_id != user.id">
                            > </a-select>
                    </a-form-item>

                </div>
            </div>

            <!-- Privacy Section -->
            <div class="form-section flex flex-col gap-2">
                <div class="grid grid-cols-1 gap-2 md:grid-cols-2" v-if="formState.type == 'event'">
                    <div>
                        <div class="section-title">
                            <LockOutlined class="text-gray-500 mr-2" />
                            <span>Quyền riêng tư</span>
                        </div>
                        <div class="flex gap-6 items-center">
                            <a-checkbox v-model:checked="formState.is_private">Riêng tư</a-checkbox>
                            <a-checkbox v-model:checked="formState.is_busy">Đánh dấu là bận</a-checkbox>
                        </div>
                    </div>
    
                    <div>
                        <!-- Notification Section -->
                        <div class="section-title">
                            <BellOutlined class="text-gray-500 mr-2" />
                            <span>Thông báo</span>
                        </div>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center mb-0">
                                <Checkbox v-model:checked="formState.is_reminder">Bật nhắc nhở</Checkbox>
                                <div v-if="formState.is_reminder" @click="addReminder" class="cursor-pointer">
                                    <a class="text-blue-600 hover:text-blue-800">Thêm thông báo nhắc</a>
                                </div>
                            </div>
    
                        </div>
                    </div>
    
                </div>
                
                <div v-if="formState.is_reminder" class="space-y-2">
                    <div v-for="(reminder, index) in formState.reminder" :key="index" 
                        class="bg-gray-50 p-2 rounded-lg">
                        <Row :gutter="8" align="middle">
                        <Col span="8" class="flex items-center">
                            <Select 
                                v-model:value="reminder.type" 
                                placeholder="Loại nhắc nhở" 
                                class="w-full text-sm"
                                size="small"
                            >
                                <Select.Option value="email">Email</Select.Option>
                                <Select.Option value="web">Web</Select.Option>
                            </Select>
                            <span class="ml-2 text-sm">trước</span>
                        </Col>
                        <Col span="6">
                            <InputNumber 
                                v-model:value="reminder.time" 
                                min="1"
                                size="small"
                                @blur="reminder.time = reminder.time || 1" 
                                placeholder="Thời gian"
                                class="w-full text-sm" 
                            />
                        </Col>
                        <Col span="7">
                            <Select 
                                v-model:value="reminder.unit" 
                                placeholder="Đơn vị" 
                                class="w-full text-sm"
                                size="small"
                                >
                                <Select.Option value="minutes">Phút</Select.Option>
                                <Select.Option value="hours">Giờ</Select.Option>
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
            <div class="form-section">
                <div class="section-title">
                    <LinkOutlined class="text-gray-500 mr-2" />
                    <span>Liên kết</span>
                </div>
                <a-form-item name="url" class="w-full">
                    <a-input placeholder="Nhập url" class="bg-gray-50 rounded-lg" v-model:value="formState.url" />
                </a-form-item>
            </div>

            <!-- Recurrence Section -->
            <template v-if="formState.is_repeat">
                <div class="form-section">
                    <div class="section-title">
                        <CalendarOutlined class="text-gray-500 mr-2" />
                        <span>Cài đặt lặp lại</span>
                    </div>
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div class="space-y-4">
                            <div>
                                <label class="text-gray-700 block font-medium mb-2">Kiểu lặp lại</label>
                                <Select v-model:value="formState.rrule.freq" :options="freqOptions" class="w-full" />
                            </div>

                            <div v-if="formState.rrule.freq === 'weekly'">
                                <label class="text-gray-700 block font-medium mb-2">Ngày trong tuần</label>
                                <Checkbox.Group v-model:value="formState.rrule.byweekday" :options="weekDays" 
                                    class="grid grid-cols-4 gap-2" />
                            </div>

                            <div v-if="formState.rrule.freq === 'monthly'">
                                <label class="text-gray-700 block font-medium mb-2">Lặp vào các ngày</label>
                                <a-select v-model:value="formState.rrule.bymonthday" mode="multiple"
                                    placeholder="Chọn ngày" class="w-full"
                                    :options="monthDays.map(day => ({ label: `Ngày ${day}`, value: day }))" />
                            </div>

                            <div>
                                <label class="text-gray-700 block font-medium mb-2">Khoảng cách lặp lại</label>
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
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="flex flex-col gap-2 mb-8">
                                <label class="text-gray-700 font-medium">Kết thúc</label>
                                <a-radio-group v-model:value="formState.rrule.endType" class="flex">
                                    <a-radio value="">Không bao giờ</a-radio>
                                    <a-radio value="until">Ngày cụ thể</a-radio>
                                    <a-radio value="count">Số lần lặp</a-radio>
                                </a-radio-group>
                            </div>

                            <div class="grid grid-cols-1">
                                <div v-if="formState.rrule.endType === 'count'">
                                    <label class="text-gray-700 block font-medium mb-2">Giới hạn số lần lặp</label>
                                    <Input v-model:value="formState.rrule.count" type="number" min="1" placeholder="Nhập số lần lặp"
                                        class="w-full" />
                                </div>

                                <div v-if="formState.rrule.endType === 'until'">
                                    <label class="text-gray-700 block font-medium mb-2">Ngày kết thúc</label>
                                    <a-date-picker v-model:value="formState.rrule.until" placeholder="Chọn ngày"
                                        class="w-full" />
                                </div>

                                <!-- <div>
                                    <label class="text-gray-700 block font-medium mb-2">Loại trừ ngày</label>
                                    <DatePicker v-model:value="selectedDate" format="YYYY-MM-DD" class="w-full"
                                        @change="handleExcludeDate" />
                                    <div v-if="formState.exclude_time.length" class="flex flex-wrap gap-2 mt-2">
                                        <Tag v-for="(date, index) in formState.exclude_time" :key="index" closable
                                            @close="removeExcludeDate(index)" class="rounded-full">
                                            {{ dayjs(date).format('YYYY-MM-DD') }}
                                        </Tag>
                                    </div>
                                </div> -->
                            </div>
                        </div>
                    </div>
                </div>
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
    EditOutlined,
    LockOutlined,
    PaperClipOutlined,
    AlignLeftOutlined
} from '@ant-design/icons-vue';
import { Button, Checkbox, Col, InputNumber, message, Row, Card, Tag, Select, DatePicker, Input, Modal, Upload } from 'ant-design-vue';
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
import { eventRules, setFormState } from '@/validators/eventRules';
import { recurringEventRules } from '@/validators/recurringEventRules';
import Editor from 'primevue/editor';

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
const emit = defineEmits(['update:visible', 'calendar-updated']);

const selectedDate = ref(null);
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const user = JSON.parse(localStorage.getItem('user'));
const timezones = moment.tz.names();
const tags = ref([]);
const origin = ref(typeof window !== 'undefined' ? window.location.origin : '');
const isLoading = ref(false);
const originalIsRepeat = ref(false); // Lưu trạng thái ban đầu của is_repeat


const editOption = ref("EDIT_1");

const updateDrawerWidth = () => {
    drawerWidth.value = window.innerWidth > 768 ? '50%' : '100%';
};
const handleClose = () => {
    formState.value = {
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
        attendeeRole: "viewer",
        attachments: [],
        rrule: {
            freq: null,
            interval: 1,
            count: null,
            until: null,
            byweekday: [],
            bymonthday: [],
            bymonth: [],
            bysetpos: [],
        },
        shareLink: false,
    };
    originalIsRepeat.value = false;
    emit('update:visible', false);
};

onMounted(async () => {
    updateDrawerWidth();
    window.addEventListener('resize', updateDrawerWidth);
});
const formatDateTime = (isoString) => {
    return DateTime.fromISO(isoString).toFormat("yyyy-MM-dd HH:mm");
};

const updateFormStateFromProps = (event) => {
    if (event) {
        console.log("Dữ liệu sự kiện:", event);

        originalIsRepeat.value = event.recurrence === 1;

        // Xử lý ngày trong tuần nếu là sự kiện lặp lại theo tuần
        let byweekday = [];
        if (event.recurrence === 1 && event.info?.extendedProps?.freq === 'weekly') {
            // Nếu có dữ liệu byweekday từ server, sử dụng nó
            if (Array.isArray(event.info.extendedProps.byweekday) && event.info.extendedProps.byweekday.length > 0) {
                byweekday = event.info.extendedProps.byweekday;
            } else {
                // Nếu không có, lấy ngày từ thời gian bắt đầu
                const startDate = dayjs(event.start).tz(event.info?.extendedProps?.timezone || "UTC");
                const startDay = startDate.day();
                const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
                byweekday = [weekdays[startDay]];
            }
        }

        formState.value = {
            ...formState.value, // Giữ nguyên dữ liệu cũ
            id: event.id || null,
            title: event.title || "",
            start: event.start ? dayjs(event.start) : dayjs(),
            end: event.end ? dayjs(event.end) : dayjs().add(1, 'hour'),
            allDay: event.is_all_day || false,
            user_id: event.user_id,
            type: event.type || "event",
            location: event.location || "",
            url: event.url || "",
            attendees: Array.isArray(event.attendees) && event.attendees.length > 0
                ? event.attendees.map(att => ({
                    label: att.email || att.user?.email || '',
                    value: att.user_id || att.id || att.user?.id || ''
                }))
                : [],
            tags: event.tag_id || null,
            is_private: event.is_private,
            color_code: event.color || "#ff4d4f",
            is_reminder: Boolean(event.is_reminder),
            reminder:Array.isArray(event.reminder) ? event.reminder.map(r => ({
                type: r.type || "email",
                time: r.set_time || 5,
                unit: r.set_time >= 60 ? "hours" : "minutes"  // Tự động xác định đơn vị
            })) : [],
            is_repeat: event.recurrence === 1 ? Boolean(event.recurrence === 1) : false,
            exclude_time: Array.isArray(event.info?.extendedProps?.exclude_time) 
                ? event.info.extendedProps.exclude_time 
                : [],
            timezone_code: event.info?.extendedProps?.timezone || "UTC",
            description: event.info?.extendedProps?.description || "",
            uuid: event.uuid ? event.uuid : null,
            is_busy: event.is_busy === 1,
            parent_id: event.parent_id ? event.parent_id : null,
            attendeeRole: event.attendees.length > 0 ? event.attendees[0].role : "viewer", //lấy quyền của khách mời
            attachments: event.attachments || [],
            // Nếu sự kiện lặp lại (is_repeat = true), cập nhật rrule
            rrule: event.recurrence === 1 ? {
                freq: event.info?.extendedProps?.freq || "daily",
                interval: Number(event.info?.extendedProps?.interval) || 1,
                count: event.info?.extendedProps?.count 
                    ? Number(event.info.extendedProps.count) 
                    : null,
                until: event.info?.extendedProps?.until
                    ? dayjs(event.info.extendedProps.until)
                    : dayjs("3000-12-31 23:59:59"),
                byweekday: Array.isArray(event.info?.extendedProps?.byweekday)
                    ? event.info.extendedProps.byweekday
                    : [],
                bymonthday: Array.isArray(event.info?.extendedProps?.bymonthday)
                    ? event.info.extendedProps.bymonthday
                    : [],
                bymonth: Array.isArray(event.info?.extendedProps?.bymonth)
                    ? event.info.extendedProps.bymonth
                    : [],
                bysetpos: Array.isArray(event.info?.extendedProps?.bysetpos)
                    ? event.info.extendedProps.bysetpos
                    : [],
                endType: event.info?.extendedProps?.until && dayjs(event.info?.extendedProps?.until).year() < 3000? "until" 
                    : event.info?.extendedProps?.count ? "count" 
                    : ""
            } : {
                freq: null,
                interval: 1,
                count: null,
                until: dayjs("3000-12-31 23:59:59"),
                byweekday: [],
                bymonthday: [],
                bymonth: [],
                bysetpos: [],
                endType: ""
            }
        };
    }
};

const validateFormState = () => {
    // Kiểm tra thời gian bắt đầu và kết thúc
    if (formState.value.start && formState.value.end) {
        if (dayjs(formState.value.start).isAfter(formState.value.end)) {
            formState.value.end = dayjs(formState.value.start).add(1, 'hour');
        }
    }

    // Kiểm tra reminder
    if (formState.value.is_reminder && formState.value.reminder.length === 0) {
        formState.value.reminder = [{ type: "email", time: 5, unit: "minutes" }];
    }

    // Kiểm tra rrule khi là sự kiện lặp lại
    if (formState.value.is_repeat) {
        if (!formState.value.rrule.freq) {
            formState.value.rrule.freq = "daily";
        }
        if (!formState.value.rrule.interval || formState.value.rrule.interval < 1) {
            formState.value.rrule.interval = 1;
        }
    }
};

// Theo dõi sự thay đổi của props.event
watch(() => props.event, async (newEvent) => {
    if(newEvent != null) {
        await nextTick();
        getAllTagByUser();
        updateFormStateFromProps(newEvent);
        validateFormState();
    }
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
    attendeeRole: "viewer",
    is_private: false,
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
        { max: 255, message: "Tiêu đề quá dài", trigger: "blur" },
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
        await nextTick(); // Chờ Vue cập nhật xong trước khi gán dữ liệu mới

        if (newValue) {
            // Nếu bật lặp lại, đảm bảo rrule có dữ liệu mặc định
            formState.value.rrule = {
                ...formState.value.rrule, // Giữ nguyên các giá trị khác
                freq: formState.value.rrule.freq || "daily", // Set mặc định là daily nếu chưa có
                interval: formState.value.rrule.interval || 1,
                count: formState.value.rrule.count || null,
                until: formState.value.rrule.until || dayjs("3000-12-31 23:59:59"),
                byweekday: formState.value.rrule.byweekday || [],
                bymonthday: formState.value.rrule.bymonthday || [],
                bymonth: formState.value.rrule.bymonth || [],
                bysetpos: formState.value.rrule.bysetpos || [],
                endType: formState.value.rrule.endType || "",
            };
        } else {
            // Khi tắt lặp lại, reset rrule về giá trị mặc định
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
        if(formState.value.end.isSame(formState.value.start)){
            formState.value.end = formState.value.end.add(1, 'day');
        }
    } else {
      // Khi tắt cả ngày, set lại thời gian mặc định
      if (formState.value.start) {
        formState.value.start = dayjs(formState.value.start).hour(dayjs().hour()).minute(dayjs().minute());
      }
      if (formState.value.end) {
        formState.value.end = dayjs(formState.value.end).hour(dayjs().hour()).minute(dayjs().minute());
      }
    }
  }
)

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

    if (formState.value.reminder.length == 0) {
        formState.value.is_reminder = false;
    }
};
const colors = [
    { label: 'Xanh dương', value: '#1890ff' }, 
    { label: 'Đỏ', value: '#ff4d4f' }, 
    { label: 'Xanh lá cây', value: '#52c41a' },
    { label: 'Vàng', value: '#faad14' }, 
    { label: 'Tím', value: '#722ed1' },
    { label: 'Xám', value: '#bfbfbf' }, 
    { label: 'Cam', value: '#fa541c' }, 
    { label: 'Hồng', value: '#eb2f96' }, 
    { label: 'Nâu', value: '#a97c50' }, 
    { label: 'Xanh ngọc', value: '#13c2c2' }, 
    { label: 'Xanh lục bảo', value: '#237804' }, 
    { label: 'Xanh biển', value: '#003a8c' },
    { label: 'Đen', value: '#000000' }
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
            // Cập nhật danh sách tags
            tags.value = res.data.data.map(tag => ({
                label: tag.name,
                value: tag.id
            }));

            // Nếu có event và event có tag_id, cập nhật formState.tags
            if (props.event && props.event.tag_id) {
                formState.value.tags = props.event.tag_id;
            } else {
                formState.value.tags = null;
            }
        } else {
            message.error('Không thể tải danh sách tags');
        }
    } catch (error) {
        message.error('Đã xảy ra lỗi khi tải danh sách tags');
    }
}

const transformAttendeesData = (data) => {
    // Lấy danh sách người tham gia hiện tại từ event gốc
    const existingAttendees = props.event?.attendees || [];
    
    return data.map(option => {
        // Tìm xem người này đã tồn tại trong danh sách cũ chưa
        const existingAttendee = existingAttendees.find(att => 
            att.user_id === option.value || att.id === option.value
        );
        
        // Nếu đã tồn tại, giữ nguyên status cũ
        // Nếu chưa tồn tại, set status là pending
        return {
            user_id: option.value,
            status: existingAttendee ? existingAttendee.status : 'pending',
            role: formState.value.attendeeRole
        };
    });
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
        const formattedDate = dayjs(date).hour(dayjs(formState.value.start).hour()).minute(dayjs(formState.value.start).minute()).second(0).format("YYYY-MM-DD HH:mm:ss");
        if (!formState.value.exclude_time.includes(formattedDate)) {
            formState.value.exclude_time.push(formattedDate);
        }
    }
};

const formRef = ref();

// Xử lý cập nhật sự kiện
const handleSubmit = async () => {
    try {
        // Validate form using formRef
        await formRef.value.validate();

        // If validation passes, proceed with update
        if (originalIsRepeat.value === true) {
            // Check if freq has changed
            const originalFreq = props.event?.info?.extendedProps?.freq;
            const newFreq = formState.value.rrule?.freq;
            const hasFreqChanged = originalFreq !== newFreq;

            // Check if start time has changed
            const originalStart = dayjs(props.event?.start);
            const newStart = formState.value.start;
            const hasStartChanged = !originalStart.isSame(newStart);

            // Case 1: Only start time changed, frequency unchanged
            if (hasStartChanged && !hasFreqChanged) {
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
                    ]),
                    okText: "Cập nhật",
                    cancelText: "Hủy",
                    onOk() {
                        updateEvent({ code: editOption.value, date: formState.value.start, id: formState.value.id });
                    },
                });
            }
            // Case 2: Both frequency and start time changed
            else if (hasFreqChanged && hasStartChanged) {
                // Automatically use EDIT_1B without showing modal
                updateEvent({ code: "EDIT_1B", date: formState.value.start, id: formState.value.id });
            }
            // Case 3: Only frequency changed
            else if (hasFreqChanged) {
                Modal.confirm({
                    title: "Cập nhật sự kiện lặp lại",
                    width: 500,
                    content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
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
            }
            // Case 4: No changes to frequency or start time
            else {
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
            }
        } else {
            // Nếu không có lặp lại, cập nhật ngay lập tức
            updateEvent({ code: "EDIT_N", date: formState.value.start, id: formState.value.id });
        }
    } catch (error) {
        console.log(error)
    }
};

// Hàm cập nhật sự kiện
const updateEvent = async ({ code, date, id }) => {
    isLoading.value = true;
    console.log(formState.value.attendees)
    try {
        const dataApi = {
            id: id,
            code: code,
            start_time: formState.value.start
                ? formState.value.start.format("YYYY-MM-DD HH:mm:ss")
                : null,
            title: formState.value.title || "(Không có tiêu đề)",
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
            is_busy: formState.value.is_busy ? 1 : 0,
            is_all_day: formState.value.allDay ? 1 : 0,
            is_repeat: formState.value.is_repeat ? 1 : 0,
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
            byweekday: formState.value.rrule?.byweekday.length && formState.value.rrule?.freq === "weekly" ? formState.value.rrule.byweekday : null,
            bymonthday: formState.value.rrule?.bymonthday.length && formState.value.rrule?.freq === "monthly" ? formState.value.rrule.bymonthday : null,
            bymonth: formState.value.rrule?.bymonth.length && formState.value.rrule?.freq === "yearly" ? formState.value.rrule.bymonth : null,
            tag_id: formState.value.tags || null,
            is_private: formState.value.is_private ? 1 : 0,
            // path: formState.value.attachments.map(att => att.id),
            link: null,
        };

        console.log("data send",dataApi);

        const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}tasks/${id}`, dataApi, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });

        if (res.data.code === 200) {
            message.success(res.data.message || "Cập nhật sự kiện thành công");
            
            // Emit event với dữ liệu đã cập nhật
            const updatedEventData = {
                id: id,
                title: formState.value.title,
                start: formState.value.start.format("YYYY-MM-DD HH:mm:ss"),
                end: formState.value.end.format("YYYY-MM-DD HH:mm:ss"),
                color: formState.value.color_code,
                is_all_day: formState.value.allDay,
                type: formState.value.type,
                location: formState.value.location,
                description: formState.value.description,
                is_reminder: formState.value.is_reminder,
                reminder: formatReminders(formState.value.reminder),
                is_repeat: formState.value.is_repeat,
                recurrence: formState.value.is_repeat ? 1 : 0,
                info: {
                    extendedProps: {
                        freq: formState.value.rrule?.freq,
                        interval: formState.value.rrule?.interval,
                        count: formState.value.rrule?.count,
                        until: formState.value.rrule?.until,
                        byweekday: formState.value.rrule?.byweekday,
                        bymonthday: formState.value.rrule?.bymonthday,
                        bymonth: formState.value.rrule?.bymonth,
                        timezone: formState.value.timezone_code,
                        description: formState.value.description,
                        exclude_time: formState.value.exclude_time
                    }
                }
            };
            
            emit('calendar-updated', updatedEventData);
            
            // Reset form và đóng modal
            formState.value = {
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
                attendeeRole: "viewer",
                attachments: [],
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
            };
            emit('update:visible', false);
        } else {
            message.error(res.data.message || "Cập nhật sự kiện không thành công.");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật sự kiện:", error);
        message.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
        isLoading.value = false;
    }
};

// Tạo computed property cho rules
const formRules = computed(() => ({
    ...eventRules,
    ...recurringEventRules
}));

// Add watch for formState
watch(
    () => formState.value,
    (newValue) => {
        setFormState(newValue);
    },
    { deep: true, immediate: true }
);

// chọn mặc định thứ của ngày bắt đầu khi không chọn thứ
watch(
  () => formState.value.rrule?.byweekday,
  (newVal) => {
    if (formState.value.rrule?.freq === 'weekly' && 
        (!newVal || newVal.length === 0) && 
        formState.value.start) {
      
      const startDay = dayjs(formState.value.start).day();
      const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      formState.value.rrule.byweekday = [weekdays[startDay]];
    }
  }
);

// Thêm watch cho freq để xử lý khi chuyển sang lặp theo tuần
watch(
  () => formState.value.rrule?.freq,
  (newVal, oldVal) => {
    if (newVal === 'weekly') {
      // Nếu đang sửa sự kiện và có dữ liệu byweekday, giữ nguyên selection
      if (props.event?.recurrence === 1 && 
          props.event?.info?.extendedProps?.freq === 'weekly' &&
          props.event?.info?.extendedProps?.byweekday?.length > 0 &&
          oldVal === null) {
        formState.value.rrule.byweekday = props.event.info.extendedProps.byweekday;
      } else if (!formState.value.rrule.byweekday || formState.value.rrule.byweekday.length === 0) {
        // Nếu không có selection hoặc đổi từ loại khác sang weekly
        const startDay = dayjs(formState.value.start).day();
        const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        formState.value.rrule.byweekday = [weekdays[startDay]];
      }
    }
  }
);

// Thêm watch cho is_repeat để xử lý khi bật/tắt lặp lại
watch(
  () => formState.value.is_repeat,
  (newVal) => {
    if (newVal && formState.value.rrule?.freq === 'weekly') {
      // Khi bật lặp lại và đang ở chế độ lặp theo tuần
      if (props.event?.recurrence === 1 && 
          props.event?.info?.extendedProps?.freq === 'weekly' &&
          props.event?.info?.extendedProps?.byweekday?.length > 0) {
        // Nếu đang sửa sự kiện và có dữ liệu byweekday, giữ nguyên selection
        formState.value.rrule.byweekday = props.event.info.extendedProps.byweekday;
      } else if (!formState.value.rrule.byweekday || formState.value.rrule.byweekday.length === 0) {
        // Nếu không có selection
        const startDay = dayjs(formState.value.start).day();
        const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        formState.value.rrule.byweekday = [weekdays[startDay]];
      }
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
</script>

<style scoped>
.event-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

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

:deep(.ant-input-borderless) {
    background: transparent;
}

:deep(.ant-select-selector) {
    background-color: rgb(249, 250, 251) !important;
    border-radius: 0.5rem !important;
}

:deep(.ant-input),
:deep(.ant-select),
:deep(.ant-picker) {
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

:deep(.ant-input:hover),
:deep(.ant-select:hover),
:deep(.ant-picker:hover) {
    border-color: #1890ff;
}

:deep(.ant-checkbox-wrapper) {
    transition: color 0.2s;
}

:deep(.ant-checkbox-wrapper:hover) {
    color: #2563eb;
}

:deep(.ant-tag) {
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
}

.recurrence-card {
    background-color: #f9fafb;
    border-color: #e5e7eb;
}

:deep(.ant-card-head) {
    border-bottom: 1px solid #e5e7eb;
}

:deep(.ant-radio-wrapper) {
    transition: color 0.2s;
}

:deep(.ant-radio-wrapper:hover) {
    color: #2563eb;
}

:deep(.ant-btn) {
    border-radius: 0.5rem;
    transition: all 0.2s;
}

:deep(.ant-btn-primary) {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.ant-btn-primary:hover) {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.ant-drawer-content-wrapper) {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

:deep(.ant-drawer-header) {
    border-bottom: 1px solid #e5e7eb;
}

:deep(.ant-drawer-title) {
    font-size: 1.125rem;
    font-weight: 500;
}

:deep(.ant-form-item) {
    margin-bottom: 0.75rem;
}

:deep(.ant-form-item-label) {
    padding-bottom: 0.25rem;
}

:deep(.ant-checkbox-group) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
}

@media (max-width: 768px) {
    .form-section {
        padding: 0.5rem;
    }
    
    :deep(.ant-checkbox-group) {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>