<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-[#FFF7E6] py-4">
      <div class="container mx-auto flex justify-between items-center px-4">
        <img
          alt="Notibro logo"
          class="h-12"
          height="50"
          src="https://storage.googleapis.com/a1aa/image/Ay_6rK05hIiDux_42-LOWLz1JBImstwB5xxRPd-awzY.jpg"
          width="100"
        />
        <nav class="flex space-x-4 text-gray-600">
          <a class="hover:underline text-gray-600" href="#"> Tổng quan </a>
          <a class="hover:underline text-gray-600" href="#"> Notibro Plus </a>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="max-w-4xl mx-auto px-4 py-16 text-center">
      <!-- <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-4 leading-7">
        Làm việc
        <span class="text-[#00BFA6]"> hiệu quả </span>
        <span class="text-orange-400">hơn</span> là
        <br />
        tăng khối lượng công việc
      </h1>
      <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
        Trang web tích hợp AI giúp bạn nâng cao hiệu suất công việc và biết được thông tin nào là quan trọng đối với
        mình
      </p>
      <button
        class="bg-gradient-to-r from-yellow-400 to-green-400 text-white font-bold py-2 px-6 rounded-full"
      >
        Trải nghiệm Notibro
      </button> -->

      <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-4 leading-7">
        Cải thiện
        <span class="text-[#00BFA6]"> hiệu quả </span>
        <span class="text-orange-400">hơn</span> là
        <br />
        tăng khối lượng công việc
      </h1>
      <p class="text-gray-500 text-lg mb-8">
        Trang web tích hợp AI giúp bạn nâng cao hiệu suất công việc và biết
        <br />
        được thông tin nào là quan trọng đối với mình
      </p>
      <!-- <a
                href="#"
                class="bg-blue-400 bg-gradient-to-r border-none from-yellow-400 to-green-400 text-white font-bold py-2 px-6 rounded-full"
            >
                Trải nghiệm Notibro
            </a> -->
      <router-link
        to="#"
        class="bg-blue-400 bg-gradient-to-r border-none from-yellow-400 to-green-400 text-white font-bold py-2 px-6 rounded-full"
        >Trải nghiệm Notibro</router-link
      >
    </main>

    <!-- Features Section -->
    <div class="max-w-6xl mx-auto px-4 py-16 grid gap-16">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="grid md:grid-cols-2 gap-8 items-center"
        :class="{
          'order-first md:order-last': index % 2 === 0,
        }"
      >
        <FeatureCard
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
        />
        <div class="bg-gray-100 rounded-lg aspect-video"></div>
      </div>
    </div>

    <!-- How People Use Section -->
    <div class="bg-blue-50 py-16">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">
          Cách mọi người sử dụng Notibro
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <HowPeopleUseCard
            v-for="(useCase, index) in howPeopleUse"
            :key="index"
            :icon="useCase.icon"
            :title="useCase.title"
            :description="useCase.description"
            :additionalInfo="useCase.additionalInfo"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="bg-yellow-100 py-4">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <p class="text-[#000000] font-semibold m-0">
          © 2025 Notibro. All Rights Reserved. | Terms of Use | Privacy Policy
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import FeatureCard from "@/views/home/landingpage/FeatureCard.vue";
import HowPeopleUseCard from "@/views/home/landingpage/HowPeopleUseCard.vue";

// Tạo dữ liệu cho phần "Features"
const features = ref([
  {
    title: "Tải nguồn thông tin lên",
    description:
      "Nhập sự kiện dễ dàng từ các nguồn khác như file Excel, Google Sheets hoặc ứng dụng lịch khác. Tự động đồng bộ hóa mọi thông tin để quản lý thời gian hiệu quả hơn.",
    icon: "icon/upload_icon.png",
  },
  {
    title: "Thông tin chi tiết tức thì",
    description:
      "Xem chi tiết sự kiện chỉ với một cú nhấp chuột. Bao gồm thông tin như thời gian, địa điểm, và người tham gia, giúp bạn không bỏ lỡ bất kỳ điều gì quan trọng.",
    icon: "icon/flash_icon.png",
  },
  {
    title: "Nắm bắt nguồn thông tin chính xác",
    description:
      "Tìm kiếm sự kiện theo từ khóa hoặc bộ lọc thông minh. Từ công việc cá nhân đến sự kiện nhóm, mọi thứ đều được tổ chức rõ ràng và dễ dàng truy cập.",
    icon: "icon/check-mark_icon.png",
  },
  {
    title: "Lập kế hoạch hiệu quả và thú vị hơn",
    description:
      "Công cụ lập lịch trực quan với các tùy chọn hiển thị linh hoạt: lịch ngày, tuần, tháng. Tích hợp thông báo và gợi ý thời gian giúp bạn luôn sẵn sàng.",
    icon: "icon/clipboard_icon.png",
  },
]);

// Tạo dữ liệu cho phần "How People Use"
const howPeopleUse = ref([
  {
    title: "Quản lý lịch trình toàn diện",
    description:
      "Nhập lịch trình từ các nguồn khác nhau như ứng dụng lịch, file Excel, hoặc Google Sheets. Lịch được hiển thị rõ ràng theo ngày, tuần, hoặc tháng, giúp bạn dễ dàng kiểm soát mọi kế hoạch.",
    additionalInfo: "Giữ mọi thứ trong tầm tay và quản lý thời gian tốt hơn.",
    icon: "/icon/schedule-greenpastel_icon.png",
  },
  {
    title: "Sắp xếp công việc hiệu quả",
    description:
      "Dễ dàng thêm, chỉnh sửa, hoặc xóa sự kiện chỉ với vài cú nhấp chuột. Lập lịch trình tự động nhắc nhở để không bỏ lỡ bất kỳ công việc quan trọng nào.",
    additionalInfo: "Tự tin kiểm soát thời gian của bạn.",
    icon: "/icon/layers-greenpastel_icon.png",
  },
  {
    title: "Gợi ý thời gian và cải tiến công việc",
    description:
      "Hệ thống tự động gợi ý thời gian trống hoặc sắp xếp hợp lý các cuộc họp nhóm dựa trên sự tham gia của mọi người. Không còn lo lắng về việc trùng lịch hay bỏ sót thông tin.",
    additionalInfo: "Khám phá cách làm việc hiệu quả hơn bao giờ hết.",
    icon: "/icon/idea-greenpastel_icon.png",
  },
]);
</script>

<style scoped>
/* Bạn có thể thêm CSS tùy chỉnh nếu cần */
</style>
