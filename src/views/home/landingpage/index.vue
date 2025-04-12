<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="logo">
          <img :src="logo" alt="Notibro logo" class="logo-img" />
        </div>
        <nav class="nav">
          <a @click.prevent="scrollToSection('hero')" class="nav-link">Trang chủ</a>
          <a @click.prevent="scrollToSection('features')" class="nav-link">Tính năng</a>
          <a @click.prevent="scrollToSection('how-it-works')" class="nav-link">Cách thức</a>
          <a @click.prevent="scrollToSection('testimonials')" class="nav-link">Khách hàng </a>
        </nav>
        <div class="auth-buttons">
          <a-button type="text" class="login-btn" @click="handleLogin">Đăng nhập</a-button>
          <a-button type="primary" class="register-btn" @click="handleRegister">Đăng ký</a-button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section id="hero" class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="gradient-text">Notibro</span> - Quản lý công việc thông minh
      </h1>
          <p class="hero-subtitle">
            Giải pháp quản lý công việc toàn diện, giúp bạn làm việc hiệu quả hơn
          </p>
          <div class="hero-buttons">
            <a-button type="primary" size="large" class="primary-button" @click="handleGetStarted">
              Bắt đầu ngay
            </a-button>
            <a-button size="large" class="secondary-button" @click="handleLearnMore">
              Tìm hiểu thêm
            </a-button>
          </div>
          <div class="hero-stats">
            <div class="stat-item" v-for="(stat, index) in stats" :key="index">
              <span class="stat-number">{{ stat.number }}</span>
              <span class="stat-text">{{ stat.text }}</span>
            </div>
          </div>
        </div>
        <div class="hero-image">
          <img :src="heroImage" alt="Notibro Dashboard" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Tính năng nổi bật</h2>
          <p class="section-description">
            Khám phá những tính năng giúp bạn quản lý công việc hiệu quả hơn
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Cách thức hoạt động</h2>
          <p class="section-description">
            Đơn giản, dễ dàng và hiệu quả
          </p>
    </div>

        <div class="steps-container">
          <div class="step-item" v-for="(step, index) in steps" :key="index">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="testimonials">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <h2 class="section-title">Khách hàng nói gì</h2>
          <p class="section-description">
            Những phản hồi từ người dùng của chúng tôi
          </p>
    </div>

        <div class="testimonials-slider animate-on-scroll">
          <div class="slider-container">
            <div class="slider-content">
              <div 
                v-for="(testimonial, index) in testimonials" 
                :key="index"
                class="testimonial-card"
                :class="{ active: currentSlide === index }"
              >
                <div class="testimonial-rating">
                  <template v-for="star in 5" :key="star">
                    <StarFilled v-if="star <= testimonial.rating" class="star-filled" />
                    <StarOutlined v-else class="star-outlined" />
                  </template>
                </div>
                <div class="testimonial-content">
                  <p class="testimonial-text">{{ testimonial.text }}</p>
                </div>
                <div class="testimonial-author">
                  <a-avatar :size="48" :src="testimonial.avatar" />
                  <div class="author-info">
                    <h4 class="author-name">{{ testimonial.name }}</h4>
                    <p class="author-role">{{ testimonial.role }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="slider-controls">
              <button class="slider-button prev" @click="prevSlide">
                <LeftOutlined />
              </button>
              <div class="slider-dots">
                <button 
                  v-for="(_, index) in testimonials" 
                  :key="index"
                  class="dot"
                  :class="{ active: currentSlide === index }"
                  @click="currentSlide = index"
                />
              </div>
              <button class="slider-button next" @click="nextSlide">
                <RightOutlined />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Sẵn sàng bắt đầu?</h2>
          <p class="cta-description">
            Đăng ký ngay hôm nay để trải nghiệm những tính năng tuyệt vời của Notibro
          </p>
          <a-button type="primary" size="large" class="cta-button" @click="handleGetStarted">
            Bắt đầu miễn phí
          </a-button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <img :src="logo" alt="Notibro logo" class="logo-img" />
            <p class="footer-description">
              Giải pháp quản lý công việc toàn diện cho cá nhân và doanh nghiệp
            </p>
          </div>
          <div class="footer-links">
            <div class="link-group" v-for="(group, index) in footerLinks" :key="index">
              <h4 class="link-group-title">{{ group.title }}</h4>
              <ul class="link-list">
                <li v-for="(link, linkIndex) in group.links" :key="linkIndex">
                  <a @click.prevent="scrollToSection(link.section)" class="footer-link">{{ link.text }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="copyright">
            © {{ new Date().getFullYear() }} Notibro. All Rights Reserved.
          </p>
          <div class="social-links">
            <a v-for="(social, index) in socialLinks" :key="index" :href="social.url" class="social-link">
              <component :is="social.icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import logo from '@/assets/images/logo.png'
import heroImage from '@/assets/images/Calender-FullPage.png'
import {
  CalendarOutlined,
  TeamOutlined,
  NotificationOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  StarFilled,
  StarOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons-vue';

// Placeholder images with updated colors
// const heroImage = 'https://via.placeholder.com/600x400/FFCB77/FFFFFF?text=Dashboard+Preview';
const user1Avatar = '';
const user2Avatar = '';
const user3Avatar = '';

const router = useRouter();

const stats = ref([
  { number: '10K+', text: 'Người dùng' },
  { number: '4.8/5', text: 'Đánh giá' },
  { number: '99.9%', text: 'Uptime' }
]);

const features = ref([
  {
    icon: CalendarOutlined,
    title: 'Lịch thông minh',
    description: 'Quản lý và theo dõi công việc một cách trực quan với lịch thông minh'
  },
  {
    icon: TeamOutlined,
    title: 'Làm việc nhóm',
    description: 'Cộng tác hiệu quả với đồng nghiệp trong các dự án'
  },
  {
    icon: NotificationOutlined,
    title: 'Nhắc nhở',
    description: 'Không bao giờ bỏ lỡ deadline với hệ thống nhắc nhở thông minh'
  },
  {
    icon: FileTextOutlined,
    title: 'Báo cáo',
    description: 'Theo dõi tiến độ và hiệu suất làm việc với báo cáo chi tiết'
  },
  {
    icon: BarChartOutlined,
    title: 'Phân tích',
    description: 'Đánh giá hiệu suất và đưa ra quyết định dựa trên dữ liệu'
  },
  {
    icon: SettingOutlined,
    title: 'Tùy chỉnh',
    description: 'Tùy chỉnh giao diện và tính năng theo nhu cầu của bạn'
  }
]);

const steps = ref([
  {
    title: 'Đăng ký tài khoản',
    description: 'Tạo tài khoản miễn phí và bắt đầu sử dụng Notibro'
  },
  {
    title: 'Thiết lập dự án',
    description: 'Tạo dự án mới và mời các thành viên tham gia'
  },
  {
    title: 'Quản lý công việc',
    description: 'Thêm công việc, gán người thực hiện và theo dõi tiến độ'
  },
  {
    title: 'Theo dõi hiệu suất',
    description: 'Xem báo cáo và phân tích hiệu suất làm việc'
  }
]);

const testimonials = ref([
  {
    text: 'Notibro đã giúp nhóm của chúng tôi làm việc hiệu quả hơn rất nhiều. Giao diện thân thiện và dễ sử dụng.',
    avatar: user1Avatar,
    name: 'Nguyễn Văn A',
    role: 'Trưởng phòng Marketing',
    rating: 5
  },
  {
    text: 'Tôi rất ấn tượng với các tính năng của Notibro. Đặc biệt là phần lịch và nhắc nhở rất hữu ích.',
    avatar: user2Avatar,
    name: 'Trần Thị B',
    role: 'Quản lý dự án',
    rating: 5
  },
  {
    text: 'Notibro đã giúp tôi quản lý thời gian và công việc tốt hơn. Tôi có thể dễ dàng theo dõi tiến độ của mình.',
    avatar: user3Avatar,
    name: 'Lê Văn C',
    role: 'Nhân viên phát triển',
    rating: 4
  },
  {
    text: 'Tính năng phân tích dữ liệu của Notibro rất mạnh mẽ. Nó giúp tôi đưa ra quyết định chính xác hơn.',
    avatar: user1Avatar,
    name: 'Phạm Thị D',
    role: 'Giám đốc điều hành',
    rating: 5
  },
  {
    text: 'Tôi đã thử nhiều công cụ quản lý dự án, nhưng Notibro là công cụ tốt nhất cho nhóm của tôi.',
    avatar: user2Avatar,
    name: 'Hoàng Văn E',
    role: 'Trưởng nhóm phát triển',
    rating: 5
  }
]);

const footerLinks = ref([
  {
    title: 'Liên kết nhanh',
    links: [
      { text: 'Trang chủ', section: 'hero' },
      { text: 'Tính năng', section: 'features' },
      { text: 'Cách thức', section: 'how-it-works' },
      { text: 'Khách hàng nói gì', section: 'testimonials' }
    ]
  },
  {
    title: 'Công ty',
    links: [
      { text: 'Về chúng tôi', section: '#' },
      { text: 'Blog', section: '#' },
      { text: 'Đối tác', section: '#' },
      { text: 'Tuyển dụng', section: '#' }
    ]
  },
  {
    title: 'Hỗ trợ',
    links: [
      { text: 'Trung tâm trợ giúp', section: '#' },
      { text: 'Liên hệ', section: '#' },
      { text: 'Tài liệu API', section: '#' },
      { text: 'Trạng thái hệ thống', section: '#' }
    ]
  },
  {
    title: 'Pháp lý',
    links: [
      { text: 'Điều khoản sử dụng', section: '#' },
      { text: 'Chính sách bảo mật', section: '#' },
      { text: 'Chính sách cookie', section: '#' },
      { text: 'GDPR', section: '#' }
    ]
  }
]);

const socialLinks = ref([
  { icon: FacebookOutlined, url: '#' },
  { icon: TwitterOutlined, url: '#' },
  { icon: InstagramOutlined, url: '#' },
  { icon: LinkedinOutlined, url: '#' }
]);

const handleLogin = () => {
  router.push('/login');
};

const handleRegister = () => {
  router.push('/register');
};

const handleGetStarted = () => {
  router.push('/register');
};

const handleLearnMore = () => {
  const featuresSection = document.querySelector('#features');
  featuresSection.scrollIntoView({ behavior: 'smooth' });
};

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const headerOffset = 80; // Height of fixed header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Animation observer
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(element => observer.observe(element));
};

// Testimonials slider
const currentSlide = ref(0);
const slideInterval = ref(null);

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % testimonials.value.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + testimonials.value.length) % testimonials.value.length;
};

const startAutoPlay = () => {
  slideInterval.value = setInterval(nextSlide, 5000);
};

const stopAutoPlay = () => {
  if (slideInterval.value) {
    clearInterval(slideInterval.value);
    slideInterval.value = null;
  }
};

onMounted(() => {
  animateOnScroll();
  startAutoPlay();
});

onBeforeUnmount(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #FEF9EF;
}

/* Header */
.header {
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.logo-img {
  height: 65px;
  width: 80px;
}

.nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #227C9D;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  padding: 8px 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #FFCB77;
    transition: width 0.3s;
  }

  &:hover {
    color: #FFCB77;
    transform: translateY(-2px);

    &::after {
      width: 100%;
    }
  }
}

.auth-buttons {
  display: flex;
  gap: 16px;
}

.login-btn {
  color: #666;
  font-weight: 500;
}

.register-btn {
  background: #FFCB77;
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 203, 119, 0.3);
  transition: all 0.3s;

  &:hover {
    background: #FE6D73;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(254, 109, 115, 0.4);
  }
}

/* Hero Section */
.hero {
  padding: 160px 0 80px;
  background: linear-gradient(135deg, #FEF9EF 0%, #FFFFFF 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 203, 119, 0.1), rgba(254, 109, 115, 0.1));
    clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}

.hero .container {
  display: flex;
  align-items: center;
  gap: 48px;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  color: #1a1a1a;
}

.gradient-text {
  background: linear-gradient(135deg, #FFCB77, #FE6D73);
    -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.primary-button {
  background: #FFCB77;
  border: none;
  height: 48px;
  padding: 0 32px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 203, 119, 0.3);
  transition: all 0.3s;

  &:hover {
    background: #FE6D73;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(254, 109, 115, 0.4);
  }
}

.secondary-button {
  height: 48px;
  padding: 0 32px;
  font-weight: 600;
  border: 2px solid #FFCB77;
  color: #FFCB77;
  background: transparent;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 203, 119, 0.1);
    transform: translateY(-2px);
    border-color: #FE6D73;
    color: #FE6D73;
  }
}

.hero-stats {
  display: flex;
  gap: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #227C9D;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-text {
  font-size: 14px;
  color: #227C9D;
  font-weight: 500;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

/* Features Section */
.features {
  padding: 80px 0;
  background: #FFFFFF;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 203, 119, 0.05), rgba(254, 109, 115, 0.05));
    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  }
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.section-description {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  background: #FFFFFF;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 1px solid rgba(255, 203, 119, 0.2);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(255, 203, 119, 0.2);
    border-color: #FFCB77;
  }
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FFCB77, #FE6D73);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(255, 203, 119, 0.3);
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: #227C9D;
  margin-bottom: 12px;
}

.feature-description {
  font-size: 16px;
  color: #227C9D;
  line-height: 1.6;
  opacity: 0.8;
}

/* How It Works Section */
.how-it-works {
  padding: 80px 0;
  background: #FEF9EF;
  position: relative;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.step-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #FFCB77, #FE6D73);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 203, 119, 0.3);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: #227C9D;
  margin-bottom: 8px;
}

.step-description {
  font-size: 16px;
  color: #227C9D;
  line-height: 1.6;
  opacity: 0.8;
}

/* Testimonials Section */
.testimonials {
  padding: 80px 0;
  background: #FFFFFF;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 203, 119, 0.05), rgba(254, 109, 115, 0.05));
    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  }
}

.testimonials-slider {
  position: relative;
  padding: 20px 0;
}

.slider-container {
  position: relative;
  padding: 20px 0;
}

.slider-content {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.testimonial-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.5s ease;
  pointer-events: none;
}

.testimonial-card.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.testimonial-rating {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.star-filled {
  color: #FFCB77;
  font-size: 16px;
}

.star-outlined {
  color: #FFCB77;
  font-size: 16px;
  opacity: 0.5;
}

.testimonial-content {
  flex: 1;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.testimonial-text {
  font-size: 16px;
  color: #227C9D;
  line-height: 1.6;
  font-style: italic;
  opacity: 0.9;
  margin: 0;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  position: relative;
  z-index: 1;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 203, 119, 0.2);
}

.author-info {
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #227C9D;
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    color: #227C9D;
    opacity: 0.8;
    margin: 0;
  }
}

.slider-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.slider-button {
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  color: #FFCB77;

  &:hover {
    background: #FFCB77;
    color: white;
    transform: scale(1.1);
  }
}

.slider-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #FFCB77;
  opacity: 0.5;
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  &.active {
    opacity: 1;
    transform: scale(1.2);
  }

  &:hover {
    opacity: 0.8;
  }
}

/* CTA Section */
.cta {
  padding: 80px 0;
  background: linear-gradient(135deg, #FFCB77, #FE6D73);
  text-align: center;
    color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.1;
  }
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cta-description {
    font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.cta-button {
  background: white;
  color: #FFCB77;
  border: none;
  height: 48px;
  padding: 0 32px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    color: #FE6D73;
  }
}

/* Footer */
.footer {
  background: #FFFFFF;
  padding: 80px 0 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 64px;
  margin-bottom: 48px;
}

.footer-logo {
  .logo-img {
    height: 65px;
  width: 80px;
    margin-bottom: 16px;
  }
}

.footer-description {
  color: #666;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.link-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-link {
  color: #227C9D;
    text-decoration: none;
  display: block;
  margin-bottom: 8px;
  transition: all 0.3s;
  font-weight: 500;

  &:hover {
    color: #FFCB77;
    transform: translateX(4px);
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.copyright {
  color: #666;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  color: #227C9D;
  font-size: 20px;
  transition: all 0.3s;

  &:hover {
    color: #FFCB77;
    transform: translateY(-2px);
  }
}

/* Animation Classes */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.animate-on-scroll.animate {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    height: auto;
    padding: 16px;
  }

  .nav {
    margin: 16px 0;
  }

  .hero {
    padding: 120px 0 40px;
  }

  .hero .container {
    flex-direction: column;
    text-align: center;
  }

  .hero-content {
    margin-bottom: 40px;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-title {
    font-size: 36px;
  }

  .section-title {
    font-size: 28px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .slider-content {
    height: 400px;
  }

  .testimonial-card {
    padding: 20px;
  }

  .slider-button {
    display: none;
  }
  }
</style>
