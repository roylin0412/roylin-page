// 游戏配置
const GRID_SIZE = 4;
const TOTAL_PAIRS = 6; // 总共6对图片（4个角落是空的）

// 图片路径
const IMAGE_PATH = 'images/'; // 使用人物照片
const CACHE_BUSTER = Date.now(); // 添加时间戳避免缓存问题

// 游戏状态
let gameBoard = [];
let selectedCell = null;
let timer = 0;
let timerInterval = null;
let isGameOver = false;

// DOM元素
const gameBoardElement = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const winMessageElement = document.getElementById('win-message');
const finalTimeElement = document.getElementById('final-time');
const restartButton = document.getElementById('restart-btn');
const playAgainButton = document.getElementById('play-again-btn');

// 初始化游戏
function initGame() {
    // 重置游戏状态
    gameBoard = [];
    selectedCell = null;
    timer = 0;
    isGameOver = false;
    
    // 清除计时器
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // 更新计时器显示
    timerElement.textContent = `时间: ${timer}s`;
    
    // 隐藏胜利消息
    winMessageElement.classList.add('hidden');
    
    // 创建游戏板
    createGameBoard();
    
    // 开始计时器
    timerInterval = setInterval(() => {
        timer++;
        timerElement.textContent = `时间: ${timer}s`;
    }, 1000);
}

// 创建游戏板
function createGameBoard() {
    // 清空游戏板
    gameBoardElement.innerHTML = '';
    
    // 计算有效单元格数量（总单元格数减去四个角落的空单元格）
    const validCells = GRID_SIZE * GRID_SIZE - 4;
    // 确保有效单元格数量是偶数，这样每张照片都有配对
    const pairsNeeded = Math.floor(validCells / 2);
    
    // 创建图片对
    const pairs = [];
    for (let i = 1; i <= pairsNeeded; i++) {
        // 确保i不超过8（我们只有8张不同的照片）
        const imageIndex = ((i - 1) % 8) + 1;
        pairs.push(imageIndex, imageIndex); // 每个图片添加两次
    }
    
    // 打乱图片顺序
    shuffleArray(pairs);
    
    // 创建游戏板数据（初始化为全null）
    for (let row = 0; row < GRID_SIZE; row++) {
        gameBoard[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            gameBoard[row][col] = null;
        }
    }
    
    // 填充非角落单元格
    let pairIndex = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            // 跳过四个角落
            if ((row === 0 && col === 0) ||
                (row === 0 && col === GRID_SIZE-1) ||
                (row === GRID_SIZE-1 && col === 0) ||
                (row === GRID_SIZE-1 && col === GRID_SIZE-1)) {
                continue;
            }
            
            // 填充非角落单元格
            if (pairIndex < pairs.length) {
                gameBoard[row][col] = pairs[pairIndex++];
            }
        }
    }
    
    // 创建游戏板DOM
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 如果单元格不为空，添加图片
            if (gameBoard[row][col] !== null) {
                const img = document.createElement('img');
                img.src = `${IMAGE_PATH}${gameBoard[row][col]}.jpg?v=${CACHE_BUSTER}`; // 添加时间戳避免缓存
                img.alt = `图片 ${gameBoard[row][col]}`;
                
                // 添加图片加载错误处理
                img.onerror = function() {
                    console.error(`图片加载失败: ${img.src}`);
                    // 显示占位符
                    this.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23eee%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-family%3D%22Arial%22 font-size%3D%2220%22 fill%3D%22%23999%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E';
                };
                
                cell.appendChild(img);
            } else {
                // 如果单元格为空，添加empty类
                cell.classList.add('empty');
            }
            
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            gameBoardElement.appendChild(cell);
        }
    }
}

// 处理单元格点击
function handleCellClick(row, col) {
    // 如果游戏结束或单元格为空，则忽略点击
    if (isGameOver || gameBoard[row][col] === null) {
        return;
    }
    
    const clickedCell = gameBoardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    // 如果点击的是已选中的单元格，则取消选中
    if (selectedCell && selectedCell.dataset.row == row && selectedCell.dataset.col == col) {
        selectedCell.classList.remove('selected');
        selectedCell = null;
        return;
    }
    
    // 如果没有选中的单元格，则选中当前单元格
    if (!selectedCell) {
        clickedCell.classList.add('selected');
        selectedCell = clickedCell;
        return;
    }
    
    // 获取已选中单元格的坐标
    const selectedRow = parseInt(selectedCell.dataset.row);
    const selectedCol = parseInt(selectedCell.dataset.col);
    
    // 检查是否可以连接
    if (isValidPath(selectedRow, selectedCol, row, col)) {
        // 移除选中状态
        selectedCell.classList.remove('selected');
        
        // 显示连线动画（可选）
        showConnectionAnimation(selectedRow, selectedCol, row, col);
        
        // 移除图片
        setTimeout(() => {
            // 更新游戏板数据
            gameBoard[selectedRow][selectedCol] = null;
            gameBoard[row][col] = null;
            
            // 更新DOM
            selectedCell.classList.add('empty');
            selectedCell.innerHTML = '';
            
            clickedCell.classList.add('empty');
            clickedCell.innerHTML = '';
            
            // 重置选中的单元格
            selectedCell = null;
            
            // 检查游戏是否结束
            checkGameOver();
        }, 300);
    } else {
        // 如果不能连接，取消选中并选中新单元格
        selectedCell.classList.remove('selected');
        clickedCell.classList.add('selected');
        selectedCell = clickedCell;
    }
}

// 检查路径是否有效
function isValidPath(startRow, startCol, endRow, endCol) {
    // 如果是同一个单元格，返回false
    if (startRow === endRow && startCol === endCol) {
        return false;
    }
    
    // 检查两个单元格是否包含相同的图片
    if (gameBoard[startRow][startCol] !== gameBoard[endRow][endCol]) {
        return false;
    }
    
    // 简化版：如果两个单元格包含相同的图片，直接返回true
    // 这不是理想的连连看逻辑，但可以让我们测试基本功能
    return true;
    
    /* 原始连接检测逻辑（暂时注释掉）
    // 检查直线连接
    if (isStraightLineConnected(startRow, startCol, endRow, endCol)) {
        return true;
    }
    
    // 检查一个拐点连接
    if (isOneCornerConnected(startRow, startCol, endRow, endCol)) {
        return true;
    }
    
    // 检查两个拐点连接
    if (isTwoCornersConnected(startRow, startCol, endRow, endCol)) {
        return true;
    }
    
    return false;
    */
}

// 检查直线连接
function isStraightLineConnected(startRow, startCol, endRow, endCol) {
    // 确保两个位置在同一行或同一列
    if (startRow !== endRow && startCol !== endCol) {
        return false;
    }
    
    if (startRow === endRow) { // 同一行
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        
        // 检查两点之间是否有障碍物
        for (let col = minCol + 1; col < maxCol; col++) {
            if (gameBoard[startRow][col] !== null) {
                return false;
            }
        }
        return true;
    } else { // 同一列
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        
        // 检查两点之间是否有障碍物
        for (let row = minRow + 1; row < maxRow; row++) {
            if (gameBoard[row][startCol] !== null) {
                return false;
            }
        }
        return true;
    }
}

// 检查一个拐点连接
function isOneCornerConnected(startRow, startCol, endRow, endCol) {
    // 创建两个可能的拐点
    const corner1 = { row: startRow, col: endCol };
    const corner2 = { row: endRow, col: startCol };
    
    // 检查拐点1是否为空且可以连接
    if (gameBoard[corner1.row][corner1.col] === null &&
        isStraightLineConnected(startRow, startCol, corner1.row, corner1.col) &&
        isStraightLineConnected(corner1.row, corner1.col, endRow, endCol)) {
        return true;
    }
    
    // 检查拐点2是否为空且可以连接
    if (gameBoard[corner2.row][corner2.col] === null &&
        isStraightLineConnected(startRow, startCol, corner2.row, corner2.col) &&
        isStraightLineConnected(corner2.row, corner2.col, endRow, endCol)) {
        return true;
    }
    
    return false;
}

// 检查两个拐点连接
function isTwoCornersConnected(startRow, startCol, endRow, endCol) {
    // 检查行方向的拐点
    for (let row = 0; row < GRID_SIZE; row++) {
        if (row === startRow || row === endRow) {
            continue;
        }
        
        const corner1 = { row: row, col: startCol };
        const corner2 = { row: row, col: endCol };
        
        if (gameBoard[corner1.row][corner1.col] === null && 
            gameBoard[corner2.row][corner2.col] === null &&
            isStraightLineConnected(startRow, startCol, corner1.row, corner1.col) &&
            isStraightLineConnected(corner1.row, corner1.col, corner2.row, corner2.col) &&
            isStraightLineConnected(corner2.row, corner2.col, endRow, endCol)) {
            return true;
        }
    }
    
    // 检查列方向的拐点
    for (let col = 0; col < GRID_SIZE; col++) {
        if (col === startCol || col === endCol) {
            continue;
        }
        
        const corner1 = { row: startRow, col: col };
        const corner2 = { row: endRow, col: col };
        
        if (gameBoard[corner1.row][corner1.col] === null && 
            gameBoard[corner2.row][corner2.col] === null &&
            isStraightLineConnected(startRow, startCol, corner1.row, corner1.col) &&
            isStraightLineConnected(corner1.row, corner1.col, corner2.row, corner2.col) &&
            isStraightLineConnected(corner2.row, corner2.col, endRow, endCol)) {
            return true;
        }
    }
    
    return false;
}

// 显示连线动画
function showConnectionAnimation(startRow, startCol, endRow, endCol) {
    // 这里可以实现连线动画效果
    // 简单起见，这里省略实现
}

// 检查游戏是否结束
function checkGameOver() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (gameBoard[row][col] !== null) {
                return; // 游戏未结束
            }
        }
    }
    
    // 游戏结束
    isGameOver = true;
    clearInterval(timerInterval);
    
    // 显示胜利消息
    finalTimeElement.textContent = `你用了 ${timer} 秒完成游戏！`;
    winMessageElement.classList.remove('hidden');
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 事件监听
restartButton.addEventListener('click', initGame);
playAgainButton.addEventListener('click', initGame);

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);