<template>
  <div class="gallery py-12">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl text-center bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent mb-6">{{ photoTitle }}</h2>
      
      <!-- 相册分类 -->
      <div class="flex flex-wrap justify-center gap-4 mb-8">
        <button 
          v-for="category in categories" 
          :key="category" 
          :class="['px-6 py-2 rounded-full text-sm font-medium transition-all duration-300', 
                   activeCategory === category ? 'bg-white text-primary shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>
      
      <!-- 照片网格 -->
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="w-16 h-16 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="filteredPhotos.length === 0" class="text-center text-gray-200 py-16">
        <p class="text-lg">暂无照片</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div 
          v-for="photo in filteredPhotos" 
          :key="photo.id" 
          class="relative group overflow-hidden rounded-lg shadow-lg transition-all duration-500 hover:scale-105"
        >
          <!-- 照片 -->
          <img 
            :src="photo.image" 
            :alt="photo.description" 
            class="w-full h-48 object-cover cursor-pointer"
            @click="openImage(photo.image)"
          >
          
          <!-- 照片描述 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black bg-opacity-60 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p class="text-white text-sm">{{ photo.description }}</p>
          </div>
          
          <!-- 放大按钮 -->
          <button 
            class="absolute top-2 right-2 bg-white bg-opacity-80 text-primary rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            @click="openImage(photo.image)"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a7 7 0 100 14 7 7 0 000-14zM9.555 11H3.75a.75.75 0 010-1.5h5.805l-2.16-2.16a.75.75 0 111.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l2.16-2.16z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 加载更多按钮 -->
      <div class="text-center mt-10">
        <button class="bg-white text-primary px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300">
          加载更多照片
        </button>
      </div>
      
      <!-- 图片预览模态框 -->
      <div 
        v-if="previewImage" 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click="closeImage"
      >
        <div class="relative max-w-5xl max-h-[90vh]">
          <img 
            :src="previewImage" 
            alt="图片预览" 
            class="max-w-full max-h-[90vh] object-contain"
          >
          <!-- 关闭按钮 -->
          <button 
            class="absolute top-4 right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
            @click.stop="closeImage"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGalleryPhotosFromWikiCloud, getConfigFromWikiCloud } from '../utils/api'

// 相册数据
const photos = ref([])
const isLoading = ref(true)

// 相册分类
const categories = ref(['全部'])
const activeCategory = ref('全部')

// 图片预览
const previewImage = ref('')

// 相册标题
const photoTitle = ref('💓和你的每一个瞬间都值得留下💓')

// 从维基云表格获取相册数据
onMounted(async () => {
  isLoading.value = true
  try {
    // 获取配置数据
    const config = await getConfigFromWikiCloud()
    photoTitle.value = config.photoTitle || photoTitle.value
    
    // 获取相册数据
    const data = await getGalleryPhotosFromWikiCloud()
    photos.value = data
    
    // 自动生成分类列表，包含所有照片的分类
    const uniqueCategories = [...new Set(data.map(photo => photo.category))]
    categories.value = ['全部', ...uniqueCategories]
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    isLoading.value = false
  }
})

// 筛选照片
const filteredPhotos = computed(() => {
  if (activeCategory.value === '全部') {
    return photos.value
  }
  return photos.value.filter(photo => photo.category === activeCategory.value)
})

// 打开图片预览
const openImage = (imageUrl) => {
  previewImage.value = imageUrl
}

// 关闭图片预览
const closeImage = () => {
  previewImage.value = ''
}
</script>

<style scoped>
/* Gallery组件样式 */
</style>
