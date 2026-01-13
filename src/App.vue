<template>
  <div class="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50" @contextmenu="handleContextMenu" @click="closeContextMenu">
    <Header :title="config.title" :subtitle="config.subtitle" :favicon="config.favicon" :slogan="config.slogan" />
    <!-- 全局效果动画 -->
    <EffectAnimation 
      :selectEffect="config.selectEffect || false" 
      :bottomJs="config.bottomJs || false" 
      :mouseClick="config.mouseClick || false" 
    />
    <main>
      <!-- 占位div，避免内容被header遮挡 -->
      <div class="h-[55vh]"></div>
      <router-view />
    </main>
    
    <!-- 悬浮按钮 -->
    <div class="fixed right-1 top-2/3 transform -translate-y-1/2 flex flex-col space-y-2 z-50">
      <!-- 主页按钮 -->
      <router-link to="/" class="bg-red-500 bg-opacity-90 backdrop-blur-sm rounded-lg p-1 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center" title="返回主页">
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"></path>
        </svg>
      </router-link>
      
      <!-- 关于按钮 -->
      <router-link to="/about" class="bg-blue-500 bg-opacity-90 backdrop-blur-sm rounded-lg p-1 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center" title="关于我们">
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.4 3.4 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.4 3.4 0 0 0 15 11a3.5 3.5 0 0 0 0-7"></path>
        </svg>
      </router-link>
      
      <!-- 时间线按钮 -->
      <router-link to="/timeline" class="bg-orange-500 bg-opacity-90 backdrop-blur-sm rounded-lg p-1 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center" title="时间线">
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m8 3a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 2a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3"></path>
        </svg>
      </router-link>
    </div>
    
    <Footer />
    
    <!-- 鲸鱼特效容器 -->
    <div id="whale-effect-container" class="-mt-8"></div>
    
    <!-- 自定义右键菜单 -->
    <div 
      v-if="showContextMenu" 
      ref="contextMenu" 
      class="context-menu fixed bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 z-50 min-w-[100px]"
      :style="{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }"
      @click.stop
    >
      <div class="context-menu-item p-2 cursor-pointer hover:bg-pink-100 transition-colors duration-200 flex items-center" @click="handleMenuItemClick('back-to-top')">
        <svg class="w-4 h-4 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2M12 7l-5 5h3v4h4v-4h3z"></path>
        </svg>
        回到顶部
      </div>
      <div class="context-menu-item p-2 cursor-pointer hover:bg-pink-100 transition-colors duration-200 flex items-center" @click="handleMenuItemClick('prev-page')">
        <svg class="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2M7 12l5 5v-3h4v-4h-4V7z"></path>
        </svg>
        上一页
      </div>
      <div class="context-menu-item p-2 cursor-pointer hover:bg-pink-100 transition-colors duration-200 flex items-center" @click="handleMenuItemClick('next-page')">
        <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 19V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2m14-7l-5-5v3H8v4h4v3z"></path>
        </svg>
        下一页
      </div>
      <div class="context-menu-divider h-px bg-gray-200"></div>
      <div class="context-menu-item p-2 cursor-pointer hover:bg-pink-100 transition-colors duration-200 flex items-center" @click="handleMenuItemClick('write-message')">
        <svg class="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"></path>
        </svg>
        写下祝福
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import EffectAnimation from './components/EffectAnimation.vue'
import { getConfigFromWikiCloud } from './utils/api'

// 路由实例
const router = useRouter()

// 配置数据
const config = ref({})

// 右键菜单相关
const showContextMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const contextMenu = ref(null)

// 处理右键菜单显示
const handleContextMenu = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  // 计算菜单位置，确保不会超出视口
  const x = Math.min(event.clientX, window.innerWidth - 180)
  const y = Math.min(event.clientY, window.innerHeight - 150)
  
  menuPosition.value = { x, y }
  showContextMenu.value = true
}

// 关闭右键菜单
const closeContextMenu = () => {
  showContextMenu.value = false
}

// 菜单项点击事件
const handleMenuItemClick = (action) => {
  closeContextMenu()
  
  switch (action) {
    case 'back-to-top':
      window.scrollTo({ top: 0, behavior: 'smooth' })
      break
    case 'prev-page':
      window.history.back()
      break
    case 'next-page':
      window.history.forward()
      break
    case 'write-message':
      router.push('/message')
      break
    default:
      break
  }
}

onMounted(async () => {
  // 从维基云表格获取配置
  const fetchedConfig = await getConfigFromWikiCloud()
  config.value = fetchedConfig
  
  // 调试：打印配置信息，特别是selectEffect的值
  console.log('获取到的配置:', config.value)
  console.log('selectEffect的值:', config.value.selectEffect)
  console.log('selectEffect的类型:', typeof config.value.selectEffect)
  
  // 动态设置网站标题
  const siteTitle = config.value.title || '我们的爱情故事'
  const siteSubtitle = config.value.subtitle || '爱情小屋'
  document.title = `${siteTitle} - ${siteSubtitle}`
  
  // 动态设置favicon
  if (config.value.favicon) {
    const favicon = document.querySelector('link[rel="icon"]')
    if (favicon) {
      favicon.href = config.value.favicon
    }
  }
})
</script>