# 💖 情侣网站💖 

一个基于 Vue 3 构建的浪漫爱情主题网站，记录美好时光、分享爱情故事，支持网友留言祝福。

![演示效果](https://github.com/jianzhugo/Love/images/jiepin.png)

## ✨ 特色功能

### 🎨 视觉设计
- 采用渐变色彩和现代 UI 设计
- 响应式布局，适配各种设备
- 流畅的动画效果和过渡
- 自定义右键菜单，增强用户体验

### 🌟 核心功能
- **时光轴**：记录爱情历程中的重要时刻
- **照片画廊**：展示美好瞬间
- **留言板**：支持网友留言祝福（基于 Twikoo）
- **爱情清单**：共同完成的目标和愿望
- **美好瞬间**：分享生活中的小确幸

### 🛠 技术亮点

- 基于 Vue 3 Composition API 开发
- 使用 Vite 构建，开发体验流畅
- 支持动态配置，从云端获取网站信息，基于维格云
- Twikoo 评论系统，支持多 CDN 加载和重试机制
- 自定义鼠标点击效果和页面动效

## 🛠 技术栈

- **前端框架**：Vue 3
- **路由管理**：Vue Router 4
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **评论系统**：Twikoo
- **API 工具**：自定义 API 模块

## 📦 安装与运行

### 环境要求
- Node.js 16+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🚀 部署说明

### 静态部署

1. 配置config.json中的相关API

   twikooLink：Twikoo云函数URL

   wikiCloudApiKey：维格云API密钥

   wikiCloudDatasheetId：配置表格ID

   wikiCloudViewId：配置视图ID

2. 构建生产版本

   ```bash
   npm run build
   ```

3. 将 `dist` 目录下的文件部署到任意静态文件服务器

### Vercel/EdgeOne Pages 部署

1. 连接 GitHub 仓库
2. 选择 Vite 构建模板
3. 添加环境变量：
   - VITE_TWIKOO_LINK ：Twikoo云函数URL
   - VITE_WIKI_CLOUD_API_KEY ：维格云API密钥
   - VITE_WIKI_CLOUD_DATASHEET_ID ：配置表格ID
   - VITE_WIKI_CLOUD_VIEW_ID ：配置视图ID

### Twikoo 评论系统配置

1. 部署 Twikoo 云函数（支持 Vercel、腾讯云、云开发等）
   - 参考 Twikoo 官方文档部署云函数 https://twikoo.js.org/quick-start.html
2. 配置 Twikoo 链接：
   - 按前文方法配置Twikoo链接

## 📁 项目结构

```
src/
├── App.vue              # 根组件
├── main.js              # 应用入口
├── style.css            # 全局样式
├── components/          # Vue 组件
│   ├── About.vue        # 关于我们组件
│   ├── Avatar.vue       # 头像组件
│   ├── EffectAnimation.vue # 特效动画组件
│   ├── Footer.vue       # 底部组件
│   ├── Gallery.vue      # 相册组件
│   ├── Header.vue       # 头部组件
│   ├── Home.vue         # 首页组件
│   ├── LoveList.vue     # 爱情清单组件
│   ├── MessageBoard.vue # 留言板组件
│   ├── Moments.vue      # 美好瞬间组件
│   └── Timeline.vue     # 时间线组件
├── router/              # 路由配置
│   └── index.js         # 路由定义
└── utils/               # 工具函数
    └── api.js           # API 调用
```

## 🎯 网站功能

### 1. 首页
- 展示网站主题和欢迎信息
- 包含导航链接

### 2. 时间线
- 按时间顺序展示爱情历程
- 支持添加重要事件

### 3. 照片画廊
- 分类展示照片
- 支持大图查看

### 4. 留言板
- 支持匿名留言
- 支持回复功能
- 支持表情和图片

### 5. 爱情清单
- 记录共同的目标和愿望
- 支持标记完成状态

### 6. 美好瞬间
- 分享生活中的小确幸
- 支持文字和图片

### 7. 关于我们
- 介绍网站和创建初衷
- 联系方式

## ⚙️ 配置说明

### 动态配置

网站支持从维格云表格动态获取配置，包括：
- 网站标题和副标题
- 网站图标
- 各种特效开关
- 其他自定义配置

### 环境变量

| 变量名 | 说明 |
|--------|------|
| VITE_TWIKOO_LINK | Twikoo 云函数 URL |
| VITE_WIKI_CLOUD_API_KEY | 维格云API密钥 |
| VITE_WIKI_CLOUD_DATASHEET_ID | 配置表格ID |
| VITE_WIKI_CLOUD_VIEW_ID | 配置视图ID |

### 特效配置

在配置中可以开启/关闭以下特效：
- `selectEffect`：粒子特效
- `bottomJs`：底部动效
- `mouseClick`：鼠标点击效果

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
