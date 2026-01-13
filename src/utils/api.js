// 维基云表格API配置
const WIKI_CLOUD_API = 'https://api.vika.cn/fusion/v1'

// 维基云配置，按优先级加载
// 1. 优先使用环境变量（适用于EdgeOne Pages/Vercel部署）
// 2. 其次从静态配置文件读取（适用于静态文件部署，可手动修改）
// 3. 最后使用硬编码默认值（作为兜底）
let API_KEY = import.meta.env.VITE_WIKI_CLOUD_API_KEY || '***' // 维基云API密钥
let CONFIG_DATASHEET_ID = import.meta.env.VITE_WIKI_CLOUD_DATASHEET_ID || '***' // 配置表格ID
let CONFIG_VIEW_ID = import.meta.env.VITE_WIKI_CLOUD_VIEW_ID || '***' // 配置视图ID

// 从config.json加载配置的函数
async function loadConfigFromFile() {
  try {
    const response = await fetch('/config.json')
    if (response.ok) {
      const config = await response.json()
      // 更新配置（如果config.json中有值）
      API_KEY = config.wikiCloudApiKey || API_KEY
      CONFIG_DATASHEET_ID = config.wikiCloudDatasheetId || CONFIG_DATASHEET_ID
      CONFIG_VIEW_ID = config.wikiCloudViewId || CONFIG_VIEW_ID
      console.log('从config.json加载维基云配置成功')
    }
  } catch (error) {
    console.warn('从config.json加载维基云配置失败:', error)
  }
}

// 确保配置加载
const configLoadedPromise = loadConfigFromFile()

/**
 * 缓存管理工具
 */
const cacheManager = {
  // 连续刷新的时间阈值（毫秒）
  CONTINUOUS_REFRESH_THRESHOLD: 5000, // 5秒内算连续刷新
  
  /**
   * 获取缓存数据
   * @param {string} key - 缓存键名
   * @returns {Object|null} 缓存数据或null
   */
  getCache(key) {
    try {
      const cacheItem = localStorage.getItem(key)
      if (!cacheItem) return null
      return JSON.parse(cacheItem)
    } catch (error) {
      console.error('读取缓存失败:', error)
      return null
    }
  },

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键名
   * @param {*} data - 要缓存的数据
   */
  setCache(key, data) {
    try {
      const now = new Date().getTime()
      const cacheItem = {
        data,
        timestamp: now,        // 缓存创建时间
        refreshCount: 0,       // 连续刷新计数
        lastAccessTime: now    // 上次访问时间
      }
      localStorage.setItem(key, JSON.stringify(cacheItem))
    } catch (error) {
      console.error('设置缓存失败:', error)
    }
  },

  /**
   * 更新缓存的访问信息
   * @param {string} key - 缓存键名
   * @returns {boolean} 是否需要重新获取数据（连续刷新2次）
   */
  updateAccessInfo(key) {
    try {
      const cacheItem = this.getCache(key)
      if (!cacheItem) return true
      
      const now = new Date().getTime()
      const timeDiff = now - cacheItem.lastAccessTime
      
      // 检查是否是连续刷新
      if (timeDiff <= this.CONTINUOUS_REFRESH_THRESHOLD) {
        // 连续刷新，增加计数
        cacheItem.refreshCount++
      } else {
        // 非连续刷新，重置计数
        cacheItem.refreshCount = 0
      }
      
      // 更新上次访问时间
      cacheItem.lastAccessTime = now
      
      // 保存更新后的缓存
      localStorage.setItem(key, JSON.stringify(cacheItem))
      
      // 如果连续刷新次数达到2次，返回true表示需要重新获取
      return cacheItem.refreshCount >= 2
    } catch (error) {
      console.error('更新访问信息失败:', error)
      return true
    }
  },

  /**
   * 检查缓存是否有效
   * @param {string} key - 缓存键名
   * @returns {boolean} 缓存是否有效
   */
  isCacheValid(key) {
    const cacheItem = this.getCache(key)
    if (!cacheItem) return false

    // 检查缓存是否超过一天
    const oneDay = 24 * 60 * 60 * 1000
    const now = new Date().getTime()
    if (now - cacheItem.timestamp > oneDay) return false

    return true
  }
}

/**
 * 从维基云表格获取配置内容
 * @returns {Promise<Object>} 配置对象
 */
export async function getConfigFromWikiCloud() {
  const cacheKey = 'wiki_cloud_config'
  
  // 检查缓存是否有效
  if (cacheManager.isCacheValid(cacheKey)) {
    // 更新访问信息，检查是否需要重新获取数据
    const needRefresh = cacheManager.updateAccessInfo(cacheKey)
    
    if (!needRefresh) {
      // 不需要重新获取，返回缓存数据
      const cachedData = cacheManager.getCache(cacheKey)
      return cachedData.data
    }
    // 需要重新获取，继续执行API请求
  }
  
  try {
    // 等待配置加载完成
    await configLoadedPromise
    
    const response = await fetch(`${WIKI_CLOUD_API}/datasheets/${CONFIG_DATASHEET_ID}/records?viewId=${CONFIG_VIEW_ID}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API请求失败: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`)
    }
    
    const data = await response.json()
    
    // 将表格记录转换为配置对象
    // 注意：根据用户提供的信息，表格结构为：Settings列表示设置项，value列表示对应值，remark列为说明
    const config = data.data.records.reduce((config, record) => {
      if (record.fields && record.fields.Settings && record.fields.value !== undefined) {
        config[record.fields.Settings] = record.fields.value
      }
      return config
    }, {})
    
    // 保存到缓存（会重置刷新计数）
    cacheManager.setCache(cacheKey, config)
    return config
  } catch (error) {
    console.error('从维基云表格获取配置失败:', error)
    
    // 尝试从缓存获取
    const cachedData = cacheManager.getCache(cacheKey)
    if (cachedData) {
      // 更新访问信息（但不强制刷新）
      cacheManager.updateAccessInfo(cacheKey)
      return cachedData.data
    }
    
    // 返回默认配置
    return {
      loveDate: '2023-01-15',
      weddingDate: '2015-03-03',
      dailyQuote: '爱你每一天'
    }
  }
}

/**
 * 解析表格API配置字符串
 * @param {string} configString - 配置字符串，格式为"API,DATASHEETS,VIEWID"
 * @returns {Object} 解析后的配置对象
 */
function parseSheetConfig(configString) {
  if (!configString) {
    return null
  }
  
  const [apiKey, datasheetId, viewId] = configString.split(',')
  
  if (!apiKey || !datasheetId || !viewId) {
    return null
  }
  
  return {
    apiKey,
    datasheetId,
    viewId
  }
}

/**
 * 从维基云表格获取爱情清单数据
 * @returns {Promise<Array>} 爱情清单数组
 */
export async function getLoveListFromWikiCloud() {
  const cacheKey = 'wiki_cloud_love_list'
  
  // 检查缓存是否有效
  if (cacheManager.isCacheValid(cacheKey)) {
    // 更新访问信息，检查是否需要重新获取数据
    const needRefresh = cacheManager.updateAccessInfo(cacheKey)
    
    if (!needRefresh) {
      // 不需要重新获取，返回缓存数据
      const cachedData = cacheManager.getCache(cacheKey)
      return cachedData.data
    }
    // 需要重新获取，继续执行API请求
  }
  
  try {
    // 先获取配置，包含love-list表格的API信息
    const config = await getConfigFromWikiCloud()
    const loveListConfig = parseSheetConfig(config['love-list'])
    
    if (!loveListConfig) {
      throw new Error('爱情清单表格配置无效')
    }
    
    const response = await fetch(`${WIKI_CLOUD_API}/datasheets/${loveListConfig.datasheetId}/records?viewId=${loveListConfig.viewId}`, {
      headers: {
        'Authorization': `Bearer ${loveListConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API请求失败: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`)
    }
    
    const data = await response.json()
    
    // 将表格记录转换为爱情清单数组
    // 注意：根据用户提供的信息，love-list表格结构为：list列表示清单项，todo列表示是否完成
    const loveList = data.data.records.map(record => ({
      id: record.recordId,
      list: record.fields.list || '',
      todo: record.fields.todo === true || record.fields.todo === 'ture' || record.fields.todo === 'true' || record.fields.todo === 'yes'
    }))
    
    // 保存到缓存（会重置刷新计数）
    cacheManager.setCache(cacheKey, loveList)
    return loveList
  } catch (error) {
    console.error('从维基云表格获取爱情清单失败:', error)
    
    // 尝试从缓存获取
    const cachedData = cacheManager.getCache(cacheKey)
    if (cachedData) {
      // 更新访问信息（但不强制刷新）
      cacheManager.updateAccessInfo(cacheKey)
      return cachedData.data
    }
    
    // 返回默认数据
    return [
      { id: 1, list: '一起看日出', todo: true },
      { id: 2, list: '一起去旅行', todo: false },
      { id: 3, list: '一起做饭', todo: true },
      { id: 4, list: '一起看电影', todo: false }
    ]
  }
}

/**
 * 从维基云表格获取相册照片数据
 * @returns {Promise<Array>} 相册照片数组
 */
export async function getGalleryPhotosFromWikiCloud() {
  const cacheKey = 'wiki_cloud_gallery'
  
  // 检查缓存是否有效
  if (cacheManager.isCacheValid(cacheKey)) {
    // 更新访问信息，检查是否需要重新获取数据
    const needRefresh = cacheManager.updateAccessInfo(cacheKey)
    
    if (!needRefresh) {
      // 不需要重新获取，返回缓存数据
      const cachedData = cacheManager.getCache(cacheKey)
      return cachedData.data
    }
    // 需要重新获取，继续执行API请求
  }
  
  try {
    // 先获取配置，包含photo表格的API信息
    const config = await getConfigFromWikiCloud()
    const photoConfig = parseSheetConfig(config['photo'])
    
    if (!photoConfig) {
      throw new Error('相册表格配置无效')
    }
    
    const response = await fetch(`${WIKI_CLOUD_API}/datasheets/${photoConfig.datasheetId}/records?viewId=${photoConfig.viewId}`, {
      headers: {
        'Authorization': `Bearer ${photoConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API请求失败: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`)
    }
    
    const data = await response.json()
    
    // 将表格记录转换为相册照片数组
    // 注意：photo表格结构为：imge列的值为照片路径；category表示此照片的分类；description表示此照片的说明
    const galleryPhotos = data.data.records.map(record => {
      // 处理imge字段，可能是数组或字符串
      let image = record.fields.imge
      if (Array.isArray(image) && image.length > 0) {
        image = image[0].url
      } else if (typeof image === 'object' && image !== null) {
        image = image.url || ''
      }
      
      // 处理category字段，可能是数组或字符串
      let category = record.fields.category || '日常'
      if (Array.isArray(category)) {
        category = category[0] || '日常'
      } else if (typeof category === 'object' && category !== null) {
        category = category.toString() || '日常'
      }
      
      return {
        id: record.recordId,
        image: image || '',
        category: category,
        description: record.fields.description || ''
      }
    }).filter(photo => photo.image) // 过滤掉没有图片路径的记录
    
    // 保存到缓存（会重置刷新计数）
    cacheManager.setCache(cacheKey, galleryPhotos)
    return galleryPhotos
  } catch (error) {
    console.error('从维基云表格获取相册照片失败:', error)
    
    // 尝试从缓存获取
    const cachedData = cacheManager.getCache(cacheKey)
    if (cachedData) {
      // 更新访问信息（但不强制刷新）
      cacheManager.updateAccessInfo(cacheKey)
      return cachedData.data
    }
    
    // 返回默认数据
    return [
      { id: 1, image: '/images/01.png', description: '第一次约会', category: '约会' },
      { id: 2, image: '/images/02.png', description: '海边旅行', category: '旅行' },
      { id: 3, image: '/images/03.png', description: '情人节', category: '节日' },
      { id: 4, image: '/images/04.png', description: '公园散步', category: '日常' }
    ]
  }
}

/**
 * 从维基云表格获取时间线数据
 * @returns {Promise<Array>} 时间线事件数组
 */
export async function getTimelineFromWikiCloud() {
  const cacheKey = 'wiki_cloud_timeline'
  
  // 检查缓存是否有效
  if (cacheManager.isCacheValid(cacheKey)) {
    // 更新访问信息，检查是否需要重新获取数据
    const needRefresh = cacheManager.updateAccessInfo(cacheKey)
    
    if (!needRefresh) {
      // 不需要重新获取，返回缓存数据
      const cachedData = cacheManager.getCache(cacheKey)
      return cachedData.data
    }
    // 需要重新获取，继续执行API请求
  }
  
  try {
    // 先获取配置，包含timeline表格的API信息
    const config = await getConfigFromWikiCloud()
    const timelineConfig = parseSheetConfig(config['timeline'])
    
    if (!timelineConfig) {
      throw new Error('时间线表格配置无效')
    }
    
    const response = await fetch(`${WIKI_CLOUD_API}/datasheets/${timelineConfig.datasheetId}/records?viewId=${timelineConfig.viewId}`, {
      headers: {
        'Authorization': `Bearer ${timelineConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API请求失败: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`)
    }
    
    const data = await response.json()
    
    // 将表格记录转换为时间线事件数组
    // 注意：timeline表格结构为：date列的值表示事件日期；title列的值表示事件标题；text列的值表示事件描述；img列的值表示图片链接
    const timeline = data.data.records.map(record => {
      // 处理img字段，可能是数组或字符串
      let image = record.fields.img
      if (Array.isArray(image) && image.length > 0) {
        image = image[0].url
      } else if (typeof image === 'object' && image !== null) {
        image = image.url || ''
      }
      return {
        id: record.recordId,
        date: record.fields.date || '',
        title: record.fields.title || '',
        description: record.fields.text || '',
        image: image
      }
    }).filter(event => event.date && event.title) // 过滤掉没有日期和标题的记录
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // 按日期降序排列
    
    // 保存到缓存（会重置刷新计数）
    cacheManager.setCache(cacheKey, timeline)
    return timeline
  } catch (error) {
    console.error('从维基云表格获取时间线数据失败:', error)
    
    // 尝试从缓存获取
    const cachedData = cacheManager.getCache(cacheKey)
    if (cachedData) {
      // 更新访问信息（但不强制刷新）
      cacheManager.updateAccessInfo(cacheKey)
      return cachedData.data
    }
    
    // 返回默认数据
    return [
      {
        id: 1,
        date: '2023-01-15',
        title: '初次相遇',
        description: '在咖啡馆的转角，我们第一次相遇，命运的齿轮开始转动。',
        image: '/images/01.png'
      },
      {
        id: 2,
        date: '2023-02-14',
        title: '情人节告白',
        description: '在浪漫的情人节，我们正式确立了恋爱关系。',
        image: '/images/02.png'
      },
      {
        id: 3,
        date: '2023-05-01',
        title: '第一次旅行',
        description: '我们一起去了海边，度过了美好的五一假期。',
        image: '/images/03.png'
      },
      {
        id: 4,
        date: '2023-12-25',
        title: '圣诞节礼物',
        description: '收到了彼此精心准备的圣诞节礼物，感受到了满满的爱意。',
        image: '/images/04.png'
      },
      {
        id: 5,
        date: '2024-01-15',
        title: '一周年纪念日',
        description: '我们相爱一周年了，未来的路还很长，我们一起走下去。',
        image: '/images/05.png'
      }
    ]
  }
}

/**
 * 从维基云表格获取生活点滴数据
 * @returns {Promise<Array>} 生活点滴数组
 */
export async function getMomentsFromWikiCloud() {
  const cacheKey = 'wiki_cloud_moments'
  
  // 检查缓存是否有效
  if (cacheManager.isCacheValid(cacheKey)) {
    // 更新访问信息，检查是否需要重新获取数据
    const needRefresh = cacheManager.updateAccessInfo(cacheKey)
    
    if (!needRefresh) {
      // 不需要重新获取，返回缓存数据
      const cachedData = cacheManager.getCache(cacheKey)
      return cachedData.data
    }
    // 需要重新获取，继续执行API请求
  }
  
  try {
    // 先获取配置，包含moments表格的API信息
    const config = await getConfigFromWikiCloud()
    const momentsConfig = parseSheetConfig(config['moments'])
    
    if (!momentsConfig) {
      throw new Error('生活点滴表格配置无效')
    }
    
    const response = await fetch(`${WIKI_CLOUD_API}/datasheets/${momentsConfig.datasheetId}/records?viewId=${momentsConfig.viewId}`, {
      headers: {
        'Authorization': `Bearer ${momentsConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API请求失败: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`)
    }
    
    const data = await response.json()
    
    // 将表格记录转换为生活点滴数组
    // 注意：根据用户提供的信息，moments表格结构为：date列的值表示日期；title列的值表示标题；text列的值表示内容；img列的值表示图片链接
    const moments = data.data.records.map(record => {
      // 处理img字段，可能是数组或字符串
      let image = record.fields.img
      if (Array.isArray(image) && image.length > 0) {
        image = image[0].url
      } else if (typeof image === 'object' && image !== null) {
        image = image.url || ''
      }
      return {
        id: record.recordId,
        date: record.fields.date || '',
        title: record.fields.title || '',
        content: record.fields.text || '',
        image: image
      }
    }).filter(moment => moment.date && moment.title) // 过滤掉没有日期和标题的记录
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // 按日期降序排列
    
    // 保存到缓存（会重置刷新计数）
    cacheManager.setCache(cacheKey, moments)
    return moments
  } catch (error) {
    console.error('从维基云表格获取生活点滴数据失败:', error)
    
    // 尝试从缓存获取
    const cachedData = cacheManager.getCache(cacheKey)
    if (cachedData) {
      // 更新访问信息（但不强制刷新）
      cacheManager.updateAccessInfo(cacheKey)
      return cachedData.data
    }
    
    // 返回默认数据
    return [
      {
        id: 1,
        date: '2025-12-25',
        title: '圣诞节的惊喜',
        content: '今天是圣诞节，我们一起去了教堂，然后在咖啡馆度过了一个浪漫的下午。收到了对方精心准备的礼物，非常开心！',
        image: '/images/01.png'
      },
      {
        id: 2,
        date: '2025-11-11',
        title: '双十一购物节',
        content: '今天和亲爱的一起参加了双十一购物狂欢，买了很多实用的东西，也给对方买了小礼物。虽然有点累，但是很开心！',
        image: '/images/02.png'
      },
      {
        id: 3,
        date: '2025-10-01',
        title: '国庆节出游',
        content: '国庆假期我们去了海边，吹着海风，看着日落，感觉非常放松。这是我们第一次一起看海，留下了美好的回忆。',
        image: '/images/03.png'
      }
    ]
  }
}

/**
 * 计算恋爱天数
 * @param {string} loveDate 恋爱开始日期
 * @returns {number} 恋爱天数
 */
export function calculateLoveDays(loveDate) {
  const today = new Date()
  const startDate = new Date(loveDate)
  const timeDiff = today.getTime() - startDate.getTime()
  return Math.floor(timeDiff / (1000 * 3600 * 24))
}
