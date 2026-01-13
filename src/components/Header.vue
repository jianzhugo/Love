<template>
  <header 
    class="bg-white bg-opacity-50 backdrop-blur-sm shadow-none absolute top-0 left-0 right-0 z-50 h-[55vh] bg-cover bg-center"
    :style="headerStyle"
  >
    <div class="container mx-auto px-4 h-full">
      <div class="flex justify-between items-center mb-12">
        <!-- 网站标题和副标题 -->
        <div class="flex items-center space-x-2">
          <h1 class="text-3xl font-bold text-primary font-round">{{ title || '我们的爱情故事' }}</h1>
          <p v-if="subtitle" class="text-lg text-gray-500">{{ subtitle }}</p>
        </div>

        <!-- 网站标语 -->
        <div v-if="slogan" class="hidden md:block text-lg text-gray-600 italic">
          {{ slogan }}
        </div>
      </div>
      
      <!-- 情侣头像 -->
      <div class="flex justify-center space-x-20 mt-32">
        <div class="text-center">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg mx-auto">
            <Avatar 
              :src="boyAvatar" 
              :alt="boyName" 
              avatarClass="w-full h-full object-cover"
              placeholderSrc="/images/lazyload.svg"
            />
          </div>
          <div class="mt-3 text-2xl text-white font-bold">{{ boyName }}</div>
        </div>
        <div class="flex items-center justify-center">
          <div class="heart animate-beat"></div>
        </div>
        <div class="text-center">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg mx-auto">
            <Avatar 
              :src="girlAvatar" 
              :alt="girlName" 
              avatarClass="w-full h-full object-cover"
              placeholderSrc="/images/lazyload.svg"
            />
          </div>
          <div class="mt-3 text-2xl text-white font-bold">{{ girlName }}</div>
        </div>
      </div>
    </div>
    
    <!-- 多层波浪效果 -->
    <div class="absolute bottom-0 left-0 right-0 overflow-hidden">
      <svg 
        class="w-full h-16 md:h-24 block" 
        fill="none" 
        viewBox="0 24 150 28" 
        preserveAspectRatio="none" 
        shape-rendering="auto"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <!-- 渐变定义 -->
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :style="waveGradientStart" />
            <stop offset="100%" :style="waveGradientEnd" />
          </linearGradient>
          <!-- 波浪路径定义 - 更长的路径以确保无缝循环 -->
          <path id="gentle-wave" d="M -160 44 c 30 0 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 v 44 h -704 Z"></path>
        </defs>
        
        <!-- 波浪层 -->
        <g class="parallax">
          <use class="animate-wave-1" xlink:href="#gentle-wave" x="48" y="0" fill="url(#waveGradient)"></use>
          <use class="animate-wave-2" xlink:href="#gentle-wave" x="48" y="3" fill="url(#waveGradient)"></use>
          <use class="animate-wave-3" xlink:href="#gentle-wave" x="48" y="5" fill="url(#waveGradient)"></use>
          <use class="animate-wave-4" xlink:href="#gentle-wave" x="48" y="7" fill="rgb(248, 243, 250, 1)"></use>
        </g>
      </svg>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getConfigFromWikiCloud } from '../utils/api'
import Avatar from './Avatar.vue'

// 定义props
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  slogan: {
    type: String,
    default: ''
  }
})

// 配置数据
const config = ref({})

// 男生信息
const boyName = ref('水常')
const boyAvatar = ref('https://s2.loli.net/2024/12/25/CqQwNS6p2WDAk18.jpg')

// 女生信息
const girlName = ref('萍之六')
const girlAvatar = ref('https://s2.loli.net/2024/12/25/Qzfr45S9uJYKkp8.jpg')

// 计算header背景样式
const headerStyle = computed(() => {
  if (config.value.headerBg === false) {
    // 不显示背景图片
    return { backgroundColor: 'transparent' }
  } else if (config.value.headerBg) {
    // 使用配置的图片链接
    return { backgroundImage: `url('${config.value.headerBg}')` }
  } else {
    // 使用默认图片
    return { backgroundImage: "url('/images/headerBg.jpg')" }
  }
})

// 波浪渐变起始颜色（调整透明度，使波浪更明显）
const waveGradientStart = computed(() => {
  return { stopColor: 'rgba(255, 245, 247, 0.5)', stopOpacity: '0.5' }
})

// 波浪渐变结束颜色（与网页背景渐变的起始颜色一致，增强不透明度）
const waveGradientEnd = computed(() => {
  return { stopColor: 'rgba(255, 245, 247, 1)', stopOpacity: '1' }
})

// 从维基云表格获取配置数据
onMounted(async () => {
  try {
    const fetchedConfig = await getConfigFromWikiCloud()
    config.value = fetchedConfig
    
    // 可以从配置中获取头像和姓名信息，如果有的话
    if (config.value.boyName) boyName.value = config.value.boyName
    if (config.value.boyAvatar) boyAvatar.value = config.value.boyAvatar
    if (config.value.girlName) girlName.value = config.value.girlName
    if (config.value.girlAvatar) girlAvatar.value = config.value.girlAvatar
  } catch (error) {
    console.error('获取配置数据失败:', error)
  }
})
</script>

<style scoped>
/* 水平移动波浪动画 - 调整距离以匹配路径长度，实现无缝循环 */
@keyframes waveMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-352px);
  }
}

/* 波浪层视差效果 */
.parallax {
  perspective: 1000px;
}

/* 不同速度的波浪动画 */
.animate-wave-1 {
  animation: waveMove 9s linear infinite;
  opacity: 1;
}

.animate-wave-2 {
  animation: waveMove 12s linear infinite;
  opacity: 1;
}

.animate-wave-3 {
  animation: waveMove 13s linear infinite;
  opacity: 1;
}

.animate-wave-4 {
  animation: waveMove 15s linear infinite;
  opacity: 1;
}

/* 爱心样式 */
.heart {
  width: 30px;
  height: 30px;
  background-color: #ff3860;
  position: relative;
  transform: rotate(-45deg);
  box-shadow: 0 0 10px rgba(255, 56, 96, 0.5);
}

.heart::before,
.heart::after {
  content: '';
  width: 30px;
  height: 30px;
  background-color: #ff3860;
  border-radius: 50%;
  position: absolute;
  box-shadow: 0 0 10px rgba(255, 56, 96, 0.5);
}

.heart::before {
  top: -15px;
  left: 0;
}

.heart::after {
  left: 15px;
  top: 0;
}

/* 心跳动画 */
@keyframes beat {
  0%, 100% {
    transform: rotate(-45deg) scale(1);
    box-shadow: 0 0 20px rgba(255, 56, 96, 0.5);
  }
  14% {
    transform: rotate(-45deg) scale(1.3);
    box-shadow: 0 0 30px rgba(255, 56, 96, 0.8);
  }
  28% {
    transform: rotate(-45deg) scale(1);
    box-shadow: 0 0 20px rgba(255, 56, 96, 0.5);
  }
  42% {
    transform: rotate(-45deg) scale(1.3);
    box-shadow: 0 0 30px rgba(255, 56, 96, 0.8);
  }
  70% {
    transform: rotate(-45deg) scale(1);
    box-shadow: 0 0 20px rgba(255, 56, 96, 0.5);
  }
}

.animate-beat {
  animation: beat 1.5s ease-in-out infinite;
}
</style>
