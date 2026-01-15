<template>
  <div class="message-board py-12">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl text-center bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent mb-6">{{ blessTitle }}</h2>
      
      <!-- 留言板容器 -->
      <div class="bg-transparent rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <!-- Twikoo评论区 -->
        <div id="twikoo-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getConfigFromWikiCloud } from '../utils/api'

// 用于跟踪Twikoo脚本是否已加载
const twikooLoaded = ref(false)
// 用于跟踪初始化状态
const twikooInitialized = ref(false)
// 留言板标题
const blessTitle = ref('📩感谢五湖四海朋友的祝福')

// Twikoo脚本的备用CDN地址列表
const twikooCdnUrls = [
  'https://cdn.jsdelivr.net/npm/twikoo@1.6.38/dist/twikoo.all.min.js',
  'https://unpkg.com/twikoo@1.6.38/dist/twikoo.all.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/twikoo/1.6.38/twikoo.all.min.js'
]

// 加载Twikoo脚本，带有重试机制
const loadTwikooScript = (urlIndex = 0) => {
  // 如果已经尝试了所有URL，停止重试
  if (urlIndex >= twikooCdnUrls.length) {
    console.error('所有Twikoo脚本CDN地址均加载失败')
    return
  }

  // 检查Twikoo脚本是否已存在
  if (document.getElementById('twikoo-script')) {
    // 脚本已存在，直接初始化
    initTwikoo()
    return
  }

  // 创建Twikoo脚本标签
  const script = document.createElement('script')
  script.id = 'twikoo-script'
  script.src = twikooCdnUrls[urlIndex]
  script.defer = true
  script.timeout = 10000 // 设置10秒超时

  script.onload = () => {
    console.log('Twikoo脚本加载成功')
    twikooLoaded.value = true
    initTwikoo()
  }

  script.onerror = () => {
    console.error(`Twikoo脚本从${twikooCdnUrls[urlIndex]}加载失败，尝试下一个CDN地址`)
    // 移除失败的脚本标签
    document.body.removeChild(script)
    // 尝试下一个CDN地址
    loadTwikooScript(urlIndex + 1)
  }

  // 添加超时处理
  setTimeout(() => {
    if (!twikooLoaded.value && document.getElementById('twikoo-script')) {
      console.error(`Twikoo脚本从${twikooCdnUrls[urlIndex]}加载超时，尝试下一个CDN地址`)
      // 移除超时的脚本标签
      document.body.removeChild(script)
      // 尝试下一个CDN地址
      loadTwikooScript(urlIndex + 1)
    }
  }, script.timeout)

  document.body.appendChild(script)
}

// 初始化Twikoo
const initTwikoo = async () => {
  if (twikooInitialized.value) return // 避免重复初始化
  
  if (window.twikoo) {
    try {
      // 按优先级加载Twikoo云函数URL
      // 1. 优先使用环境变量（适用于EdgeOne Pages/Vercel部署）
      let twikooLink = import.meta.env.VITE_TWIKOO_LINK
      
      // 2. 其次从静态配置文件读取（适用于静态文件部署，可手动修改）
      if (!twikooLink) {
        try {
          const response = await fetch('/config.json')
          if (response.ok) {
            const config = await response.json()
            twikooLink = config.twikooLink
          }
        } catch (error) {
          console.warn('从config.json读取Twikoo配置失败:', error)
        }
      }
      
      // 3. 最后使用硬编码默认值（作为兜底）
      twikooLink = twikooLink || '***'
      
      console.log('使用的Twikoo云函数URL:', twikooLink)
      
      window.twikoo.init({
        envId: twikooLink,
        el: '#twikoo-container',
        region: '',
        path: window.location.pathname,
        lang: 'zh-CN'
      })
      twikooInitialized.value = true
    } catch (error) {
      console.error('Twikoo初始化失败:', error)
    }
  } else if (twikooLoaded.value) {
    console.error('Twikoo脚本已加载，但window.twikoo未定义')
  }
}

onMounted(async () => {
  // 获取配置数据
  try {
    const config = await getConfigFromWikiCloud()
    blessTitle.value = config.blessTitle || blessTitle.value
  } catch (error) {
    console.error('获取配置数据失败:', error)
  }
  
  // 加载Twikoo脚本
  loadTwikooScript()
})
</script>

<style scoped>
/* MessageBoard组件样式 */
/* Twikoo评论区的自定义样式可以在这里添加 */
:deep(.twikoo) {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: transparent !important;
}

/* 针对Twikoo生成的评论区结构，使用flexbox调整顺序 */
:deep(.tk-comments) {
  background-color: transparent !important;
  /* 使用Flexbox调整布局顺序 */
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

/* 确保评论列表（如果存在）显示在最上方 */
:deep(.tk-comments-main) {
  order: 1;
  /* 添加评论列表标题 */
  position: relative;
  margin-bottom: 20px;
}

/* 添加评论列表标题 */
:deep(.tk-comments-main)::before {
  content: "网友祝福";
  display: block;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #ff6b81;
  text-align: center;
}

/* 确保评论提交表单显示在评论列表下方 */
:deep(.tk-submit) {
  order: 2;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 兼容旧版Twikoo结构 */
:deep(.tk-comment-editor) {
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.tk-comments-main),
:deep(.tk-comments-title),
:deep(.tk-comment),
:deep(.tk-comment-main),
:deep(.tk-input),
:deep(.tk-meta-input),
:deep(.el-textarea__inner),
:deep(.el-input__inner) {
  background-color: transparent !important;
}

/* 优化评论样式 */
:deep(.tk-comment) {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 评论悬停效果 */
:deep(.tk-comment:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.tk-input) {
  border-radius: 8px;
  border: 1px solid rgba(110, 110, 110, 0.308) !important;
}

:deep(.tk-submit) {
  background-color: #ff6b8100;
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.tk-submit:hover) {
  background-color: #ff526c00;
  transform: translateY(-2px);
}

/* 设置文字颜色，确保在透明背景下可见 */
:deep(.tk-comments-title),
:deep(.tk-comment-content p),
:deep(.tk-comment-author),
:deep(.tk-comment-time),
:deep(.tk-comment-actions),
:deep(.tk-editor-placeholder),
:deep(.tk-meta-input .el-input-group__prepend),
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: rgb(44, 38, 59) !important;
}
</style>
