<script setup>
import { ref, watch } from "vue";
import {
    TrophyOutlined,
    SettingOutlined,
    UserOutlined,
    CaretUpOutlined,
    CaretDownOutlined,
    SearchOutlined
} from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from 'dayjs';

const router = useRouter();
const route = useRoute();

const searchQuery = ref("");
const showFilters = ref(false); // Ẩn bộ lọc ban đầu
const dateFormatList = ['YYYY-MM-DD']

const searchType = ref("");
const eventName = ref("");
const start = ref("");
const end = ref("");
const location = ref("");

const searchOptions = [
    { value: "active", label: "Lịch đang hoạt động" },
    { value: "past", label: "Lịch đã qua" },
];

const toggleFilters = () => {
    showFilters.value = !showFilters.value;
};

watch(start, (newStart) => {
    if (newStart) {
        end.value = newStart;
    }
});

watch(end, (newEnd) => {
    if (newEnd && newEnd < start.value) {
        start.value = end.value;
    }
});

const handleSearch = () => {
    router.push({
        path: '/calendar/search',
        query: { title: searchQuery.value }
    });
};

const resetFilters = () => {
    eventName.value = "";
    searchType.value = "";
    start.value = null;
    end.value = null;
    location.value = '';
};

const applyFilters = () => {
    const queryParams = {
        title: eventName.value,
        tag: searchType.value,
        start: start.value ? dayjs(start.value).format('YYYY-MM-DD') : '',
        end: end.value ? dayjs(end.value).format('YYYY-MM-DD') : '',
        location: location.value,
    };

    Object.keys(queryParams).forEach((key) => {
        if (!queryParams[key]) delete queryParams[key];
    });

    router.push({
        path: "/calendar/search",
        query: queryParams,
    });
};
</script>

<template>
    <div class="relative w-full max-w-2xl mx-auto">
        <a-form layout="vertical" @finish="handleSearch">
            <!-- Thanh tìm kiếm chính -->
            <div class="flex items-center border border-2 border-gray-300 bg-white rounded-full shadow-xl px-4">
                <a-input v-model:value="searchQuery" placeholder="Tìm kiếm"
                    class="border-none flex-1 !shadow-none !ring-0 !outline-none focus:!ring-0 focus:!outline-none focus:!shadow-none"
                    @pressEnter="handleSearch">
                    <template #prefix>
                        <SearchOutlined class="text-gray-500 text-lg mx-2" />
                    </template>
                    <template #suffix>
                        <a-button @click="toggleFilters"
                            class="text-gray-500 hover:bg-gray-100 p-1 border-none px-3 rounded-full">
                            <CaretDownOutlined v-if="!showFilters" />
                            <CaretUpOutlined v-else />
                        </a-button>
                    </template>
                    <!-- Bộ lọc nâng cao -->
                </a-input>
            </div>
            <div v-show="showFilters"
                class="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg p-4 z-50 mt-2">
                <div class="grid grid-cols-2 gap-4">
                    <!-- Cột 1 -->
                    <div>
                        <a-form-item label="Tìm kiếm theo thẻ">
                            <a-select v-model:value="searchType" :options="searchOptions" class="w-full" />
                        </a-form-item>
                    </div>

                    <!-- Cột 2 -->
                    <div>
                        <a-form-item label="Tên sự kiện">
                            <a-input v-model:value="eventName" placeholder="Nhập từ khóa" class="w-full" />
                        </a-form-item>
                    </div>
                </div>
                <a-form-item label="Địa điểm">
                    <a-input v-model:value="location" placeholder="Nhập địa điểm" class="w-full" />
                </a-form-item>
                <div class="grid grid-cols-11 gap-2 items-center">
                    <div class="col-span-5">
                        <a-form-item label="Ngày bắt đầu">
                            <a-date-picker class="w-full" v-model:value="start" :format="dateFormatList" />
                        </a-form-item>
                    </div>

                    <div class="col-span-1 text-center">
                        <span>tới</span>
                    </div>

                    <div class="col-span-5">
                        <a-form-item label="Ngày kết thúc">
                            <a-date-picker class="w-full" v-model:value="end" :format="dateFormatList" />
                        </a-form-item>
                    </div>
                </div>
                <!-- Nút hành động -->
                <div class="flex justify-end space-x-2 mt-4">
                    <a-button @click="resetFilters">Đặt lại</a-button>
                    <a-button type="primary" @click="applyFilters" class="bg-blue-500 hover:bg-blue-600 text-white">Tìm
                        kiếm</a-button>
                </div>
            </div>

        </a-form>
    </div>
</template>