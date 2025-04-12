<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">PlanEase</span> - Quản lý công việc thông minh
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
      </div>
      <div class="hero-image">
        <img src="@/assets/images/hero-image.png" alt="PlanEase Dashboard" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
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
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
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
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="section-header">
        <h2 class="section-title">Khách hàng nói gì</h2>
        <p class="section-description">
          Những phản hồi từ người dùng của chúng tôi
        </p>
      </div>

      <div class="testimonials-slider">
        <div class="testimonial-card" v-for="(testimonial, index) in testimonials" :key="index">
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
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Sẵn sàng bắt đầu?</h2>
        <p class="cta-description">
          Đăng ký ngay hôm nay để trải nghiệm những tính năng tuyệt vời của PlanEase
        </p>
        <a-button type="primary" size="large" class="cta-button" @click="handleGetStarted">
          Bắt đầu miễn phí
        </a-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  CalendarOutlined,
  TeamOutlined,
  NotificationOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';

const router = useRouter();

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
    description: 'Tạo tài khoản miễn phí và bắt đầu sử dụng PlanEase'
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
    text: 'PlanEase đã giúp nhóm của chúng tôi làm việc hiệu quả hơn rất nhiều. Giao diện thân thiện và dễ sử dụng.',
    avatar: '/avatars/user1.jpg',
    name: 'Nguyễn Văn A',
    role: 'Trưởng phòng Marketing'
  },
  {
    text: 'Tôi rất ấn tượng với các tính năng của PlanEase. Đặc biệt là phần lịch và nhắc nhở rất hữu ích.',
    avatar: '/avatars/user2.jpg',
    name: 'Trần Thị B',
    role: 'Quản lý dự án'
  },
  {
    text: 'PlanEase đã giúp tôi quản lý thời gian và công việc tốt hơn. Tôi có thể dễ dàng theo dõi tiến độ của mình.',
    avatar: '/avatars/user3.jpg',
    name: 'Lê Văn C',
    role: 'Nhân viên phát triển'
  }
]);

const handleGetStarted = () => {
  router.push('/register');
};

const handleLearnMore = () => {
  // Scroll to features section
  const featuresSection = document.querySelector('.features-section');
  featuresSection.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 5%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 80vh;
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
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
}

.primary-button {
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  border: none;
  height: 48px;
  padding: 0 32px;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, #227CA0, #15C5B2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(21, 197, 178, 0.2);
  }
}

.secondary-button {
  height: 48px;
  padding: 0 32px;
  font-weight: 500;
  border: 2px solid #15C5B2;
  color: #15C5B2;
  background: transparent;
  transition: all 0.3s;

  &:hover {
    background: rgba(21, 197, 178, 0.1);
    transform: translateY(-2px);
  }
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
.features-section {
  padding: 80px 5%;
  background: #fff;
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
  background: #fff;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: white;
  font-size: 24px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.feature-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

/* How It Works Section */
.how-it-works-section {
  padding: 80px 5%;
  background: #f8f9fa;
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
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.step-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

/* Testimonials Section */
.testimonials-section {
  padding: 80px 5%;
  background: #fff;
}

.testimonials-slider {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  background: #fff;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
}

.testimonial-content {
  margin-bottom: 24px;
}

.testimonial-text {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-info {
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    color: #666;
  }
}

/* CTA Section */
.cta-section {
  padding: 80px 5%;
  background: linear-gradient(135deg, #15C5B2, #227CA0);
  text-align: center;
  color: white;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-description {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.cta-button {
  background: white;
  color: #15C5B2;
  border: none;
  height: 48px;
  padding: 0 32px;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 40px 5%;
  }

  .hero-content {
    margin-bottom: 40px;
  }

  .hero-buttons {
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

  .testimonials-slider {
    grid-template-columns: 1fr;
  }
}
</style> 