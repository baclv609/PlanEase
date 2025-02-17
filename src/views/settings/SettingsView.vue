<template>
    <router-link to="/calendar" aria-label="logo" class="flex items-center space-x-2">
        <div aria-hidden="true" class="flex space-x-1">
            <div class="size-4 rounded-full bg-gray-900 dark:bg-white"></div>
            <div class="h-6 w-2 bg-primary"></div>
        </div>

        <a-button type="default" :icon="h(ArrowLeftOutlined)">Back</a-button>
    </router-link>
    <a-tabs v-model:activeKey="activeKey" tab-position="left" animated>
        <a-tab-pane key="1" tab="Edit profile">Content of Tab 1</a-tab-pane>
        <a-tab-pane key="2" tab="Change password">Content of Tab 2</a-tab-pane>
        <a-tab-pane key="3" tab="Language">Content of Tab 2</a-tab-pane>
        <a-tab-pane key="4" tab="Time zone">Content of Tab 2</a-tab-pane>


    </a-tabs>

</template>
<script setup>
import { ref, h } from 'vue';
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
const tabPosition = ref('top');
const activeKey = ref('1');
</script>


