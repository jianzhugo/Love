<template>
  <div class="avatar-wrapper" :style="wrapperStyle">
    <!-- 使用绝对定位的占位图，作为加载中或错误时的默认显示 -->
    <img 
      v-if="placeholderSrc" 
      :src="placeholderSrc" 
      :alt="alt" 
      class="avatar-placeholder"
      :style="placeholderStyle"
    >
    <!-- 实际头像，使用opacity控制显示/隐藏 -->
    <img 
      v-if="src" 
      :src="src" 
      :alt="alt" 
      :class="avatarClass"
      :style="avatarStyle"
      @load="handleLoad"
      @error="handleError"
    >
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: '头像'
  },
  avatarClass: {
    type: String,
    default: ''
  },
  placeholderSrc: {
    type: String,
    default: '/images/lazyload.svg'
  },
  wrapperStyle: {
    type: Object,
    default: () => ({})
  },
  avatarStyle: {
    type: Object,
    default: () => ({})
  }
})

// 头像加载状态
const isLoaded = ref(false)

// 计算占位图样式
const placeholderStyle = computed(() => {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,
    opacity: isLoaded.value ? 0 : 1,
    transition: 'opacity 0.3s ease'
  }
})

// 头像加载成功处理
const handleLoad = (e) => {
  isLoaded.value = true
}

// 头像加载失败处理
const handleError = (e) => {
  isLoaded.value = false
  // 确保占位图可见
  e.target.style.display = 'none'
}
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.avatar-placeholder {
  /* 基础样式由计算属性提供 */
}

:deep(.avatar-placeholder img) {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>