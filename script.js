if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let gameMode = 'pvp';

const statusText = document.getElementById('status');
const cells = document.querySelectorAll('.cell');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
}

function startGame(mode) {
    gameMode = mode;
    resetGame();
    showPage('game');
}

function handleCellClick(e) {
    const idx = e.target.getAttribute('data-index');
    if (gameState[idx] !== "" || !gameActive) return;

    executeMove(idx, currentPlayer);

    if (gameActive && gameMode !== 'pvp') {
        gameActive = false; 
        setTimeout(() => {
            aiMove();
            if (gameActive && !checkWinnerForMinimax(gameState)) {
                gameActive = true;
            }
        }, 600);
    }
}

function executeMove(idx, player) {
    gameState[idx] = player;
    const cell = cells[idx];
    cell.textContent = player;
    
    const color = player === "X" ? "var(--neon-blue)" : "var(--neon-pink)";
    cell.style.color = color;
    cell.style.textShadow = `0 0 15px ${color}`;
    cell.style.borderColor = color;

    if (checkResult()) return;

    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s Turn`;
    statusText.className = (currentPlayer === "X") ? "neon-text-blue" : "neon-text-pink";
}

function aiMove() {
    let move;
    if (gameMode === 'easy') {
        const avail = gameState.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        move = avail[Math.floor(Math.random() * avail.length)];
    } else {
        move = getBestMove();
    }
    
    if (move !== null) {
        gameActive = true;
        executeMove(move, "O");
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === "") {
            gameState[i] = "O";
            let score = minimax(gameState, 0, false);
            gameState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

const scores = { O: 10, X: -10, draw: 0 };

function minimax(board, depth, isMax) {
    let res = checkWinnerForMinimax(board);
    if (res !== null) return scores[res];

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = "";
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "X";
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = "";
            }
        }
        return best;
    }
}

function checkResult() {
    let winner = checkWinnerForMinimax(gameState);
    if (winner) {
        gameActive = false;
        statusText.textContent = winner === "draw" ? "SYSTEM DRAW" : `PLAYER ${winner} WINS!`;
        return true;
    }
    return false;
}

function checkWinnerForMinimax(b) {
    const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let p of w) {
        if (b[p[0]] && b[p[0]] === b[p[1]] && b[p[0]] === b[p[2]]) return b[p[0]];
    }
    return !b.includes("") ? "draw" : null;
}

function resetGame() {
    gameState = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    statusText.textContent = "Player X's Turn";
    statusText.className = "neon-text-blue";
    cells.forEach(c => {
        c.textContent = "";
        c.style.textShadow = "none";
        c.style.borderColor = "#222";
    });
}

cells.forEach(c => c.addEventListener('click', handleCellClick));
