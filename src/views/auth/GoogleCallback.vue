<template>
    <div>Wait a minutes...</div>
</template>
  
<script setup>
import { onMounted } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useEchoStore } from "@/stores/echoStore";

const dirApi = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const route = useRoute();

onMounted(() => {

    const token = route.query.token;

    if (token) {
        axios.get(`${dirApi}auth/google/get-google-user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            if(response.data.code == 200){
                localStorage.setItem('access_token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                const echoStore = useEchoStore();
                echoStore.initEcho();
                echoStore.startListening();

                message.success(response.data.message || 'Login successfully');
                router.push({name: 'calendar'});
            }else{
                message.error('Login failed');
                router.push({name: 'login'});
            }

        })
        .catch(error => {
            message.error('Login failed');
            router.push({name: 'login'});
        })
        
    } else {
        message.error('Login failed');
        router.push({ name: 'login' });
    }
});
</script>