<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const router = useRouter();
const isLoaded = ref(false);

onMounted(() => {
  isLoaded.value = true;
});
</script>

<template>
  <section class="error-page">
    <div class="error-container" :class="{ 'loaded': isLoaded }">
      <div class="error-content">
        <div class="error-left">
          <div class="error-status">
            <div class="status-code">
              <span data-text="4">4</span>
              <span data-text="0">0</span>
              <span data-text="4">4</span>
            </div>
            <div class="status-message">Oops! Trang không tồn tại</div>
          </div>
          
          <p class="error-description">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại. Dưới đây là một số liên kết hữu ích:
          </p>

          <div class="error-actions">
            <button @click="router.go(-1)" class="action-button back-button">
              <span class="button-content">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                  stroke="currentColor" class="button-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                </svg>
                Quay lại
              </span>
            </button>

            <router-link to="/" class="action-button home-button">
              <span class="button-content">
                <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" fill="none" viewBox="0 0 24 24" 
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Về trang chủ
              </span>
            </router-link>
          </div>
        </div>

        <div class="error-right">
          <div class="illustration-container">
            <div class="circle"></div>
            <div class="astronaut">
              <img src="https://assets.codepen.io/1538474/astronaut.svg" alt="astronaut" class="astronaut-image" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Animation -->
    <div class="stars">
      <div v-for="n in 20" :key="n" class="star" :style="{ 
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`
      }"></div>
    </div>

    <!-- Thêm shooting stars -->
    <div class="shooting-stars">
      <div v-for="n in 5" :key="n" class="shooting-star" :style="{
        top: `${Math.random() * 50}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`
      }"></div>
    </div>
  </section>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e, #16213e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}

.error-container {
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out;
}

.error-container.loaded {
  opacity: 1;
  transform: translateY(0);
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
}

.error-left {
  flex: 1;
}

.error-status {
  margin-bottom: 2rem;
}

.status-code {
  font-size: 8rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 1rem;
  display: flex;
}

.status-code span {
  position: relative;
  display: inline-block;
  color: #fff;
  animation: float 6s ease-in-out infinite;
}

.status-code span:nth-child(2) {
  animation-delay: -2s;
}

.status-code span:nth-child(3) {
  animation-delay: -4s;
}

.status-code span::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  color: #0ff;
  filter: blur(0.02em);
  animation: glitch 0.4s infinite;
}

.status-code span::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  color: #f0f;
  filter: blur(0.02em);
  animation: glitch 0.4s infinite reverse;
}

.status-message {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255,255,255,0.3);
}

.error-description {
  color: #a0aec0;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
}

.button-icon {
  width: 1.2rem;
  height: 1.2rem;
  stroke: currentColor;
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.home-button {
  background: linear-gradient(45deg, #00a8ff, #0097e6);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 168, 255, 0.3);
}

.home-button:hover {
  background: linear-gradient(45deg, #0097e6, #00a8ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 168, 255, 0.4);
}

.error-right {
  flex: 1;
  position: relative;
}

.illustration-container {
  position: relative;
  width: 100%;
  height: 400px;
}

.circle {
  position: absolute;
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #00a8ff20, #0097e620);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 4s ease-in-out infinite;
}

.astronaut {
  position: absolute;
  width: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 6s ease-in-out infinite;
}

.astronaut-image {
  width: 100%;
  height: auto;
}

/* Stars Animation */
.stars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s infinite;
  box-shadow: 0 0 3px #fff,
              0 0 5px #fff,
              0 0 7px #fff;
}

/* Thêm CSS cho shooting stars */
.shooting-stars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.shooting-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: linear-gradient(to right, rgba(255,255,255,0), #fff);
  animation: shooting 3s linear infinite;
}

.shooting-star::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 1px;
  background: linear-gradient(to right, rgba(255,255,255,0.8), transparent);
  transform: translateX(-100%);
}

@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-20px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.3;
  }
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.7);
  }
}

/* Thêm animation cho shooting stars */
@keyframes shooting {
  0% {
    transform: translateX(0) translateY(0) rotate(-45deg);
    opacity: 1;
  }
  100% {
    transform: translateX(1000px) translateY(1000px) rotate(-45deg);
    opacity: 0;
  }
}

/* Thêm hiệu ứng glow cho các ngôi sao */
.star::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  filter: blur(2px);
  transform: translate(-50%, -50%);
  opacity: 0.3;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  0% {
    filter: blur(2px);
    opacity: 0.3;
  }
  100% {
    filter: blur(4px);
    opacity: 0.5;
  }
}

/* Thêm các size khác nhau cho ngôi sao */
.star:nth-child(3n) {
  width: 1px;
  height: 1px;
}

.star:nth-child(3n+1) {
  width: 2px;
  height: 2px;
}

.star:nth-child(3n+2) {
  width: 3px;
  height: 3px;
}

/* Thêm animation delay khác nhau cho từng ngôi sao */
.star:nth-child(5n) { animation-delay: 0.1s; }
.star:nth-child(5n+1) { animation-delay: 0.3s; }
.star:nth-child(5n+2) { animation-delay: 0.5s; }
.star:nth-child(5n+3) { animation-delay: 0.7s; }
.star:nth-child(5n+4) { animation-delay: 0.9s; }

/* Thêm animation duration khác nhau */
.star:nth-child(4n) { animation-duration: 1.5s; }
.star:nth-child(4n+1) { animation-duration: 2s; }
.star:nth-child(4n+2) { animation-duration: 2.5s; }
.star:nth-child(4n+3) { animation-duration: 3s; }

</style>
