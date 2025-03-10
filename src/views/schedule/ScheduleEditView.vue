<template>
    <a-drawer :visible="visible" title="Chi tiết sự kiện" placement="right" :width="drawerWidth" @close="handleClose"
        @update:visible="(val) => emit('update:visible', val)">
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
                <div class="flex flex-wrap items-center gap-2">
                    <a-date-picker v-model="formState.startDate" format="DD Th M YYYY" class="w-32" :bordered="false" />
                    <a-time-picker v-model="formState.startTime" format="HH:mm a" class="w-28" :bordered="false" />
                    <span class="mx-1">→</span>
                    <a-date-picker v-model="formState.endDate" format="DD Th M YYYY" class="w-32" :bordered="false" />
                    <a-time-picker v-model="formState.endTime" format="HH:mm a" class="w-28" :bordered="false" />
                    <a-tag color="blue" class="ml-2">Asia/Ho_Chi_Minh</a-tag>
                </div>
            </div>

            <!-- All day & Repeat -->
            <div class="flex items-center mb-4 ml-8">
                <a-checkbox v-model="formState.allDay">Cả ngày</a-checkbox>
                <a-checkbox v-model="formState.repeat" class="ml-6">Lặp lại</a-checkbox>
            </div>

            <!-- Participants -->
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <UserOutlined class="text-gray-500" />
                </div>
                <div class="flex-1">
                    <a-input placeholder="Mời người tham gia cá nhân hoặc các nhóm của bạn" class="bg-gray-50 mb-1"
                        v-model="formState.participants" />
                    <div class="flex items-center text-sm text-blue-600">
                        <span>Quản lý xem rảnh rỗi...</span>
                        <a-checkbox v-model="formState.allowSendMessage" class="ml-6">Cho Phép Gửi Chuyển</a-checkbox>
                    </div>
                </div>
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
                <a-select v-model="formState.eventType" class="w-full bg-gray-50" placeholder="Thêm hội nghị">
                    <a-select-option value="meeting">Thêm hội nghị</a-select-option>
                </a-select>
            </div>

            <!-- Calendar -->
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <CalendarOutlined class="text-gray-500" />
                </div>
                <a-select v-model="formState.calendar" class="w-full bg-gray-50" placeholder="luongvandon02">
                    <a-select-option value="luongvandon02">luongvandon02</a-select-option>
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

            <!-- Notification -->
            <div class="flex mb-4">
                <div class="w-6 h-6 mr-2">
                    <BellOutlined class="text-gray-500" />
                </div>
                <div class="flex items-center gap-2">
                    <a-select v-model="formState.notificationType" style="width: 120px">
                        <a-select-option value="email">Email</a-select-option>
                    </a-select>
                    <a-select v-model="formState.notificationTime" style="width: 120px">
                        <a-select-option value="before">trước</a-select-option>
                    </a-select>
                    <a-select v-model="formState.notificationDuration" style="width: 120px">
                        <a-select-option value="15">15 phút</a-select-option>
                    </a-select>
                    <a-button type="text" class="text-gray-500">
                        <DeleteOutlined />
                    </a-button>
                </div>
            </div>

            <!-- Add notification link -->
            <div class="flex mb-4 ml-8">
                <a class="text-blue-600 text-sm">Thêm thông báo nhắc</a>
            </div>

            <!-- Rich Text Editor -->
            <!-- Rich Text Editor -->
            <div class="mb-4 border rounded">
                <QuillEditor v-model:content="formState.richText" contentType="html" :options="editorOptions" />
            </div>


            <!-- Attachment -->
            <div class="flex mb-6">
                <div class="w-6 h-6 mr-2">
                    <PaperClipOutlined class="text-gray-500" />
                </div>
                <a class="text-blue-600 text-sm">Thêm Tập Tin Đính Kèm</a>
            </div>

            <!-- Zoho Mail Integration -->
            <div class="border rounded p-4 mb-6">
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
            </div>

            <!-- Buttons -->
            <div class="flex gap-2">
                <a-button type="primary" @click="handleSubmit">Lưu</a-button>
                <a-button>Hủy</a-button>
            </div>
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
import { QuillEditor } from '@vueup/vue-quill';
import 'quill/dist/quill.snow.css';

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

// Form state
const formState = ref({
    title: '',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    allDay: false,
    repeat: false,
    participants: '',
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


const handleSubmit = () => {
    console.log("📌 Form Submitted:", formState.value);
};

</script>

<style scoped>
:deep(.ant-input-borderless) {
    background: transparent;
}

:deep(.ant-select-selector) {
    background-color: rgb(249, 250, 251) !important;
}

:deep(.ant-picker) {
    border: none;
}
</style>