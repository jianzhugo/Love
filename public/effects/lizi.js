// 粒子效果
let particleCanvas = null;
let particleCtx = null;
let particles = [];
let animationId = null;
let isRunning = false;

// 鼠标位置
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// 粒子类
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        // 随机位置
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        // 粒子大小
        this.size = Math.random() * 8 + 2;
        // 随机速度
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        // 粒子颜色（彩色渐变）
        this.hue = Math.random() * 360;
        this.saturation = Math.random() * 50 + 50;
        this.lightness = Math.random() * 50 + 50;
        // 透明度
        this.opacity = Math.random() * 0.5 + 0.3;
        // 鼠标吸引力系数
        this.attraction = Math.random() * 0.02 + 0.01;
    }

    update() {
        // 鼠标吸引力
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            const force = (150 - distance) * this.attraction;
            this.vx += (dx / distance) * force;
            this.vy += (dy / distance) * force;
        }
        
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;
        
        // 速度衰减
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // 边界检测，粒子反弹
        if (this.x < 0 || this.x > window.innerWidth) {
            this.vx *= -0.8;
            this.x = Math.max(0, Math.min(window.innerWidth, this.x));
        }
        if (this.y < 0 || this.y > window.innerHeight) {
            this.vy *= -0.8;
            this.y = Math.max(0, Math.min(window.innerHeight, this.y));
        }
        
        // 颜色缓慢变化
        this.hue = (this.hue + 0.5) % 360;
    }

    draw(ctx) {
        ctx.save();
        
        // 创建径向渐变，实现中心明亮、边缘模糊的效果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        
        const color = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity})`;
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.7, color.replace(/[^,]+(?=\))/, `${this.opacity * 0.5}`));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 初始化粒子
function initParticles() {
    particles = [];
    // 创建100个粒子
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
}

// 动画循环
function animate() {
    particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    for (let particle of particles) {
        particle.update();
        particle.draw(particleCtx);
    }
    
    animationId = requestAnimationFrame(animate);
}

// 响应窗口大小变化
function handleResize() {
    if (particleCanvas) {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }
}

// 响应鼠标移动
function handleMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

// 启动特效
function start() {
    if (isRunning) return;
    
    // 创建canvas元素
    particleCanvas = document.createElement('canvas');
    particleCtx = particleCanvas.getContext('2d');
    
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    particleCanvas.style.position = 'fixed';
    particleCanvas.style.left = '0';
    particleCanvas.style.top = '0';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.style.zIndex = '9999';
    particleCanvas.id = 'particle_canvas';
    
    document.body.appendChild(particleCanvas);
    
    // 初始化粒子
    initParticles();
    
    // 开始动画
    animate();
    
    // 添加事件监听
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove);
    
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
    if (particleCanvas && particleCanvas.parentNode) {
        particleCanvas.parentNode.removeChild(particleCanvas);
        particleCanvas = null;
        particleCtx = null;
    }
    
    // 移除事件监听
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('mousemove', handleMouseMove);
    
    // 清空粒子数组
    particles = [];
    
    isRunning = false;
}

// 将函数绑定到window对象，供特效系统调用
window.start = start;
window.stop = stop;