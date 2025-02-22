<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-[#FFF7E6] py-4">
      <div class="container mx-auto flex justify-between items-center px-4">
        <img :src="logo" alt="Notibro logo" class="h-16" />

        <nav class="flex space-x-4 text-gray-600">
          <a class="hover:underline text-orange-400" href="#"> Overview </a>
          <a class="hover:underline text-orange-400" href="#"> Notibro Plus </a>
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

      <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-4 leading-7 text-gradient">
        Easy Schedule - Work Better <br> Enjoy Life!
      </h1>
      <p class="text-gray-500 text-lg mb-8">
        Notibro offers an intuitive user experience, making it easy for you <br> to manage your schedule without difficulty.
      </p>
      <!-- <a
                href="#"
                class="bg-blue-400 bg-gradient-to-r border-none from-yellow-400 to-green-400 text-white font-bold py-2 px-6 rounded-full"
            >
                Trải nghiệm Notibro
            </a> -->
      <router-link to="#" @click.prevent="handleNavigation"
        class="border-none text-white font-bold gradient-button">
        Experience Notibro
      </router-link>

    </main>

    <!-- Features Section -->
    <div class="max-w-6xl mx-auto px-4 py-16 grid gap-16">
      <div v-for="(feature, index) in features" :key="index" class="grid md:grid-cols-2 gap-8 items-center" :class="{
        'order-first md:order-last': index % 2 === 0,
      }">
        <FeatureCard :icon="feature.icon" :title="feature.title" :description="feature.description" />
        <div class="bg-gray-100 rounded-lg aspect-video"></div>
      </div>
    </div>

    <!-- How People Use Section -->
    <div class="bg-blue-50 py-16">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">
          How people use Notibro
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <HowPeopleUseCard v-for="(useCase, index) in howPeopleUse" :key="index" :icon="useCase.icon"
            :title="useCase.title" :description="useCase.description" :additionalInfo="useCase.additionalInfo" />
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
import { RouterLink, useRouter } from "vue-router";
import FeatureCard from "@/views/home/landingpage/FeatureCard.vue";
import HowPeopleUseCard from "@/views/home/landingpage/HowPeopleUseCard.vue";
import iconMap from "@/utils/iconLoader";
import logo from "@/assets/images/logo.png";

const router = useRouter();

const handleNavigation = () => {
  const isAuthenticated = !!localStorage.getItem("access_token"); // Giả sử lưu token khi đăng nhập
  if (isAuthenticated) {
    router.push("/calendar");
  } else {
    router.push("/login");
  }
};

// Tạo dữ liệu cho phần "Features"
const features = ref([
  {
    title: "Upload information source",
    description:
      "Import events easily from other sources or other calendar applications. Automatically synchronize all information for more effective time management.",
    icon: iconMap["upload_icon.png"],
  },
  {
    title: "Instant insights",
    description:
      `View event details with just one click. Include information like time, location, and participants so you don't miss anything important.`,
    icon: iconMap["thunder 1.png"],
  },
  {
    title: "Grasp accurate information sources",
    description:
      "Search for events by keywords or smart filters. From personal work to team events, everything is clearly organized and easily accessible.",
    icon: iconMap["check-mark 1.png"],
  },
  {
    title: "Planning is more effective and enjoyable",
    description:
      `Intuitive scheduling tool with flexible display options: daily, weekly, monthly calendars. Integrated notifications and time suggestions help you always be ready.`,
    icon: iconMap["clipboard 1.png"],
  },
]);

// Tạo dữ liệu cho phần "How People Use"
const howPeopleUse = ref([
  {
    title: `Comprehensive schedule management`,
    description:
      "Import schedules from different sources such as calendar applications. The calendar is clearly displayed by day, week, or month, helping you easily control all your plans.",
    additionalInfo: "Keep everything at hand and manage your time better.",
    icon: iconMap["calendar 2.png"],
  },
  {
    title: "Organize work effectively",
    description:"Easily add, edit, or delete events with just a few clicks. Schedule automatic reminders so you don't miss any important tasks.",
    additionalInfo: "Confidently control your time.",
    icon: iconMap["layer 1.png"],
  },
  {
    title: "Time suggestions and work improvements",
    description:
      "The system automatically suggests free times or properly arranges group meetings based on everyone's participation. No more worrying about scheduling conflicts or missing information.",
    additionalInfo: "Discover how to work more efficiently than ever.",
    icon: iconMap["idea 1.png"],
  },
]);
</script>

<style scoped>
  .text-gradient {
    font-weight: bold;
    background: linear-gradient(90deg, #23c5b9, #97b67a, #f9c76c);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }

  .gradient-button {
    background: linear-gradient(90deg, #f6c36b, #20c3b3, #1a6dab);
    border: none;
    border-radius: 30px;
    color: white;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: 0.2s;
    text-decoration: none;
  }
  .gradient-button:hover {
      transform: scale(1.05);
      opacity: 85%;
  }
</style>
