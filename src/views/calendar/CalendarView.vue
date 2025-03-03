<template>
  <a-card :title="`Lịch trình ngày ${day}/${month}/${year}`">
    <p>Danh sách sự kiện cho ngày này sẽ được hiển thị ở đây.</p>
    <a-button type="primary" @click="goBack">Quay lại</a-button>
  </a-card>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import { useCalendar } from "@/composables/useCalendar.js";

const { transformedEvents } = useCalendar();

const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (transformedEvents.value.length === 0) {
      console.log("transformedEvents", transformedEvents.value);
      message.info("Khoang thoi gian nay khong co su kien nao");
      router.push("/calendar");
    } else {
      console.log("transformedEvents.value", transformedEvents.value);
      
  }
})
const { year, month, day } = route.params;

const goBack = () => {
  router.push("/");
};
</script>
