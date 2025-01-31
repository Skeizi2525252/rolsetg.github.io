let tg = window.Telegram.WebApp;
tg.expand();

// Инициализация темы
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#0a0a0a');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-button-color', '#8b5cf6');
document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');

// Получаем элементы
const balanceElement = document.getElementById('userBalance');
const depositButton = document.getElementById('depositButton');
const transactionList = document.getElementById('transactionList');

// Функция для форматирования суммы
function formatAmount(amount) {
    return amount.toFixed(2) + ' USDT';
}

// Функция для форматирования даты
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Функция для добавления транзакции в список
function addTransaction(transaction) {
    const transactionElement = document.createElement('div');
    transactionElement.className = 'transaction-item new';
    
    let type = 'Неизвестно';
    let status = transaction.amount > 0 ? 'positive' : 'negative';
    
    switch(transaction.type) {
        case 'deposit':
            type = 'Пополнение';
            break;
        case 'withdrawal':
            type = 'Вывод';
            break;
        case 'win':
            type = 'Выигрыш';
            break;
        case 'loss':
            type = 'Проигрыш';
            break;
        case 'bonus':
            type = 'Бонус';
            break;
    }
    
    transactionElement.innerHTML = `
        <div class="transaction-info">
            <span class="transaction-type">${type}</span>
            <span class="transaction-date">${formatDate(transaction.timestamp)}</span>
        </div>
        <span class="transaction-amount ${status}">
            ${status === 'positive' ? '+' : ''}${formatAmount(Math.abs(transaction.amount))}
        </span>
    `;
    
    transactionList.insertBefore(transactionElement, transactionList.firstChild);
    
    // Удаляем класс new после анимации
    setTimeout(() => {
        transactionElement.classList.remove('new');
    }, 300);
}

// Функция для обновления баланса
function updateBalance(balance) {
    balanceElement.textContent = formatAmount(balance);
    
    // Добавляем анимацию
    balanceElement.style.animation = 'none';
    balanceElement.offsetHeight; // Trigger reflow
    balanceElement.style.animation = 'pulseGlow 0.5s ease-out';
}

// Функция для загрузки истории транзакций
async function loadTransactions() {
    try {
        const response = await fetch(`https://api.rolse.tg/transactions?user_id=${tg.initDataUnsafe?.user?.id}`);
        const data = await response.json();
        
        if (data.success) {
            transactionList.innerHTML = ''; // Очищаем список
            data.transactions.forEach(addTransaction);
            updateBalance(data.balance);
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Обработчик нажатия на кнопку пополнения
depositButton.addEventListener('click', () => {
    tg.sendData(JSON.stringify({
        action: 'deposit',
        user_id: tg.initDataUnsafe?.user?.id
    }));
});

// Обработчик сообщений от основного приложения
tg.onEvent('message', function(event) {
    const data = JSON.parse(event.data);
    
    if (data.type === 'balance_update') {
        updateBalance(data.balance);
    } else if (data.type === 'new_transaction') {
        addTransaction(data.transaction);
    }
});

// Загружаем начальные данные
loadTransactions();
