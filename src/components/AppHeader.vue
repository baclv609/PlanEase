<template>
  <header>
    <nav
      id="nav"
      class="absolute group z-10 w-full border-b border-black/5 dark:border-white/5 lg:border-transparent"
    >
      <div class="container mx-auto">
        <div
          class="relative flex flex-wrap items-center justify-between gap-6 py-3 md:gap-0 md:py-4"
        >
          <div class="relative z-20 flex w-full justify-between md:px-0 lg:w-fit">
            <router-link
              to="/#home"
              aria-label="logo"
              class="flex items-center space-x-2"
            >
              <div aria-hidden="true" class="flex space-x-1">
                <div class="size-4 rounded-full bg-gray-900 dark:bg-white"></div>
                <div class="h-6 w-2 bg-primary"></div>
              </div>
              <span class="text-2xl font-bold text-gray-900 dark:text-white"
                >Astrolus</span
              >
            </router-link>

            <div class="relative flex max-h-10 items-center lg:hidden">
              <button
                aria-label="hamburger"
                id="hamburger"
                class="relative -mr-6 p-6 active:scale-95 duration-300"
                @click="toggleNavlinks"
              >
                <div
                  aria-hidden="true"
                  class="m-auto h-0.5 w-5 rounded bg-gray-950 transition duration-300 dark:bg-white origin-top"
                  :class="{ 'rotate-45 translate-y-1.5': isToggled }"
                ></div>
                <div
                  aria-hidden="true"
                  class="m-auto mt-2 h-0.5 w-5 rounded bg-gray-950 transition duration-300 dark:bg-white origin-bottom"
                  :class="{ '-rotate-45 -translate-y-1': isToggled }"
                ></div>
              </button>
            </div>
          </div>

          <div
            id="navLayer"
            aria-hidden="true"
            class="fixed inset-0 z-10 h-screen w-screen origin-bottom scale-y-0 bg-white/70 backdrop-blur-2xl transition duration-500"
            :class="{ 'scale-y-100': isToggled }"
          ></div>

          <div
            id="navlinks"
            class="invisible absolute top-full left-0 z-20 w-full origin-top-right translate-y-1 scale-90 flex-col flex-wrap justify-end gap-6 rounded-3xl border border-gray-100 bg-white p-8 opacity-0 shadow-2xl shadow-gray-600/10 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none"
            :class="{ 'visible scale-100 opacity-100': isToggled }"
          >
            <div
              class="w-full text-gray-600 dark:text-gray-200 lg:w-auto lg:pr-4 lg:pt-0"
            >
              <div
                id="links-group"
                class="flex flex-col gap-6 tracking-wide lg:flex-row lg:gap-0 lg:text-sm"
              >
                <a
                  v-for="link in links"
                  :key="link.label"
                  :href="link.to"
                  class="hover:text-primary block transition dark:hover:text-white md:px-4"
                >
                  <span>{{ link.label }}</span>
                </a>
                <a
                  href="https://tailtips.dev"
                  target="_blank"
                  class="flex gap-2 font-semibold text-gray-700 transition hover:text-primary dark:text-white dark:hover:text-white md:px-4"
                >
                  <span>TailwindCSS Tips</span>
                  <span
                    class="flex rounded-full border bg-primary/20 px-2 py-0.5 text-xs tracking-wider text-purple-700 dark:bg-white/10 dark:text-orange-300"
                    >New</span
                  >
                </a>
              </div>
            </div>

            <div class="mt-12 lg:mt-0">
              <router-link
                to="/register"
                class="relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
              >
                <span class="relative text-sm font-semibold text-white">
                  Get Started</span
                >
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from "vue";

const isToggled = ref(false);
const links = [
  { to: "/#features", label: "Features" },
  { to: "/#solution", label: "Solution" },
  { to: "/#reviews", label: "Reviews" },
  {
    to: "https://github.com/luasenvy/nextjs-astro-theme",
    label: "NextJS Version",
  },
];

const toggleNavlinks = () => {
  isToggled.value = !isToggled.value;
};
</script>

<style scoped>
/* Thêm các style tùy chỉnh ở đây nếu cần */
</style>
