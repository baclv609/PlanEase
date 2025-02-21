<template>
    <div>
        Waiting...
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';


const dirApi = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const route = useRoute();

onMounted(() => {
    router.push({name: 'login'});
});
</script>