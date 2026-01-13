<template>
  <!-- 特效容器 - 现在只用于控制特效的启用/禁用，实际特效由JS动态创建 -->
  <div class="effect-container" v-if="effectEnabled" ref="effectContainer"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 定义props
const props = defineProps({
  selectEffect: {
    type: [Boolean, Number, String],
    default: false
  },
  bottomJs: {
    type: [Boolean, String],
    default: false
  },
  mouseClick: {
    type: [Boolean, Number, String],
    default: false
  }
})

// 特效容器引用
const effectContainer = ref(null)

// 当前激活的特效实例
let currentEffect = null

// 计算实际使用的效果序号
const actualEffect = computed(() => {
  // 首先处理布尔值情况
  if (props.selectEffect === false || props.selectEffect === 'false') {
    return false
  }
  
  // 将值转换为数字
  let effectNumber
  if (typeof props.selectEffect === 'string') {
    effectNumber = parseInt(props.selectEffect)
  } else {
    effectNumber = props.selectEffect
  }
  
  // 检查转换后的数字是否有效
  if (typeof effectNumber === 'number' && !isNaN(effectNumber)) {
    // 去掉1-4的数字限制，返回该数字
    return effectNumber
  }
  
  // 其他情况，使用默认效果：樱花飞舞（序号2）
  return 2
})

// 计算效果是否启用
const effectEnabled = computed(() => {
  return actualEffect.value !== false
})

// 计算bottomJs是否启用
const bottomJsEnabled = computed(() => {
  if (props.bottomJs === true || props.bottomJs === 'true') {
    return true
  }
  return false
})

// 当前鲸鱼特效实例
let currentWhaleEffect = null

// 当前鼠标点击特效实例
let currentMouseClickEffect = null

// 计算mouseClick是否启用以及使用哪个特效
const mouseClickEffect = computed(() => {
  // 如果值为false或'false'，则不启用
  if (props.mouseClick === false || props.mouseClick === 'false') {
    return false
  }
  
  // 将值转换为数字
  let effectNumber
  if (typeof props.mouseClick === 'string') {
    effectNumber = parseInt(props.mouseClick)
  } else {
    effectNumber = props.mouseClick
  }
  
  // 检查转换后的数字是否有效（1-4之间）
  if (typeof effectNumber === 'number' && !isNaN(effectNumber) && effectNumber >= 1 && effectNumber <= 4) {
    return effectNumber
  }
  
  // 其他情况，不启用
  return false
})

// 调试：监听selectEffect变化
watch(() => props.selectEffect, (newVal, oldVal) => {
  console.log('EffectAnimation selectEffect变化:', oldVal, '->', newVal)
  console.log('EffectAnimation selectEffect类型:', typeof newVal)
}, { deep: true, immediate: true })

// 调试：监听actualEffect变化
watch(actualEffect, (newVal, oldVal) => {
  console.log('EffectAnimation actualEffect变化:', oldVal, '->', newVal)
}, { deep: true, immediate: true })

// 调试：监听effectEnabled变化
watch(effectEnabled, (newVal, oldVal) => {
  console.log('EffectAnimation effectEnabled变化:', oldVal, '->', newVal)
}, { deep: true, immediate: true })

// 调试：监听bottomJs变化
watch(() => props.bottomJs, (newVal, oldVal) => {
  console.log('EffectAnimation bottomJs变化:', oldVal, '->', newVal)
  console.log('EffectAnimation bottomJs类型:', typeof newVal)
}, { deep: true, immediate: true })

// 调试：监听bottomJsEnabled变化
watch(bottomJsEnabled, (newVal, oldVal) => {
  console.log('EffectAnimation bottomJsEnabled变化:', oldVal, '->', newVal)
}, { deep: true, immediate: true })

// 调试：监听mouseClick变化
watch(() => props.mouseClick, (newVal, oldVal) => {
  console.log('EffectAnimation mouseClick变化:', oldVal, '->', newVal)
  console.log('EffectAnimation mouseClick类型:', typeof newVal)
}, { deep: true, immediate: true })

// 调试：监听mouseClickEffect变化
watch(mouseClickEffect, (newVal, oldVal) => {
  console.log('EffectAnimation mouseClickEffect变化:', oldVal, '->', newVal)
}, { deep: true, immediate: true })


// 特效适配器 - 统一不同特效的启动和停止接口
const effectAdapters = {
  // 下雪效果适配器
  1: {
    start: () => {
      // 调用全局start函数启动下雪特效
      if (window.start) {
        window.start()
      }
      return {
        stop: () => {
          // 调用全局stop函数停止下雪特效
          if (window.stop) {
            window.stop()
          }
        }
      }
    }
  },
  // 樱花效果适配器
  2: {
    start: () => {
      // 樱花效果会自动启动，不需要额外调用
      return {
        stop: () => {
          // 樱花效果提供了stopp函数
          if (window.stopp) {
            window.stopp()
          }
        }
      }
    }
  },
  // 灯笼效果适配器
  3: {
    start: () => {
      // 灯笼效果会自动启动，不需要额外调用
      return {
        stop: () => {
          // 移除灯笼元素
          const lanterns = document.querySelectorAll('.j-china-lantern')
          lanterns.forEach(lantern => lantern.remove())
        }
      }
    }
  },
  // 其他特效的适配器可以后续添加
}

// 启动特效 - 使用script标签加载方式替代动态导入，处理with语句问题
const startEffect = (effectId) => {
  console.log('startEffect调用，effectId:', effectId)
  
  // 停止当前特效
  if (currentEffect) {
    console.log('停止当前特效')
    currentEffect.stop()
    currentEffect = null
  }
  
  // 移除所有之前添加的特效script标签
  const existingScripts = document.querySelectorAll('[data-effect-script]')
  console.log('移除之前的特效script标签，数量:', existingScripts.length)
  existingScripts.forEach(script => {
    console.log('移除script标签:', script.src)
    script.remove()
  })
  
  // 特效文件路径映射
  const effectPaths = {
    1: '/effects/xiaxue.js',    // 下雪效果
    2: '/effects/yinghua.js',   // 樱花效果
    3: '/effects/denglong.js',  // 灯笼效果
  }
  
  const effectPath = effectPaths[effectId]
  console.log('特效文件路径映射:', effectPaths)
  console.log('当前effectId对应的路径:', effectId, '->', effectPath)
  
  if (effectPath) {
    try {
      // 创建script标签
      const script = document.createElement('script')
      script.setAttribute('data-effect-script', 'true')
      script.src = effectPath
      console.log('创建script标签，src:', effectPath)
      
      script.onload = () => {
        console.log(`特效 ${effectId} 已加载，script路径:`, effectPath)
        // 使用对应的适配器启动特效
        const adapter = effectAdapters[effectId]
        console.log('特效适配器:', adapter)
        if (adapter) {
          console.log('调用适配器start方法')
          currentEffect = adapter.start()
          console.log('当前特效实例:', currentEffect)
        }
      }
      
      script.onerror = (error) => {
        console.error(`加载特效 ${effectId} 失败:`, error)
        console.error(`script路径:`, effectPath)
        // 加载失败时，使用默认的樱花效果
        if (effectId !== 2) {
          console.log('使用默认的樱花效果')
          startEffect(2)
        }
      }
      
      // 添加到document.head
      console.log('添加script标签到document.head')
      document.head.appendChild(script)
    } catch (error) {
      console.error(`启动特效 ${effectId} 失败:`, error)
      // 启动失败时，使用默认的樱花效果
      if (effectId !== 2) {
        console.log('使用默认的樱花效果')
        startEffect(2)
      }
    }
  } else {
    // 没有对应特效时，使用默认的樱花效果
    console.log(`未找到特效 ${effectId}，使用默认的樱花效果`)
    startEffect(2)
  }
}

// 启动鲸鱼特效
const startWhaleEffect = () => {
  console.log('启动鲸鱼特效')
  
  // 停止当前鲸鱼特效
  if (currentWhaleEffect) {
    stopWhaleEffect()
  }
  
  // 创建script标签
  const script = document.createElement('script')
  script.setAttribute('data-whale-script', 'true')
  script.src = '/effects/jingyu.js'
  
  script.onload = () => {
    console.log('鲸鱼特效已加载')
    // 调用全局start函数启动鲸鱼特效
    if (window.startJingyu) {
      window.startJingyu()
      currentWhaleEffect = {
        stop: () => {
          if (window.stopJingyu) {
            window.stopJingyu()
          }
        }
      }
    }
  }
  
  script.onerror = (error) => {
    console.error('加载鲸鱼特效失败:', error)
  }
  
  document.head.appendChild(script)
}

// 停止鲸鱼特效
const stopWhaleEffect = () => {
  console.log('停止鲸鱼特效')
  
  if (currentWhaleEffect) {
    currentWhaleEffect.stop()
    currentWhaleEffect = null
  }
  
  // 移除鲸鱼特效script标签
  const whaleScripts = document.querySelectorAll('[data-whale-script]')
  whaleScripts.forEach(script => {
    script.remove()
  })
}

// 启动鼠标点击特效
const startMouseClickEffect = (effectId) => {
  console.log('启动鼠标点击特效，effectId:', effectId)
  
  // 停止当前鼠标点击特效
  stopMouseClickEffect()
  
  // 特效文件路径映射
  const effectPaths = {
    1: '/effects/mousefire.js',   // 火焰效果
    2: '/effects/mouselove.js',   // 爱心效果
    3: '/effects/mousestar.js',   // 星星效果
    4: '/effects/mouseword.js'    // 文字效果
  }
  
  const effectPath = effectPaths[effectId]
  if (effectPath) {
    try {
      // 创建script标签
      const script = document.createElement('script')
      script.setAttribute('data-mouse-click-script', 'true')
      script.src = effectPath
      
      script.onload = () => {
        console.log(`鼠标点击特效 ${effectId} 已加载，script路径:`, effectPath)
        // 鼠标点击特效会自动启动，不需要额外调用
        currentMouseClickEffect = {
          stop: () => {
            // 移除特效产生的元素和事件监听
            // 移除所有特效相关的元素
            const elements = document.querySelectorAll(
              '.heart, .js-cursor-container, [style*="position: fixed"][style*="pointer-events: none"]'
            )
            elements.forEach(el => el.remove())
            
            // 移除全局事件监听
            window.onclick = null
            document.onclick = null
            
            // 移除鼠标移动事件监听
            document.removeEventListener('mousemove', null)
            window.removeEventListener('mousemove', null)
          }
        }
      }
      
      script.onerror = (error) => {
        console.error(`加载鼠标点击特效 ${effectId} 失败:`, error)
      }
      
      // 添加到document.head
      document.head.appendChild(script)
    } catch (error) {
      console.error(`启动鼠标点击特效 ${effectId} 失败:`, error)
    }
  }
}

// 停止鼠标点击特效
const stopMouseClickEffect = () => {
  console.log('停止鼠标点击特效')
  
  if (currentMouseClickEffect) {
    currentMouseClickEffect.stop()
    currentMouseClickEffect = null
  }
  
  // 移除鼠标点击特效script标签
  const mouseClickScripts = document.querySelectorAll('[data-mouse-click-script]')
  mouseClickScripts.forEach(script => {
    script.remove()
  })
}

// 停止所有特效
const stopAllEffects = () => {
  if (currentEffect) {
    currentEffect.stop()
    currentEffect = null
  }
  
  // 停止鲸鱼特效
  stopWhaleEffect()
  
  // 停止鼠标点击特效
  stopMouseClickEffect()
}

// 监听effectEnabled变化
watch(effectEnabled, (newEnabled) => {
  if (newEnabled) {
    startEffect(actualEffect.value)
  } else {
    stopAllEffects()
  }
})

// 监听actualEffect变化
watch(actualEffect, (newEffectId, oldEffectId) => {
  if (effectEnabled.value && newEffectId !== oldEffectId) {
    startEffect(newEffectId)
  }
})

// 监听bottomJsEnabled变化
watch(bottomJsEnabled, (newEnabled) => {
  if (newEnabled) {
    startWhaleEffect()
  } else {
    stopWhaleEffect()
  }
})

// 监听mouseClickEffect变化
watch(mouseClickEffect, (newEffectId, oldEffectId) => {
  if (newEffectId) {
    startMouseClickEffect(newEffectId)
  } else {
    stopMouseClickEffect()
  }
})

// 组件挂载时启动特效
onMounted(() => {
  if (effectEnabled.value) {
    startEffect(actualEffect.value)
  }
  
  // 启动鲸鱼特效（如果启用）
  if (bottomJsEnabled.value) {
    startWhaleEffect()
  }
  
  // 启动鼠标点击特效（如果启用）
  if (mouseClickEffect.value) {
    startMouseClickEffect(mouseClickEffect.value)
  }
})

// 组件卸载时停止所有特效
onUnmounted(() => {
  stopAllEffects()
})
</script>

<style scoped>
/* 效果容器 */
.effect-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}
</style>