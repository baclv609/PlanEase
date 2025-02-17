<template>
    <nav class="relative bg-white shadow dark:bg-gray-800">
      <div class="container px-6 py-4 mx-auto">
        <div class="lg:flex lg:items-center lg:justify-between">
          <div class="flex items-center justify-between">
            <RouterLink to="/" class="flex items-center">
              <img class="w-auto h-6 sm:h-7" src="/logo.svg" alt="Logo" />
            </RouterLink>
            <button
              @click="isOpen = !isOpen"
              type="button"
              class="lg:hidden text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
              aria-label="toggle menu"
            >
              <svg v-if="!isOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            :class="[isOpen ? 'block' : 'hidden', 'lg:flex lg:items-center']"
            class="absolute inset-x-0 z-20 w-full px-6 py-4 bg-white dark:bg-gray-800 lg:relative lg:w-auto lg:bg-transparent"
          >
            <div class="flex flex-col lg:flex-row lg:items-center">
              <RouterLink
                to="/calendar"
                class="px-3 py-2 mx-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >Lịch</RouterLink>
              <RouterLink
                to="/tasks"
                class="px-3 py-2 mx-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >Công việc</RouterLink>
              <RouterLink
                to="/settings"
                class="px-3 py-2 mx-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >Cài đặt</RouterLink>
            </div>
            <div class="flex items-center mt-4 lg:mt-0">
              <button @click="toggleNotifications" class="hidden lg:block text-gray-600 dark:text-gray-200">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" />
                </svg>
              </button>
              <button @click="toggleProfileMenu" class="relative flex items-center focus:outline-none">
                <div class="w-8 h-8 overflow-hidden border-2 border-gray-400 rounded-full">
                  <img v-if="user.avatar" :src="user.avatar" class="object-cover w-full h-full" alt="avatar" />
                  <img v-else src="/default-avatar.png" class="object-cover w-full h-full" alt="default avatar" />
                </div>
              </button>
              <div v-if="isProfileMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2">
                <RouterLink to="/profile" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Hồ sơ</RouterLink>
                <button @click="logout" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Đăng xuất</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const isOpen = ref(false);
  const isProfileMenuOpen = ref(false);
  const authStore = useAuthStore();
  const router = useRouter();
  const user = authStore.user;
  
  const toggleProfileMenu = () => {
    isProfileMenuOpen.value = !isProfileMenuOpen.value;
  };
  
  const logout = () => {
    authStore.logout();
    router.push('/login');
  };
  </script>
  
  <style scoped>
  nav {
    transition: all 0.3s ease-in-out;
  }
  </style>
  