<template>
    <div class="relative">
        <!-- Popup Trigger Button -->
        <button @click="toggleChat"
            class="flex bg-[#227C9D] border-none justify-center p-3 rounded-full shadow-lg text-white bottom-6 cursor-pointer duration-200 fixed hover:bg-[#15C5B2] items-center right-6 transition-all z-10"
            :class="{'rotate-45': isChatOpen }">
            <MessageOutlined v-if="!isChatOpen" class="h-full text-lg w-full" />
            <CloseOutlined v-else class="h-full text-lg w-full"/>
        </button>

        <!-- Chat Component -->
        <Transition enter-active-class="duration-300 ease-out transition"
            enter-from-class="opacity-0 transform translate-y-10" enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="duration-200 ease-in transition" leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform translate-y-10" class="chat_ai">
            <div v-if="isChatOpen"
                class="flex flex-col bg-white border border-gray-200 rounded-lg shadow-xl w-80 bottom-24 fixed overflow-hidden right-6 sm:w-96 z-10"
                style="height: 400px;">
                <!-- Chat Header -->
                <div class="flex bg-[#227C9D] justify-between p-4 text-white items-center">
                    <div class="flex items-center">
                        <div class="flex bg-white/20 h-10 justify-center rounded-full w-10 items-center mr-3">
                            <RobotOutlined class="h-full text-xl"/>
                        </div>
                        <div>
                            <h3 class="font-medium">Notibro AI</h3>
                            <div class="flex text-indigo-100 text-xs items-center">
                                <span class="bg-green-400 h-2 rounded-full w-2 mr-1"></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button @click="toggleChat" class="bg-transparent border-none rounded-full text-white cursor-pointer transition">
                        <CloseOutlined class="h-full text-lg w-full"/>
                    </button>
                </div>

                <!-- Chat Messages -->
                <div ref="messagesContainer" class="flex-1 bg-gray-50 p-4 overflow-y-auto">
                    <div v-for="(message, index) in messages" :key="index" class="mb-4">
                        <div :class="[
                            'max-w-[80%] rounded-lg p-3 break-words',
                            message.isUser ?
                                'bg-indigo-600 text-white ml-auto rounded-br-none' :
                                'bg-gray-200 text-gray-800 rounded-bl-none'
                        ]">
                            {{ message.text }}
                            <div :class="[
                                'text-xs mt-1',
                                message.isUser ? 'text-indigo-200' : 'text-gray-500'
                            ]">
                                {{ message.time }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Typing Indicator -->
                    <div v-if="isTyping" class="flex items-center space-x-2">
                        <div class="bg-gray-200 p-3 rounded-lg">
                            <div class="flex space-x-1">
                                <div class="bg-gray-500 h-2 rounded-full w-2 animate-bounce" style="animation-delay: 0ms"></div>
                                <div class="bg-gray-500 h-2 rounded-full w-2 animate-bounce" style="animation-delay: 150ms"></div>
                                <div class="bg-gray-500 h-2 rounded-full w-2 animate-bounce" style="animation-delay: 300ms"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Input -->
                <div class="bg-white border border-t-2 border-gray-600 p-3">
                    <div class="flex items-center">
                        <input v-model="newMessage" @keyup.enter="sendMessage" type="text"
                            placeholder="Nhập tin nhắn..."
                            class="flex-1 border border-1 border-[#227C9D] rounded-full px-4 py-2 focus:outline-none" />
                        <button @click="sendMessage"
                            class="bg-[#227C9D] rounded-full text-white cursor-pointer focus:outline-none ml-2 px-[10px] py-2"
                            :disabled="!newMessage.trim()">
                            <SendOutlined />
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { CloseOutlined, MessageOutlined, PlusOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons-vue'
import axios from 'axios';
import { ref, computed, onMounted, nextTick, watch } from 'vue'


// State
const isChatOpen = ref(false)
const newMessage = ref('')
const isTyping = ref(false)
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const messages = ref([
    {
        text: 'Hello! How can I help you today?',
        isUser: false,
        time: formatTime(new Date())
    }
])
const messagesContainer = ref(null)

// Methods
function toggleChat() {
    isChatOpen.value = !isChatOpen.value
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    messages.value.push({
        text: newMessage.value,
        isUser: true,
        time: formatTime(new Date())
    });

    const userMessage = newMessage.value;
    newMessage.value = '';
    isTyping.value = true;

    try {
        const response = await axios.post(
            `${dirApi}ai/extract-fields`,
            { message: userMessage },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if(response.data.code == 200){
            isTyping.value = false;
            console.log(response);

            messages.value.push({
                text: response.data.message,
                isUser: false,
                time: formatTime(new Date())
            });
        }
    } catch (error) {
        isTyping.value = false;
        if(error){
            console.log(response);

            messages.value.push({
                text: 'Sorry, I can not create event as you told me. Please try again later.',
                isUser: false,
                time: formatTime(new Date())
            });
        }
    }
}

// Auto-scroll to bottom when new messages arrive
watch(messages, () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}, { deep: true })

// Scroll to bottom on initial mount
onMounted(() => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
})
</script>
<style scoped>
    .chat_ai {
        width: 500px !important;
        height: 500px !important;
    }
</style>