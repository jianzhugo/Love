// 气泡效果
let bubbleCanvas = null;
let bubbleCtx = null;
let bubbles = [];
let animationId = null;
let isRunning = false;

// 气泡类
class Bubble {
    constructor() {
        this.reset();
    }

    reset() {
        // 从屏幕底部外开始
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight + Math.random() * 100;
        // 气泡大小
        this.size = Math.random() * 20 + 5;
        // 上升速度
        this.speed = Math.random() * 4 + 0.5;
        // 左右摇摆幅度
        this.swing = Math.random() * 2 + 1;
        // 摇摆速度
        this.swingSpeed = Math.random() * 0.05 + 0.02;
        // 摇摆相位
        this.phase = Math.random() * Math.PI * 2;
        // 气泡透明度
        this.opacity = Math.random() * 0.3 + 0.3;
        // 气泡颜色
        this.hue = Math.random() * 30; // 红色调（0-60度）
        this.saturation = Math.random() * 50 + 50;
        this.lightness = Math.random() * 50 + 50;
    }

    update() {
        // 向上移动
        this.y -= this.speed;
        
        // 左右摇摆
        this.x += Math.sin(this.phase) * this.swing;
        this.phase += this.swingSpeed;
        
        // 气泡飞出屏幕后重置
        if (this.y + this.size < 0) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.save();
        
        // 创建径向渐变，实现气泡的透明效果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        
        // 气泡中心明亮，边缘逐渐透明
        const color = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity})`;
        gradient.addColorStop(0, color.replace(/[^,]+(?=\))/, `${this.opacity * 1.2}`));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(0.9, color.replace(/[^,]+(?=\))/, `${this.opacity * 0.5}`));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = color.replace(/[^,]+(?=\))/, `${this.opacity * 0.8}`);
        ctx.lineWidth = 1;
        
        // 绘制气泡
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 绘制气泡高光
        const highlightSize = this.size * 0.3;
        const highlightX = this.x - this.size * 0.2;
        const highlightY = this.y - this.size * 0.2;
        const highlightGradient = ctx.createRadialGradient(
            highlightX, highlightY, 0,
            highlightX, highlightY, highlightSize
        );
        highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.8})`);
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 初始化气泡
function initBubbles() {
    bubbles = [];
    // 创建50个气泡
    for (let i = 0; i < 50; i++) {
        bubbles.push(new Bubble());
    }
}

// 动画循环
function animate() {
    bubbleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    for (let bubble of bubbles) {
        bubble.update();
        bubble.draw(bubbleCtx);
    }
    
    animationId = requestAnimationFrame(animate);
}

// 响应窗口大小变化
function handleResize() {
    if (bubbleCanvas) {
        bubbleCanvas.width = window.innerWidth;
        bubbleCanvas.height = window.innerHeight;
    }
}

// 启动特效
function start() {
    if (isRunning) return;
    
    // 创建canvas元素
    bubbleCanvas = document.createElement('canvas');
    bubbleCtx = bubbleCanvas.getContext('2d');
    
    bubbleCanvas.width = window.innerWidth;
    bubbleCanvas.height = window.innerHeight;
    bubbleCanvas.style.position = 'fixed';
    bubbleCanvas.style.left = '0';
    bubbleCanvas.style.top = '0';
    bubbleCanvas.style.pointerEvents = 'none';
    bubbleCanvas.style.zIndex = '9999';
    bubbleCanvas.id = 'bubble_canvas';
    
    document.body.appendChild(bubbleCanvas);
    
    // 初始化气泡
    initBubbles();
    
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
    if (bubbleCanvas && bubbleCanvas.parentNode) {
        bubbleCanvas.parentNode.removeChild(bubbleCanvas);
        bubbleCanvas = null;
        bubbleCtx = null;
    }
    
    // 移除事件监听
    window.removeEventListener('resize', handleResize);
    
    // 清空气泡数组
    bubbles = [];
    
    isRunning = false;
}

// 将函数绑定到window对象，供特效系统调用
window.start = start;
window.stop = stop;