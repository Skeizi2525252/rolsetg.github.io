let tg = window.Telegram.WebApp;
tg.expand();

// Получаем элементы
const balanceElement = document.getElementById('userBalance');
const depositButton = document.getElementById('depositButton');
const betsList = document.getElementById('betsList');
const gameInterface = document.getElementById('gameInterface');
const gameContent = document.getElementById('gameContent');
const currentGameTitle = document.getElementById('currentGameTitle');
const backButton = document.getElementById('backButton');
const betAmount = document.getElementById('betAmount');
const playButton = document.getElementById('playButton');

// Инициализация игр
const games = {
    dice: {
        title: 'Dice',
        minBet: 1,
        maxBet: 1000000,
        render: () => {
            gameContent.innerHTML = `
                <div class="dice-game">
                    <div class="dice-result" id="diceResult">🎲</div>
                    <div class="multiplier">
                        <input type="number" id="targetMultiplier" min="1.01" max="100" value="2" step="0.01">
                        <span>x</span>
                    </div>
                </div>
            `;
        },
        play: async () => {
            const amount = parseFloat(betAmount.value);
            const multiplier = parseFloat(document.getElementById('targetMultiplier').value);
            
            const result = await sendGameAction('dice', {
                bet: amount,
                multiplier: multiplier
            });
            
            if (result.success) {
                showGameResult(result);
            }
        }
    },
    mines: {
        title: 'Mines',
        minBet: 1,
        maxBet: 1000000,
        render: () => {
            const grid = Array(25).fill(null).map((_, i) => 
                `<div class="mine-cell" data-index="${i}">?</div>`
            ).join('');
            
            gameContent.innerHTML = `
                <div class="mines-game">
                    <div class="mines-grid">${grid}</div>
                    <div class="mines-controls">
                        <select id="minesCount">
                            <option value="3">3 мины</option>
                            <option value="5">5 мин</option>
                            <option value="10">10 мин</option>
                            <option value="15">15 мин</option>
                        </select>
                        <button id="cashoutButton" disabled>Забрать ${0} USDT</button>
                    </div>
                </div>
            `;
            
            // Добавляем обработчики для ячеек
            document.querySelectorAll('.mine-cell').forEach(cell => {
                cell.addEventListener('click', () => handleMineClick(cell));
            });
        },
        play: async () => {
            const amount = parseFloat(betAmount.value);
            const mines = parseInt(document.getElementById('minesCount').value);
            
            const result = await sendGameAction('mines', {
                bet: amount,
                mines: mines
            });
            
            if (result.success) {
                startMinesGame(result);
            }
        }
    },
    tower: {
        title: 'Tower',
        minBet: 1,
        maxBet: 1000000,
        render: () => {
            const levels = Array(10).fill(null).map((_, i) => `
                <div class="tower-level" data-level="${9-i}">
                    <div class="tower-cell" data-position="0">?</div>
                    <div class="tower-cell" data-position="1">?</div>
                    <div class="tower-cell" data-position="2">?</div>
                </div>
            `).join('');
            
            gameContent.innerHTML = `
                <div class="tower-game">
                    <div class="tower-grid">${levels}</div>
                    <button id="cashoutButton" disabled>Забрать ${0} USDT</button>
                </div>
            `;
            
            // Добавляем обработчики для ячеек
            document.querySelectorAll('.tower-cell').forEach(cell => {
                cell.addEventListener('click', () => handleTowerClick(cell));
            });
        },
        play: async () => {
            const amount = parseFloat(betAmount.value);
            
            const result = await sendGameAction('tower', {
                bet: amount
            });
            
            if (result.success) {
                startTowerGame(result);
            }
        }
    }
};

// Функция для отправки игровых действий
async function sendGameAction(game, data) {
    try {
        const response = await fetch(`https://api.rolse.tg/play`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                game: game,
                user_id: tg.initDataUnsafe?.user?.id,
                ...data
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error playing game:', error);
        return { success: false, error: 'Network error' };
    }
}

// Функция для показа результата игры
function showGameResult(result) {
    if (result.type === 'win') {
        gameContent.classList.add('win-animation');
        updateBalance(result.balance);
        addBet({
            game: currentGameTitle.textContent,
            amount: result.bet,
            win: result.win,
            timestamp: Date.now() / 1000
        });
    }
    
    setTimeout(() => {
        gameContent.classList.remove('win-animation');
    }, 500);
}

// Функция для обновления баланса
function updateBalance(balance) {
    balanceElement.textContent = formatAmount(balance);
    balanceElement.classList.add('updated');
    setTimeout(() => {
        balanceElement.classList.remove('updated');
    }, 300);
}

// Функция для форматирования суммы
function formatAmount(amount) {
    return amount.toFixed(2) + ' USDT';
}

// Функция для добавления ставки в историю
function addBet(bet) {
    const betElement = document.createElement('div');
    betElement.className = 'bet-item';
    
    betElement.innerHTML = `
        <div class="bet-info">
            <span class="bet-game">${bet.game}</span>
            <span class="bet-time">${new Date(bet.timestamp * 1000).toLocaleTimeString()}</span>
        </div>
        <span class="bet-amount ${bet.win > 0 ? 'positive' : 'negative'}">
            ${bet.win > 0 ? '+' : ''}${formatAmount(bet.win)}
        </span>
    `;
    
    betsList.insertBefore(betElement, betsList.firstChild);
    
    if (betsList.children.length > 50) {
        betsList.lastChild.remove();
    }
}

// Обработчики событий
document.getElementById('diceGame').addEventListener('click', () => showGame('dice'));
document.getElementById('minesGame').addEventListener('click', () => showGame('mines'));
document.getElementById('towerGame').addEventListener('click', () => showGame('tower'));

backButton.addEventListener('click', () => {
    gameInterface.classList.add('hidden');
});

depositButton.addEventListener('click', () => {
    tg.sendData(JSON.stringify({
        action: 'deposit',
        user_id: tg.initDataUnsafe?.user?.id
    }));
});

playButton.addEventListener('click', () => {
    const currentGame = games[currentGameTitle.textContent.toLowerCase()];
    if (currentGame) {
        currentGame.play();
    }
});

// Функция для показа игры
function showGame(gameType) {
    const game = games[gameType];
    if (game) {
        currentGameTitle.textContent = game.title;
        gameInterface.classList.remove('hidden');
        game.render();
        
        // Устанавливаем ограничения ставок
        betAmount.min = game.minBet;
        betAmount.max = game.maxBet;
        betAmount.value = game.minBet;
    }
}

// Загружаем начальные данные
async function loadInitialData() {
    try {
        const response = await fetch(`https://api.rolse.tg/user?id=${tg.initDataUnsafe?.user?.id}`);
        const data = await response.json();
        
        if (data.success) {
            updateBalance(data.balance);
            data.bets.forEach(addBet);
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

loadInitialData();
