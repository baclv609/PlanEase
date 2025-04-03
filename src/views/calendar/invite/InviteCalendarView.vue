<script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRoute, useRouter } from 'vue-router';
  import { message } from 'ant-design-vue';
  import event from '@/router/event';
  import unknowUser from '@/assets/images/unknow_user.jpg';
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const dirApi = import.meta.env.VITE_API_BASE_URL;
  const route = useRoute();
  const router = useRouter();
  const token = localStorage.getItem('access_token');
  const id = route.params.id;
  const eventDetails = ref(null);
  const attendees = ref([]);
  const userSetting = JSON.parse(localStorage.getItem('userSettings'));

  onMounted(async () => {
    try {
      const response = await axios.get(`${dirApi}event/${id}/invite`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log(response.data);
      if(response.data.code == 404) {
        message.info(response.data.message || 'Event not found');
        router.push({ name: 'calendar' });
      }

      if(response.data.code == 200) {
        eventDetails.value = response.data.data;
        console.log(eventDetails.value);
        attendees.value = response.data.data.attendees;
        // console.log(attendees);
      }

    } catch (error) {
      console.error('Error fetching event details:', error);
      router.push({name: 'calendar'})
    }
  });

  const accept = async () => {
    try {
      const response = await axios.post(`${dirApi}event/${id}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if(response.data.code == 400) {
        message.info(response.data.message || 'Can not invite yourself');
      }

      if(response.data.code == 409) {
        message.info(response.data.message || 'You have already accepted this event');
      }

      if(response.data.code == 200) {
        message.info(response.data.message);
      }

      router.push({name: 'calendar'});
    } catch(error) {
      console.log(error);
      router.push({name: 'calendar'});
    }
    
  }

  const refuse = async () => {
    try {
      const response = await axios.post(`${dirApi}event/${id}/refuse`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if(response.data.code == 404) {
        message.info(response.data.message || 'Event not found');
      }

      if(response.data.code == 200) {
        message.info(response.data.message)
        router.push({name: 'calendar'});
      }

    } catch(error) {
      console.log(error);
      router.push({name: 'calendar'});
    }
  }
</script>

<template>
  <div v-if="eventDetails" class="max-w-2xl mx-auto p-4 p-4 bg-white rounded-lg shadow-md">
    <!-- Header with calendar icon -->
    <div class="bg-blue-50 rounded-lg mb-4">
      <div class="flex justify-center">
        <div class="w-48 h-48 relative overflow-hidden border border-gray-200">
          <img class="w-full h-full object-cover" src="@/assets/images/attendee-removebg-preview.png" alt="Attendee">
        </div>
      </div>
    </div>

    <!-- Event details -->
    <div class="space-y-6">
      <div class="text-gray-800">
        <!-- <div class="text-lg">thứ năm, 27 tháng 2 • 6:00-7:00CH</div> -->
        <div class="text-lg">
          <p class="text-gray-500 text-sm mb-0">Múi giờ sự kiện</p>
          {{ dayjs.utc(eventDetails.task.start_time).tz(eventDetails.task.timezone_code).format('dddd, MMMM - D • HH:mm') }} - 
          {{ dayjs.utc(eventDetails.task.end_time).tz(eventDetails.task.timezone_code).format('dddd, MMMM - D • HH:mm') }}
          <span class="text-xs text-gray-500">{{ eventDetails.task.timezone_code }}</span>
        </div>

        <div class="text-lg mt-2" v-if="userSetting.timeZone != eventDetails.task.timezone_code">
          <p class="text-gray-500 text-sm mb-0">Múi giờ của bạn</p>
          {{ dayjs.utc(eventDetails.task.start_time).tz(userSetting.timeZone).format('dddd, MMMM - D • HH:mm') }} - 
          {{ dayjs.utc(eventDetails.task.end_time).tz(userSetting.timeZone).format('dddd, MMMM - D • HH:mm') }}
          <span class="text-xs text-gray-500">{{ userSetting.timeZone }}</span>
        </div>
      </div>

      <div class="">
        <!-- Event Title -->
        <div v-if="eventDetails.task.title" class="text-base font-semibold text-gray-800 mb-1">
          Title: {{ eventDetails.task.title }}
        </div>

        <!-- Event Description -->
        <div v-if="eventDetails.task.description" class="text-sm text-gray-600">
          Description: <p v-html="eventDetails.task.description"></p>
        </div>

        <div v-if="eventDetails.task.location" class="text-sm text-gray-600">
          Location: {{ eventDetails.task.location }}
        </div>
      </div>

      <hr>
      <!-- Attendees -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <div class="text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div class="text-sm">{{ eventDetails.quantityAttendee }} guest</div>
            <div class="text-xs text-gray-500">{{ eventDetails.quantityAttendee }} people agree to participate</div>
          </div>
        </div>
      </div>

      <!-- Organizer -->
      <div class="max-h-60 overflow-y-auto pr-2">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-10 h-10 rounded-full flex align-center justify-center">
            <img class="w-10 h-10 rounded-full" :src="eventDetails.task.user.avatar ?? unknowUser" alt="">
          </div>
          <div>
            <div class="text-sm font-medium">{{ eventDetails.task.user.first_name }} {{ eventDetails.task.user.last_name }} - <span class="text-green-500">Owner</span></div>
            <div class="text-xs text-gray-500">{{ eventDetails.task.user.email }}</div>
          </div>
        </div>
  
        <template v-for="attendee in attendees" :key="attendee.user_id">
          <div class="flex items-center gap-2 mt-0 mb-2">
            <div class="w-10 h-10 rounded-full flex align-center justify-center">
              <img class="w-10 h-10 rounded-full" :src="attendee.avatar ?? unknowUser" alt="">
            </div>
            <div>
              <div class="text-sm font-medium">{{ attendee.name }}</div>
              <div class="text-xs text-gray-500">{{ attendee.email }}</div>
            </div>
          </div>
        </template>
      </div>

      <!-- Email response -->
      <div class="text-center text-sm">
        <div class="mb-4">
          Would you like to participate in this event?
        </div>
        <div class="flex gap-2 justify-center">
          <button @click.prevent="accept" class="px-4 py-2 bg-orange-500 border-0 text-white cursor-pointer rounded-md hover:bg-orange-300">
            Yes
          </button>
          <button @click.prevent="refuse" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md border-0 cursor-pointer hover:bg-gray-100">
            No
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Additional styles can be added here if needed */
</style>