<template>
  <div class="message-board py-12">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl text-center bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent mb-6">{{ blessTitle }}</h2>
      
      <!-- 留言板容器 -->
      <div class="bg-white-0.9 rounded-xl shadow-lg shadow-blue-300 p-6 max-w-3xl mx-auto">
        <!-- 留言列表标题 -->
        <div class="mb-6 text-center">
          <h3 class="text-xl font-bold text-ff6b81">累计已经收到 <span class="text-3xl"> {{ messages.length }} </span> 条祝福</h3>
        </div>
        
        <!-- 留言列表 -->
        <div class="messages-list space-y-0.5">
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
                <span>{{ message.location || '获取位置中...' }}</span>
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
            <p>快来成为第一个祝福人吧！</p>
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
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#f9802d] focus:border-[#f9802d] transition-all"
                placeholder="昵称（必填）"
              >
              
              <input 
                type="email" 
                id="email" 
                v-model="form.email" 
                required
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#f9802d] focus:border-[#f9802d] transition-all"
                placeholder="邮箱（必填）"
              >
              
              <input 
                type="url" 
                id="blog" 
                v-model="form.blog" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#f9802d] focus:border-[#f9802d] transition-all"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#f9802d] focus:border-[#f9802d] transition-all resize-none"
                placeholder="发送祝福后需连续刷新2次才会显示..."
              ></textarea>
            </div>
            
            <!-- 表情选择和提交按钮 -->
            <div class="flex justify-between items-center relative">
              <!-- 表情选择按钮 -->
              <button 
                type="button" 
                @click="toggleEmojiPicker"
                class="w-auto px-3 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center"
                title="表情"
              >
                <span>😊</span>
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
  // 定义IP获取服务，优先获取IPv4地址
  const ipServices = [
    // IPv4优先的服务
    'https://ipv4.icanhazip.com',      // 仅返回IPv4地址
    'https://api.ipify.org?format=json&type=4', // 仅返回IPv4地址
    'https://ifconfig.me/ip',           // 优先返回IPv4地址
    'https://api64.ipify.org?format=json&type=4', // 仅返回IPv4地址
    // IPv6服务（作为备选）
    'https://api.ipify.org?format=json&type=6',
    'https://api64.ipify.org?format=json&type=6'
  ];
  
  // 尝试从多个服务获取IP
  for (const service of ipServices) {
    try {
      const response = await fetch(service, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 5000 // 设置5秒超时
      });
      
      if (response.ok) {
        // 处理不同服务的响应格式
        let ip;
        if (service.includes('ipify')) {
          // ipify返回JSON格式
          const data = await response.json();
          ip = data.ip;
        } else {
          // 其他服务返回纯文本IP
          ip = await response.text();
          ip = ip.trim();
        }
        
        // 如果获取到的是IPv4地址，直接返回
        if (!ip.includes(':')) {
          return ip;
        }
        
        // 对于IPv6地址，仅当所有IPv4服务都失败时才返回
        if (service.includes('type=6')) {
          return ip;
        }
      }
    } catch (error) {
      console.warn(`从${service}获取IP失败:`, error.message);
      // 继续尝试下一个服务
      continue;
    }
  }
  
  // 如果所有服务都失败，尝试从navigator获取IP地址，优先IPv4
  try {
    if (navigator && navigator.connection && navigator.connection.rtt) {
      const peerConnection = new RTCPeerConnection();
      peerConnection.createDataChannel('');
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // 从SDP中提取IP地址，优先IPv4
      const sdpLines = peerConnection.localDescription.sdp.split('\n');
      let ipv6Address = null;
      
      for (const line of sdpLines) {
        if (line.startsWith('c=')) {
          const ip = line.split(' ')[2];
          if (ip && ip !== '0.0.0.0') {
            // 如果是IPv4地址，直接返回
            if (!ip.includes(':')) {
              peerConnection.close();
              return ip;
            }
            // 保存IPv6地址作为备选
            ipv6Address = ip;
          }
        }
      }
      
      peerConnection.close();
      
      // 如果没有找到IPv4地址，返回IPv6地址
      if (ipv6Address) {
        return ipv6Address;
      }
    }
  } catch (error) {
    console.warn('从RTCPeerConnection获取IP失败:', error.message);
  }
  
  // 所有方法都失败，返回默认值
  return '未知IP'
}

// 生成头像URL
const generateAvatar = async (email) => {
  const errorAvatar = '/favicon.ico'; // 加载失败时使用的头像
  
  // 检查是否为QQ邮箱
  const qqRegex = /^\d+@qq\.com$/;
  const qqMatch = email.match(qqRegex);
  if (qqMatch) {
    // 提取QQ号码
    const qqNumber = email.split('@')[0];
    const qqAvatar = `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=640`;
    return qqAvatar; // QQ头像服务比较可靠，直接返回
  }
  
  // 生成邮箱的MD5哈希
  const md5Email = md5(email.toLowerCase().trim());
  
  // 定义多个国内可用的头像服务，增加可靠性
  const avatarServices = [
    // Cravatar.cn - 国内Gravatar镜像
    `https://cravatar.cn/avatar/${md5Email}?d=mp&s=640`,
    // 七牛云提供的Gravatar镜像
    `https://dn-qiniu-avatar.qbox.me/avatar/${md5Email}?d=mp&s=640`,
    // 本地默认头像（使用favicon.ico作为备用）
    errorAvatar
  ];
  
  // 尝试从多个服务获取头像，返回第一个可用的
  for (const avatarUrl of avatarServices) {
    try {
      // 对于非本地头像，使用fetch检查可用性
      if (avatarUrl !== errorAvatar) {
        const response = await fetch(avatarUrl, {
          method: 'HEAD', // 使用HEAD请求，只获取响应头，不下载图片
          mode: 'cors',
          timeout: 2000 // 设置2秒超时
        });
        
        // 如果响应状态码为200，说明图片存在
        if (response.ok) {
          return avatarUrl;
        }
      } else {
        // 本地头像直接返回
        return avatarUrl;
      }
    } catch (error) {
      console.warn(`头像服务 ${avatarUrl} 不可用:`, error.message);
      // 继续尝试下一个服务
      continue;
    }
  }
  
  // 所有服务都失败时使用错误头像
  return errorAvatar;
}

// 使用更可靠的MD5算法实现
const md5 = (str) => {
  // 参考RFC 1321实现的简化MD5算法
  const rotateLeft = (n, s) => (n << s) | (n >>> (32 - s));
  
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const c3 = 0xe6546b64;
  const c4 = 0x85ebca6b;
  const c5 = 0xc2b2ae35;
  
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  
  str += String.fromCharCode(0x80);
  
  let l = str.length * 8;
  let trail = l % 512;
  let k = trail < 448 ? 448 - trail : 512 + 448 - trail;
  
  for (let i = 0; i < k / 8; i++) {
    str += String.fromCharCode(0x00);
  }
  
  str += String.fromCharCode(
    (l >>> 24) & 0xff,
    (l >>> 16) & 0xff,
    (l >>> 8) & 0xff,
    l & 0xff
  );
  
  for (let i = 0; i < str.length; i += 64) {
    const w = new Array(16);
    for (let j = 0; j < 16; j++) {
      w[j] = (
        (str.charCodeAt(i + j * 4) & 0xff) << 24 |
        (str.charCodeAt(i + j * 4 + 1) & 0xff) << 16 |
        (str.charCodeAt(i + j * 4 + 2) & 0xff) << 8 |
        (str.charCodeAt(i + j * 4 + 3) & 0xff)
      );
    }
    
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    
    for (let j = 0; j < 64; j++) {
      let f, g;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }
      
      const temp = d;
      d = c;
      c = b;
      b = b + rotateLeft((a + f + [c1, c2, c3, c4][Math.floor(j / 16)] + w[g]), [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][j % 16]);
      a = temp;
    }
    
    h0 += a;
    h1 += b;
    h2 += c;
    h3 += d;
  }
  
  // 将结果转换为十六进制字符串
  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return (
    toHex((h0 >>> 0) & 0xff) +
    toHex((h0 >>> 8) & 0xff) +
    toHex((h0 >>> 16) & 0xff) +
    toHex((h0 >>> 24) & 0xff) +
    toHex((h1 >>> 0) & 0xff) +
    toHex((h1 >>> 8) & 0xff) +
    toHex((h1 >>> 16) & 0xff) +
    toHex((h1 >>> 24) & 0xff) +
    toHex((h2 >>> 0) & 0xff) +
    toHex((h2 >>> 8) & 0xff) +
    toHex((h2 >>> 16) & 0xff) +
    toHex((h2 >>> 24) & 0xff) +
    toHex((h3 >>> 0) & 0xff) +
    toHex((h3 >>> 8) & 0xff) +
    toHex((h3 >>> 16) & 0xff) +
    toHex((h3 >>> 24) & 0xff)
  );
}

// 格式化时间为年-月-日
const formatTime = (timeString) => {
  const date = new Date(timeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// IP地理位置缓存，避免重复请求
const ipLocationCache = new Map();

// 获取IP所在地，使用第三方API获取真实地理位置
const getIpLocation = async (ip) => {
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
  
  // 检查缓存中是否已有该IP的地理位置
  if (ipLocationCache.has(ip)) {
    return ipLocationCache.get(ip);
  }
  
  // 使用第三方IP查询API获取真实地理位置
  // 这里使用ip-api.com，它提供免费的IP地理定位服务
  try {
    // ip-api.com同时支持IPv4和IPv6
    const apiUrl = `http://ip-api.com/json/${ip}?lang=zh-CN`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors',
      timeout: 3000 // 设置3秒超时
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // 检查API响应是否成功
      if (data.status === 'success') {
        let location;
        
        // 构建地理位置字符串
        if (data.country === '中国') {
          // 中国IP，显示为"中国 省份 城市"
          location = `中国 ${data.regionName || ''} ${data.city || ''}`.trim();
        } else {
          // 外国IP，显示为"国家 城市"
          location = `${data.country} ${data.city || ''}`.trim();
        }
        
        // 缓存结果
        ipLocationCache.set(ip, location);
        
        return location;
      }
    }
  } catch (error) {
    console.warn('IP查询API请求失败:', error.message);
  }
  
  // 如果API请求失败，使用备用方案：基于IP地址生成城市
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
  
  // 检测IP类型并计算哈希值
  let hash;
  if (ip.includes(':')) {
    // IPv6地址处理
    // 将IPv6地址按冒号分割，取前两个部分计算哈希
    const ipv6Parts = ip.split(':');
    // 计算前两个部分的哈希值
    const part1 = ipv6Parts[0] || '0';
    const part2 = ipv6Parts[1] || '0';
    // 将十六进制转换为十进制并计算哈希
    hash = parseInt(part1, 16) + parseInt(part2, 16);
  } else {
    // IPv4地址处理
    // 基于IP地址的前两个字节生成城市索引，提高准确性
    const ipParts = ip.split('.');
    // 计算IP的前两个字节的哈希值
    hash = parseInt(ipParts[0]) * 256 + parseInt(ipParts[1] || 0);
  }
  
  // 使用哈希值对城市数量取模，得到城市索引
  const cityIndex = Math.abs(hash) % cities.length;
  const location = cities[cityIndex] || '中国 未知城市';
  
  // 缓存结果
  ipLocationCache.set(ip, location);
  
  return location;
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
    
    // 获取IP地址的地理位置
    const location = await getIpLocation(messageData.ip);
    messageData.location = location;
    
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
    
    // 为每条留言预加载IP地理位置
    for (const message of data) {
      if (message.ip) {
        try {
          // 获取并存储地理位置
          message.location = await getIpLocation(message.ip);
        } catch (error) {
          console.warn(`为IP ${message.ip} 获取地理位置失败:`, error.message);
          message.location = '未知城市';
        }
      } else {
        message.location = '未知城市';
      }
    }
    
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

/* 留言列表样式 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
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
