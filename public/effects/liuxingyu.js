// 流星雨特效
let meteorCanvas = null;
let meteorCtx = null;
let meteors = [];
let animationId = null;
let isRunning = false;

// 流星类
class Meteor {
    constructor() {
        this.reset();
    }

    reset() {
        // 从屏幕顶部外开始
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * -window.innerHeight;
        // 流星长度
        this.length = Math.random() * 80 + 50;
        // 流星宽度
        this.width = Math.random() * 3 + 1;
        // 流星速度
        this.speed = Math.random() * 10 + 5;
        // 流星角度（向下倾斜）
        this.angle = Math.PI / 4 + Math.random() * Math.PI / 4;
        // 流星颜色
        this.color = `rgba(255, ${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 50) + 50}, ${Math.random() * 0.5 + 0.5})`;
        // 尾巴透明度衰减速度
        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        // 沿角度移动
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        
        // 流星飞出屏幕后重置
        if (this.y > window.innerHeight || this.x > window.innerWidth) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.save();
        
        // 创建渐变，实现尾巴效果
        const gradient = ctx.createLinearGradient(
            this.x,
            this.y,
            this.x - Math.cos(this.angle) * this.length,
            this.y - Math.sin(this.angle) * this.length
        );
        
        // 流星头部明亮，尾巴逐渐消失
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.3, this.color.replace(/[^,]+(?=\))/, '0.8'));
        gradient.addColorStop(0.6, this.color.replace(/[^,]+(?=\))/, '0.3'));
        gradient.addColorStop(1, this.color.replace(/[^,]+(?=\))/, '0'));
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        
        // 绘制流星
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - Math.cos(this.angle) * this.length,
            this.y - Math.sin(this.angle) * this.length
        );
        ctx.stroke();
        
        ctx.restore();
    }
}

// 初始化流星雨
function initMeteors() {
    meteors = [];
    // 创建20颗流星
    for (let i = 0; i < 20; i++) {
        meteors.push(new Meteor());
    }
}

// 动画循环
function animate() {
    meteorCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    for (let meteor of meteors) {
        meteor.update();
        meteor.draw(meteorCtx);
    }
    
    animationId = requestAnimationFrame(animate);
}

// 响应窗口大小变化
function handleResize() {
    if (meteorCanvas) {
        meteorCanvas.width = window.innerWidth;
        meteorCanvas.height = window.innerHeight;
    }
}

// 启动特效
function start() {
    if (isRunning) return;
    
    // 创建canvas元素
    meteorCanvas = document.createElement('canvas');
    meteorCtx = meteorCanvas.getContext('2d');
    
    meteorCanvas.width = window.innerWidth;
    meteorCanvas.height = window.innerHeight;
    meteorCanvas.style.position = 'fixed';
    meteorCanvas.style.left = '0';
    meteorCanvas.style.top = '0';
    meteorCanvas.style.pointerEvents = 'none';
    meteorCanvas.style.zIndex = '9999';
    meteorCanvas.id = 'meteor_canvas';
    
    document.body.appendChild(meteorCanvas);
    
    // 初始化流星雨
    initMeteors();
    
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
    if (meteorCanvas && meteorCanvas.parentNode) {
        meteorCanvas.parentNode.removeChild(meteorCanvas);
        meteorCanvas = null;
        meteorCtx = null;
    }
    
    // 移除事件监听
    window.removeEventListener('resize', handleResize);
    
    // 清空流星数组
    meteors = [];
    
    isRunning = false;
}

// 将函数绑定到window对象，供特效系统调用
window.start = start;
window.stop = stop;