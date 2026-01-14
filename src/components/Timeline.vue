<template>
  <div class="timeline py-12">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl text-center bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent mb-6">💞我们风雨同舟一起走✈️</h2>
      
      <!-- 每日一句 -->
      <div class="mt-4 p-4 rounded-lg mb-8 text-center">
        <p class="text-gray-700 italic inline-block">{{ dailyQuote }}</p>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="w-16 h-16 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="timelineEvents.length === 0" class="text-center text-gray-200 py-16">
        <p class="text-lg">暂无时间线事件</p>
      </div>
      
      <!-- 时间线内容 -->
      <div v-else class="relative">
        <!-- 时间线轴线 -->
        <div class="absolute left-1/2 transform -translate-x-1/2 w-1 bg-red-300 h-full"></div>
        
        <!-- 时间线事件 -->
        <div class="space-y-12">
          <div v-for="(event, index) in timelineEvents" :key="event.id" class="relative">
            <!-- 事件卡片 -->
            <div 
              :class="[
                'rounded-xl shadow-lg p-6 transition-all duration-500 hover:shadow-xl cursor-pointer mx-auto w-full md:w-2/3',
                expandedEvents.has(event.id) 
                  ? 'bg-gradient-to-br from-primary to-accent text-white' 
                  : 'bg-white text-gray-600'
              ]"
              @click="toggleEvent(event.id)"
            >
              <!-- 事件标题 -->
              <h3 class="text-xl font-bold mb-2 text-center">{{ event.title }}</h3>
              <!-- 事件日期 -->
              <div class="text-sm mb-4 text-center" :class="expandedEvents.has(event.id) ? 'text-white/80' : 'text-gray-600'">
                {{ event.date }}
              </div>
              
              <!-- 展开的内容 -->
              <div v-if="expandedEvents.has(event.id)" class="overflow-hidden transition-all duration-500">
                <!-- 事件描述 -->
                <p class="mb-4 text-center text-white/90">{{ event.description }}</p>
                <!-- 事件图片 -->
                <div v-if="event.image" class="rounded-lg overflow-hidden">
                  <img :src="event.image" :alt="event.title" class="w-full h-48 object-cover">
                </div>
              </div>
            </div>
            
            <!-- 时间线节点 -->
            <div class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full border-4 border-white shadow-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTimelineFromWikiCloud, getConfigFromWikiCloud } from '../utils/api'

// 时间线数据
const timelineEvents = ref([])
const isLoading = ref(true)
// 展开的事件ID集合
const expandedEvents = ref(new Set())
// 每日一句
const dailyQuote = ref('爱你每一天')

// 从维基云表格获取数据
onMounted(async () => {
  isLoading.value = true
  try {
    // 获取时间线数据
    const timelineData = await getTimelineFromWikiCloud()
    timelineEvents.value = timelineData
    
    // 获取配置数据
    const config = await getConfigFromWikiCloud()
    
    // 更新每日一句
    if (config.dailyQuote) {
      // 用英文逗号分隔成数组
      const quotes = config.dailyQuote.split(',').map(quote => quote.trim()).filter(Boolean)
      if (quotes.length > 0) {
        // 随机选择一句
        const randomIndex = Math.floor(Math.random() * quotes.length)
        dailyQuote.value = quotes[randomIndex]
      }
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    isLoading.value = false
  }
})

// 切换事件展开/折叠状态
const toggleEvent = (eventId) => {
  if (expandedEvents.value.has(eventId)) {
    expandedEvents.value.delete(eventId)
  } else {
    expandedEvents.value.add(eventId)
  }
}
</script>

<style scoped>
/* Timeline组件样式 */
</style>
