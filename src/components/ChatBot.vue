<template>
    <div class="relative">
        <!-- Popup Trigger Button -->
        <button @click="toggleChat"
            class="fixed bottom-6 border-none cursor-pointer right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center justify-center z-10"
            :class="{ 'rotate-45': isChatOpen }">
            <MessageOutlined v-if="!isChatOpen" class="w-full h-full text-lg" />
            <PlusOutlined v-else class="w-full h-full text-lg"/>
        </button>

        <!-- Chat Component -->
        <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform translate-y-10 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform translate-y-10 opacity-0" class="chat_ai">
            <div v-if="isChatOpen"
                class="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col z-10 border border-gray-200"
                style="height: 400px;">
                <!-- Chat Header -->
                <div class="bg-indigo-600 text-white p-4 flex justify-between items-center">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                            <RobotOutlined class="h-full text-xl"/>
                        </div>
                        <div>
                            <h3 class="font-medium">Chat Support</h3>
                            <div class="text-xs text-indigo-100 flex items-center">
                                <span class="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button @click="toggleChat" class="text-white border-none rounded-full bg-transparent cursor-pointer transition">
                        <CloseOutlined class="w-full h-full text-lg"/>
                    </button>
                </div>

                <!-- Chat Messages -->
                <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50">
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
                </div>

                <!-- Chat Input -->
                <div class="p-3 border-t border-gray-200 bg-white">
                    <div class="flex items-center">
                        <input v-model="newMessage" @keyup.enter="sendMessage" type="text"
                            placeholder="Type a message..."
                            class="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:ring-2 focus:ring-indigo-500" />
                        <button @click="sendMessage"
                            class="ml-2 bg-indigo-600 text-white rounded-full cursor-pointer px-[10px] py-2 hover:bg-indigo-700 focus:outline-none"
                            :disabled="!newMessage.trim()">
                            <SendOutlined class="w-full h-full" />
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { CloseOutlined, MessageOutlined, PlusOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons-vue'
import { ref, computed, onMounted, nextTick, watch } from 'vue'


// State
const isChatOpen = ref(false)
const newMessage = ref('')
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

function sendMessage() {
    if (!newMessage.value.trim()) return

    // Add user message
    messages.value.push({
        text: newMessage.value,
        isUser: true,
        time: formatTime(new Date())
    })

    // Clear input
    const userMessage = newMessage.value
    newMessage.value = ''

    // Simulate response after a short delay
    setTimeout(() => {
        messages.value.push({
            text: getAutoResponse(userMessage),
            isUser: false,
            time: formatTime(new Date())
        })
    }, 1000)
}

function getAutoResponse(message) {
    const responses = [
        "Thanks for your message! Our team will get back to you soon.",
        "I understand. Could you provide more details?",
        "That's interesting! Let me check that for you.",
        "I'm here to help. Is there anything else you'd like to know?",
        "Great question! The answer depends on several factors."
    ]

    return responses[Math.floor(Math.random() * responses.length)]
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
        width: 550px !important;
        height: 600px !important;
    }
</style>