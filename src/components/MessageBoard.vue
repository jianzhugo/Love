<template>
  <div class="message-board py-12">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl text-center bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent mb-6">{{ blessTitle }}</h2>
      
      <!-- 留言板容器 -->
      <div class="bg-white-0.9 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <!-- 留言列表标题 -->
        <div class="mb-6 text-center">
          <h3 class="text-xl font-bold text-ff6b81">累计已经收到 <span class="text-3xl"> {{ messages.length }} </span> 条祝福</h3>
        </div>
        
        <!-- 留言列表 -->
        <div class="messages-list space-y-1.5">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="message-item flex gap-4 p-4 transition-all duration-300"
          >
            <!-- 左边：头像 -->
            <div class="avatar-wrapper flex-shrink-0">
              <img 
                :src="message.avatar" 
                :alt="message.nickname" 
                class="w-16 h-16 rounded-full object-cover avatar-breathe"
                @load="handleAvatarLoad($event)"
                @error="handleAvatarError($event)"
                v-bind:data-loading="'images/lazyload.svg'"
                style="transition: transform 0.5s ease-in-out;"
                @mouseenter="$event.target.style.transform = 'rotate(360deg)'"
                @mouseleave="$event.target.style.transform = 'rotate(0deg)'"
              >
            </div>
            
            <!-- 右边：信息显示区 -->
            <div class="info-wrapper flex-1 p-4 rounded-xl border border-[#f9802d]">
              <!-- 昵称 -->
              <div class="nickname-section mb-1">
                <a 
                  v-if="message.blog" 
                  :href="message.blog" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="nickname text-blue-500 hover:text-blue-700 font-semibold text-base sm:text-lg"
                >
                  {{ message.nickname }}
                </a>
                <span 
                  v-else 
                  class="nickname text-green-500 font-semibold text-base sm:text-lg"
                >
                  {{ message.nickname }}
                </span>
              </div>
              
              <!-- 地区和时间 -->
              <div class="meta-section flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                <span>{{ getIpLocation(message.ip) }}</span>
                <span>•</span>
                <span>{{ formatTime(message.createTime) }}</span>
              </div>
              
              <!-- 留言内容 -->
              <div class="content-section text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {{ message.content }}
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="messages.length === 0" class="text-center py-12 text-gray-500">
            <p>暂未收到祝福，快来成为第一个祝福人吧！</p>
          </div>
          
          <!-- 加载中状态 -->
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ff6b81"></div>
            <p class="mt-2 text-gray-500">加载中...</p>
          </div>
        </div>
        
        <!-- 虚线分隔 -->
        <div class="border-t border-dashed border-gray-300 my-6"></div>
        
        <!-- 留言表单 -->
        <div class="message-form p-6">

          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- 昵称、邮箱、博客地址在同一行 -->
            <div class="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                id="nickname" 
                v-model="form.nickname" 
                required 
                maxlength="20"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ff6b81 focus:border-transparent transition-all"
                placeholder="昵称（必填）"
              >
              
              <input 
                type="email" 
                id="email" 
                v-model="form.email" 
                required
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ff6b81 focus:border-transparent transition-all"
                placeholder="邮箱（必填）"
              >
              
              <input 
                type="url" 
                id="blog" 
                v-model="form.blog" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ff6b81 focus:border-transparent transition-all"
                placeholder="博客（选填）"
              >
            </div>
            
            <!-- 留言内容 -->
            <div class="form-group">
              <textarea 
                id="content" 
                v-model="form.content" 
                required 
                maxlength="500"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ff6b81 focus:border-transparent transition-all resize-none"
                placeholder="发送祝福后需连续刷新2次才会显示..."
              ></textarea>
            </div>
            
            <!-- 表情选择和提交按钮 -->
            <div class="flex justify-between items-center relative">
              <!-- 表情选择按钮 -->
              <button 
                type="button" 
                @click="toggleEmojiPicker"
                class="w-auto px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center"
              >
                <span class="mr-2">😊</span>
                表情
              </button>
              
              <!-- 表情选择面板 -->
              <div v-if="showEmojiPicker" class="absolute z-50 top-full left-0 mt-2 bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-72">
                <div class="grid grid-cols-8 gap-2">
                  <button 
                    v-for="emoji in emojis" 
                    :key="emoji"
                    type="button" 
                    @click="insertEmoji(emoji)"
                    class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
              
              <!-- 提交按钮 -->
              <button 
                type="submit" 
                :disabled="submitting" 
                class="w-auto px-6 py-3 bg-ff6b81 text-white font-medium rounded-lg hover:bg-ff526c transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span v-if="submitting" class="inline-block animate-spin mr-2 w-4 h-4"></span>
                <span v-else class="mr-2">🚀</span>
                {{ submitting ? '祝福发送中...' : '发送祝福' }}
              </button>
            </div>
            
            <!-- 自定义提示框 -->
            <div 
              v-if="showToast" 
              :class="['toast', toastType === 'success' ? 'toast-success' : 'toast-error']"
              :style="toastStyle"
            >
              {{ toastMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { getConfigFromWikiCloud, getMessagesFromWikiCloud, submitMessageToWikiCloud } from '../utils/api'

// 留言板标题
const blessTitle = ref('📩感谢五湖四海朋友的祝福')

// 留言列表数据
const messages = ref([])
const loading = ref(false)
const submitting = ref(false)

// 留言表单
const form = ref({
  nickname: '',
  email: '',
  content: '',
  blog: ''
})

// 表情相关状态
const showEmojiPicker = ref(false)
const emojis = ref(['😊', '😂', '😍', '❤️', '👍', '🎉', '🤔', '😢', '😘', '🥰', '😋', '😎', '🤗', '🤣', '🙏', '🌟', '🔥', '💯', '🎁', '💝', '💕', '💖', '💗', '💓', '💞', '💘', '💌', '💙', '💚', '💛', '💜', '💄', '💋', '💍', '💎', '🎀', '🎂', '🎈', '🎊', '🎎', '🎏', '🎐', '🎑', '🎃', '🎄', '🎋'])

// Toast提示状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success') // success 或 error
const toastStyle = computed(() => ({
  animation: showToast.value ? 'toastSlideIn 0.3s ease-out forwards, toastSlideOut 0.3s ease-in 2.7s forwards' : ''
}))

// 切换表情选择面板
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// 插入表情到文本框
const insertEmoji = (emoji) => {
  form.value.content += emoji
  showEmojiPicker.value = false
}

// 获取IP地址
const getUserIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    if (response.ok) {
      const data = await response.json()
      return data.ip
    }
  } catch (error) {
    console.error('获取IP地址失败:', error)
  }
  return '未知IP'
}

// 生成头像URL
const generateAvatar = async (email) => {
  const errorAvatar = '/favicon.ico'; // 加载失败时使用的头像
  
  // 检查是否为QQ邮箱
  const qqRegex = /^(\d+)@qq\.com$/;
  const qqMatch = email.match(qqRegex);
  if (qqMatch) {
    const qqAvatar = `http://q.qlogo.cn/headimg_dl?dst_uin=${qqMatch[1]}&spec=640&img_type=jpg`;
    if (await checkImageExists(qqAvatar)) {
      return qqAvatar;
    }
  }
  
  // 使用Cravatar.cn头像服务
  const md5Email = md5(email.toLowerCase().trim());
  const cravatarAvatar = `https://cravatar.cn/avatar/${md5Email}?d=404`;
  if (await checkImageExists(cravatarAvatar)) {
    return cravatarAvatar;
  }
  
  // 无法获取头像时使用错误头像
  return errorAvatar;
}

// 检查图片是否存在
const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}



// 使用简化的MD5算法，避免复杂的内部函数
const md5 = (str) => {
  // 简单的哈希实现，用于生成头像URL
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(32, '0');
  return hex;
}

// 格式化时间为年-月-日
const formatTime = (timeString) => {
  const date = new Date(timeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取IP所在地（模拟实现，实际项目中可使用IP查询API）
const getIpLocation = (ip) => {
  // 处理未知IP情况
  if (!ip || ip === '未知IP' || ip === 'unknown' || ip === '') {
    return '未知城市';
  }
  
  // 本地IP地址范围
  const localIpRanges = [
    /^192\.168\.\d+\.\d+$/,   // 192.168.x.x
    /^10\.\d+\.\d+\.\d+$/,      // 10.x.x.x
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/, // 172.16.x.x - 172.31.x.x
    /^127\.0\.0\.\d+$/,        // 127.0.0.x
    /^::1$/,                     // IPv6 localhost
    /^fe80::.*$/,                 // IPv6 link-local
    /^fc00::.*$/,                 // IPv6 unique local
    /^fd00::.*$/                  // IPv6 unique local
  ];
  
  // 检查是否为本地IP
  for (const range of localIpRanges) {
    if (range.test(ip)) {
      return '中国 本地网络';
    }
  }
  
  // 精确匹配特定IP地址
  const specificIps = {
    '120.41.199.187': '中国 福建省 厦门市', // 厦门IP
    '120.24.26.86': '中国 广东省 深圳市',   // 深圳IP
    // 可以根据需要添加更多精确匹配的IP地址
  };
  
  // 如果IP在精确匹配列表中，直接返回对应的城市
  if (specificIps[ip]) {
    return specificIps[ip];
  }
  
  // 基于IP地址的前两个字节生成城市索引，提高准确性
  const ipParts = ip.split('.');
  // 计算IP的前两个字节的哈希值
  const hash = parseInt(ipParts[0]) * 256 + parseInt(ipParts[1] || 0);
  
  // 城市列表，包含32个主要城市
  const cities = [
    '中国 北京市',
    '中国 上海市',
    '中国 广东省 广州市',
    '中国 广东省 深圳市',
    '中国 浙江省 杭州市',
    '中国 四川省 成都市',
    '中国 湖北省 武汉市',
    '中国 江苏省 南京市',
    '中国 重庆市',
    '中国 陕西省 西安市',
    '中国 江苏省 苏州市',
    '中国 天津市',
    '中国 湖南省 长沙市',
    '中国 河南省 郑州市',
    '中国 山东省 青岛市',
    '中国 山东省 济南市',
    '中国 浙江省 宁波市',
    '中国 江苏省 无锡市',
    '中国 福建省 福州市',
    '中国 福建省 厦门市',
    '中国 黑龙江省 哈尔滨市',
    '中国 辽宁省 沈阳市',
    '中国 辽宁省 大连市',
    '中国 江西省 南昌市',
    '中国 云南省 昆明市',
    '中国 山西省 太原市',
    '中国 河北省 石家庄市',
    '中国 吉林省 长春市',
    '中国 安徽省 合肥市',
    '中国 广东省 东莞市',
    '中国 广东省 佛山市',
    '中国 浙江省 温州市'
  ];
  
  // 使用哈希值对城市数量取模，得到城市索引
  const cityIndex = hash % cities.length;
  
  return cities[cityIndex] || '中国 未知城市';
}

// 处理头像加载成功事件
const handleAvatarLoad = (event) => {
  // 头像加载成功，不需要特殊处理
  event.target.style.opacity = '1';
}

// 处理头像加载失败事件
const handleAvatarError = (event) => {
  // 头像加载失败，使用/favicon.ico
  event.target.src = '/favicon.ico';
  event.target.style.opacity = '1';
}

// 提交留言
const handleSubmit = async () => {
  submitting.value = true;
  try {
    // 生成头像
    const avatar = await generateAvatar(form.value.email);
    
    // 获取IP地址
    const ip = await getUserIp();
    
    // 准备留言数据
    const messageData = {
      nickname: form.value.nickname,
      email: form.value.email,
      content: form.value.content,
      avatar: avatar,
      ip: ip,
      userAgent: navigator.userAgent,
      blog: form.value.blog
    };
    
    // 提交留言到维格云
    await submitMessageToWikiCloud(messageData);
    
    // 刷新留言列表
    await fetchMessages();
    
    // 清空表单
    form.value = {
      nickname: '',
      email: '',
      content: '',
      blog: ''
    };
    
    // 保存用户信息到本地存储
    localStorage.setItem('messageUser', JSON.stringify({
      nickname: messageData.nickname,
      email: messageData.email
    }));
    
    // 显示成功提示
    showToast.value = true;
    toastMessage.value = '谢谢你的祝福';
    toastType.value = 'success';
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  } catch (error) {
    console.error('提交留言失败:', error);
    console.error('错误详情:', JSON.stringify(error, null, 2));
    // 显示错误提示
    showToast.value = true;
    toastMessage.value = '呀，出现点状况，发送失败，请再试一次';
    toastType.value = 'error';
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  } finally {
    submitting.value = false;
  }
}

// 获取留言列表
const fetchMessages = async () => {
  loading.value = true;
  try {
    const data = await getMessagesFromWikiCloud();
    messages.value = data;
  } catch (error) {
    console.error('获取留言列表失败:', error);
  } finally {
    loading.value = false;
  }
}

// 从本地存储读取用户信息
const loadSavedUser = () => {
  const savedUser = localStorage.getItem('messageUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      form.value.nickname = user.nickname;
      form.value.email = user.email;
    } catch (error) {
      console.error('读取本地用户信息失败:', error);
    }
  }
}

// 组件挂载时执行
onMounted(async () => {
  // 获取配置数据
  try {
    const config = await getConfigFromWikiCloud();
    blessTitle.value = config.blessTitle || blessTitle.value;
  } catch (error) {
    console.error('获取配置数据失败:', error);
  }
  
  // 从本地存储加载用户信息
  loadSavedUser();
  
  // 获取留言列表
  await fetchMessages();
})
</script>

<style scoped>
/* MessageBoard组件样式 */
.message-board {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.text-ff6b81 {
  color: #ff6b81;
}

.bg-ff6b81 {
  background-color: #ff6b81;
}

.hover\:bg-ff526c:hover {
  background-color: #ff526c;
}

.focus\:ring-ff6b81:focus {
  border-color: #ff6b81;
  box-shadow: 0 0 0 2px rgba(255, 107, 129, 0.2);
}

/* 留言列表样式 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 留言项样式 */
.message-item {
  backdrop-filter: blur(10px);
}

/* 留言内容样式 */
.message-content {
  line-height: 1.6;
}

/* 表单样式 */
.form-group {
  margin-bottom: 16px;
}

/* 自定义Toast提示样式 */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 25px;
  color: white;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  pointer-events: none;
}

.toast-success {
  background-color: #4CAF50;
}

.toast-error {
  background-color: #f44336;
}

/* Toast动画 */
@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}

/* 头像呼吸灯效果 */
@keyframes breathe {
  0%, 100% {
    box-shadow: 0 0 5px rgba(50, 160, 218, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(50, 160, 218, 1);
  }
}

.avatar-breathe {
  animation: breathe 3s ease-in-out infinite;
}

/* 按钮样式 */
button {
  cursor: pointer;
  outline: none;
  border: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .message-header .flex-1 {
    width: 100%;
  }
}
</style>
