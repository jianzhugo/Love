<template>
  <footer class="py-6 mt-12">
    <div class="container mx-auto px-4">
      <div class="text-center">
        <!-- 版权信息 -->
        <div class="mb-4">
          <p class="text-1xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">&copy; 水常和萍之六的爱情小站💝</p>          
          <p class="text-1xl bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">已稳定运行 {{ days }} 天 {{ hours }} 小时 {{ minutes }} 分钟 {{ seconds }} 秒</p>
          <p class="text-1xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent"> ❤️月亮被嚼碎变成了星星，你就藏在这满天的星光里✨💘 </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 起始时间（可调整）
const startTime = new Date('2026-01-01T00:00:00')

// 运行时间
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

// 定时器
let timer = null

// 计算运行时间
const calculateRunningTime = () => {
  const now = new Date()
  const diff = now - startTime
  
  // 计算天、小时、分钟、秒
  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
}

// 组件挂载时开始计时
onMounted(() => {
  // 初始化计算
  calculateRunningTime()
  
  // 每秒更新一次
  timer = setInterval(calculateRunningTime, 1000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
/* Footer组件样式 */
</style>
