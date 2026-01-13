// 简化的Canvas下雪特效
let snowCanvas = null;
let snowCtx = null;
let snowflakes = [];
let animationId = null;
let isRunning = false;

// 雪花类
class Snowflake {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * -window.innerHeight;
        // 大小范围保持1-12（原最大3倍）
        this.size = Math.random() * 11 + 1;
        // 降低速度，更大的雪花下落更快，但整体更慢
        this.speed = Math.random() * 1.5 + this.size * 0.15;
        // 初始风力，降低风力
        this.wind = Math.random() * 0.5 - 0.25;
        // 风力变化率，降低变化速度
        this.windChange = Math.random() * 0.01 - 0.005;
        // 透明度随机
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.y += this.speed;
        this.x += this.wind;
        // 风力随机变化，增加方向随机性
        this.wind += this.windChange;
        // 限制风力范围，降低最大风力
        if (this.wind > 0.5) {
            this.wind = 0.5;
            this.windChange *= -1;
        } else if (this.wind < -0.5) {
            this.wind = -0.5;
            this.windChange *= -1;
        }
        // 风力变化率也随机变化
        this.windChange += (Math.random() * 0.01 - 0.005) * 0.1;
        
        // 雪花飞出屏幕后重置
        if (this.y > window.innerHeight) {
            this.y = Math.random() * -100;
            this.x = Math.random() * window.innerWidth;
            // 重置属性，保持随机性
            this.size = Math.random() * 11 + 1;
            this.speed = Math.random() * 1.5 + this.size * 0.15;
            this.wind = Math.random() * 0.5 - 0.25;
            this.windChange = Math.random() * 0.01 - 0.005;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        
        // 雪花飞出左右屏幕后重置
        if (this.x > window.innerWidth + 5) {
            this.x = -5;
        } else if (this.x < -5) {
            this.x = window.innerWidth + 5;
        }
    }

    // 绘制圆形雪花，实现中间渐变和边缘模糊效果
    draw(ctx) {
        ctx.save();
        
        // 创建径向渐变，实现中心明亮、边缘模糊的效果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0, // 渐变中心
            this.x, this.y, this.size * 1.5 // 渐变边缘扩大，实现模糊效果
        );
        
        // 调整渐变停止点，实现边缘模糊
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 1.3})`);
        gradient.addColorStop(0.4, `rgba(255, 255, 255, ${this.opacity * 1.0})`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${this.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        // 绘制范围比实际可见范围大，确保模糊效果完整
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 初始化雪花
function initSnowflakes() {
    snowflakes = [];
    // 增加雪花数量到200，增强视觉效果
    for (let i = 0; i < 200; i++) {
        snowflakes.push(new Snowflake());
    }
}

// 动画循环
function animate() {
    snowCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    for (let snowflake of snowflakes) {
        snowflake.update();
        snowflake.draw(snowCtx);
    }
    
    animationId = requestAnimationFrame(animate);
}

// 响应窗口大小变化
function handleResize() {
    if (snowCanvas) {
        snowCanvas.width = window.innerWidth;
        snowCanvas.height = window.innerHeight;
    }
}

// 启动特效
function start() {
    if (isRunning) return;
    
    // 创建canvas元素
    snowCanvas = document.createElement('canvas');
    snowCtx = snowCanvas.getContext('2d');
    
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
    snowCanvas.style.position = 'fixed';
    snowCanvas.style.left = '0';
    snowCanvas.style.top = '0';
    snowCanvas.style.pointerEvents = 'none';
    snowCanvas.style.zIndex = '9999';
    snowCanvas.id = 'snow_canvas';
    
    document.body.appendChild(snowCanvas);
    
    // 初始化雪花
    initSnowflakes();
    
    // 开始动画
    animate();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
    
    isRunning = true;
}

// 停止特效
function stop() {
    if (!isRunning) return;
    
    // 取消动画
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // 移除canvas
    if (snowCanvas && snowCanvas.parentNode) {
        snowCanvas.parentNode.removeChild(snowCanvas);
        snowCanvas = null;
        snowCtx = null;
    }
    
    // 移除事件监听
    window.removeEventListener('resize', handleResize);
    
    // 清空雪花数组
    snowflakes = [];
    
    isRunning = false;
}

// 将函数绑定到window对象，供特效系统调用
window.start = start;
window.stop = stop;
