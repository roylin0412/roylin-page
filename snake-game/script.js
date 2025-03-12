// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏配置
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SNAKE_BLOCK = 20;
const SNAKE_SPEED = 10;
const COLORS = {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    RED: '#FF0000',
    GREEN: '#00FF00'
};

// 游戏变量
let game = {
    over: false,
    score: 0,
    timer: null
};

let snake = {
    x: Math.floor(WIDTH / 2 / SNAKE_BLOCK) * SNAKE_BLOCK,
    y: Math.floor(HEIGHT / 2 / SNAKE_BLOCK) * SNAKE_BLOCK,
    dx: 0,
    dy: 0,
    body: [],
    length: 1
};

let food = {
    x: 0,
    y: 0
};

// 初始化游戏
function initGame() {
    console.log("初始化游戏");
    
    // 重置游戏状态
    game.over = false;
    game.score = 0;
    document.getElementById('score').textContent = game.score;
    document.getElementById('gameOver').style.display = 'none';
    
    // 重置蛇的位置和状态
    snake.x = Math.floor(WIDTH / 2 / SNAKE_BLOCK) * SNAKE_BLOCK;
    snake.y = Math.floor(HEIGHT / 2 / SNAKE_BLOCK) * SNAKE_BLOCK;
    snake.dx = 0;
    snake.dy = 0;
    snake.body = [{x: snake.x, y: snake.y}];
    snake.length = 1;
    
    // 生成食物
    generateFood();
    
    // 清除之前的定时器
    if (game.timer) {
        clearInterval(game.timer);
    }
    
    // 立即绘制初始状态
    draw();
    
    // 启动游戏循环
    game.timer = setInterval(gameLoop, 1000 / SNAKE_SPEED);
    
    console.log("游戏初始化完成");
}

// 生成食物
function generateFood() {
    // 创建所有可能的位置
    const allPositions = [];
    for (let x = 0; x < WIDTH; x += SNAKE_BLOCK) {
        for (let y = 0; y < HEIGHT; y += SNAKE_BLOCK) {
            allPositions.push({x, y});
        }
    }
    
    // 移除蛇身占据的位置
    const availablePositions = allPositions.filter(pos => {
        return !snake.body.some(segment => segment.x === pos.x && segment.y === pos.y);
    });
    
    // 随机选择一个可用位置
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        food.x = availablePositions[randomIndex].x;
        food.y = availablePositions[randomIndex].y;
        console.log("食物位置:", food.x, food.y);
    }
}

// 处理键盘输入
document.addEventListener('keydown', function(event) {
    if (game.over) return;
    
    switch (event.key) {
        case 'ArrowLeft':
            if (snake.dx === 0) { // 防止反向移动
                snake.dx = -SNAKE_BLOCK;
                snake.dy = 0;
                console.log("键盘：向左移动");
            }
            break;
        case 'ArrowRight':
            if (snake.dx === 0) {
                snake.dx = SNAKE_BLOCK;
                snake.dy = 0;
                console.log("键盘：向右移动");
            }
            break;
        case 'ArrowUp':
            if (snake.dy === 0) {
                snake.dy = -SNAKE_BLOCK;
                snake.dx = 0;
                console.log("键盘：向上移动");
            }
            break;
        case 'ArrowDown':
            if (snake.dy === 0) {
                snake.dy = SNAKE_BLOCK;
                snake.dx = 0;
                console.log("键盘：向下移动");
            }
            break;
    }
});

// 处理方向按钮点击
document.getElementById('leftButton').onclick = function() {
    if (game.over) return;
    if (snake.dx === 0) { // 防止反向移动
        snake.dx = -SNAKE_BLOCK;
        snake.dy = 0;
        console.log("按钮：向左移动");
    }
};

document.getElementById('rightButton').onclick = function() {
    if (game.over) return;
    if (snake.dx === 0) {
        snake.dx = SNAKE_BLOCK;
        snake.dy = 0;
        console.log("按钮：向右移动");
    }
};

document.getElementById('upButton').onclick = function() {
    if (game.over) return;
    if (snake.dy === 0) {
        snake.dy = -SNAKE_BLOCK;
        snake.dx = 0;
        console.log("按钮：向上移动");
    }
};

document.getElementById('downButton').onclick = function() {
    if (game.over) return;
    if (snake.dy === 0) {
        snake.dy = SNAKE_BLOCK;
        snake.dx = 0;
        console.log("按钮：向下移动");
    }
};

// 检测碰撞
function checkCollision() {
    // 检测墙壁碰撞
    if (snake.x >= WIDTH || snake.x < 0 || snake.y >= HEIGHT || snake.y < 0) {
        console.log("墙壁碰撞");
        return true;
    }
    
    // 检测自身碰撞
    for (let i = 0; i < snake.body.length - 1; i++) {
        if (snake.body[i].x === snake.x && snake.body[i].y === snake.y) {
            console.log("自身碰撞");
            return true;
        }
    }
    
    return false;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // 绘制食物
    ctx.fillStyle = COLORS.RED;
    ctx.fillRect(food.x, food.y, SNAKE_BLOCK, SNAKE_BLOCK);
    
    // 绘制蛇身
    for (let i = 0; i < snake.body.length; i++) {
        // 计算渐变颜色
        const alpha = 1 - (i / snake.body.length) * 0.7;
        const r = 0;
        const g = 255;
        const b = 0;
        
        // 绘制外部
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(snake.body[i].x, snake.body[i].y, SNAKE_BLOCK, SNAKE_BLOCK);
        
        // 绘制内部（类似原始代码中的黑色内部）
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(
            snake.body[i].x + 2, 
            snake.body[i].y + 2, 
            SNAKE_BLOCK - 4, 
            SNAKE_BLOCK - 4
        );
    }
}

// 更新游戏状态
function update() {
    // 如果蛇没有移动（游戏开始时），不更新位置
    if (snake.dx === 0 && snake.dy === 0) {
        return;
    }
    
    // 更新蛇的位置
    snake.x += snake.dx;
    snake.y += snake.dy;
    console.log("蛇的位置:", snake.x, snake.y);
    
    // 检测碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 添加新的头部
    snake.body.push({x: snake.x, y: snake.y});
    
    // 如果吃到食物，增加长度和分数
    if (snake.x === food.x && snake.y === food.y) {
        snake.length++;
        game.score++;
        document.getElementById('score').textContent = game.score;
        console.log("吃到食物，得分:", game.score);
        generateFood();
    }
    
    // 保持蛇的长度
    while (snake.body.length > snake.length) {
        snake.body.shift();
    }
}

// 游戏主循环
function gameLoop() {
    update();
    draw();
}

// 游戏结束
function gameOver() {
    game.over = true;
    clearInterval(game.timer);
    document.getElementById('finalScore').textContent = game.score;
    document.getElementById('gameOver').style.display = 'block';
    console.log("游戏结束，最终得分:", game.score);
}

// 重新开始按钮事件
document.getElementById('restartButton').onclick = function() {
    console.log("重新开始游戏");
    initGame();
};

// 初始化游戏
window.onload = initGame;
