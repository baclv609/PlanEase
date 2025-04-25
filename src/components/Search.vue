<script setup>
import { ref, watch } from "vue";
import {
    TrophyOutlined,
    SettingOutlined,
    UserOutlined,
    CaretUpOutlined,
    CaretDownOutlined,
    SearchOutlined,
    CloseOutlined,
} from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from 'dayjs';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();

const { t } = useI18n();

const searchQuery = ref("");
const showFilters = ref(false); // Ẩn bộ lọc ban đầu
const dateFormatList = ['YYYY-MM-DD']

const searchType = ref(null);
const eventName = ref("");
const start = ref(null);
const end = ref(null);
const location = ref("");
const token = localStorage.getItem('access_token');
const dirApi = import.meta.env.VITE_API_BASE_URL;

const myTags = ref([]);
const myShareTags = ref([]);
const allTags = ref([]);
const searchOptions = ref([]);

const fetchTags = async () => {
    try {
        const response = await axios.get(`${dirApi}tags/list`, {
            headers: {
            'Authorization': `Bearer ${token}`
            }
        });

        if(response.data.code == 200){
            myTags.value = response.data.data.owned;
            myShareTags.value = response.data.data.shared_as_editor;

            allTags.value = [...myTags.value, ...myShareTags.value];

            searchOptions.value = allTags.value.map(tag => ({ label: tag.name, value: tag.id }));
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
};

const toggleFilters = () => {
    showFilters.value = !showFilters.value;
    if (showFilters.value) {
        fetchTags();
    }
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
    <div class="relative w-full max-w-md mx-auto">
        <a-form layout="vertical" @finish="applyFilters">
            <!-- Thanh tìm kiếm chính -->
            <div class="flex items-center bg-white rounded-full px-3" style="border: 1.5px solid #15C5B2;">
                <a-input v-model:value="eventName" :placeholder="t('search.placeholder.mainSearch')"
                    class="border-none flex-1 !shadow-none !ring-0 p-0 !outline-none text-sm"
                    @pressEnter="applyFilters">
                    <template #prefix>
                        <SearchOutlined class="text-gray-500 text-lg mx-2" />
                    </template>

                    <template #suffix>
                        <div class="flex items-center gap-2">
                            <a-button v-if="eventName" type="text"
                                class="text-gray-500 hover:bg-gray-100 p-1 border-none px-3 rounded-full"
                                @click="eventName = ''">
                                <CloseOutlined />
                            </a-button>
                            <a-button @click="toggleFilters"
                                class="text-gray-500 hover:bg-gray-100 p-1 border-none px-3 rounded-full">
                                <CaretDownOutlined v-if="!showFilters" />
                                <CaretUpOutlined v-else />
                            </a-button>
                        </div>
                    </template>
                    <!-- Bộ lọc nâng cao -->
                </a-input>
            </div>
            <div v-show="showFilters"
                class="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg p-4 z-50 mt-2">
                <div class="grid grid-cols-2 gap-4">
                    <!-- Cột 1 -->
                    <div>
                        <a-form-item :label="t('search.searchByTag')">
                            <a-select v-model:value="searchType" :placeholder="t('search.placeholder.chooseTag')" :options="searchOptions" class="w-full" />
                        </a-form-item>
                    </div>

                    <!-- Cột 2 -->
                    <div>
                        <a-form-item :label="t('search.title')">
                            <a-input v-model:value="eventName" :placeholder="t('search.placeholder.enterTitle')" class="w-full" />
                        </a-form-item>
                    </div>
                </div>
                <a-form-item :label="t('search.location')">
                    <a-input v-model:value="location" :placeholder="t('search.placeholder.enterLocation')" class="w-full" />
                </a-form-item>
                <div class="grid grid-cols-11 gap-2 items-center">
                    <div class="col-span-5">
                        <a-form-item :label="t('search.start')">
                            <a-date-picker class="w-full" :placeholder="t('search.placeholder.chooseDate')" v-model:value="start" :format="dateFormatList" />
                        </a-form-item>
                    </div>

                    <div class="col-span-1 text-center">
                        <span>{{ t('search.to') }}</span>
                    </div>

                    <div class="col-span-5">
                        <a-form-item :label="t('search.end')">
                            <a-date-picker class="w-full" :placeholder="t('search.placeholder.chooseDate')" v-model:value="end" :format="dateFormatList" />
                        </a-form-item>
                    </div>
                </div>
                <!-- Nút hành động -->
                <div class="flex justify-end space-x-2 mt-4">
                    <a-button @click="resetFilters">{{ t('search.reset') }}</a-button>
                    <a-button type="primary" @click="applyFilters" class="bg-blue-500 hover:bg-blue-600 text-white">{{ t('search.search') }}</a-button>
                </div>
            </div>

        </a-form>
    </div>
</template>