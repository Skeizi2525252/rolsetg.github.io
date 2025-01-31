let tg = window.Telegram.WebApp;
tg.expand();

// Инициализация темы
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);

// Получаем элементы
const balanceElement = document.getElementById('userBalance');
const depositButton = document.getElementById('depositButton');
const transactionList = document.getElementById('transactionList');

// Демо-данные для транзакций
const demoTransactions = [
    { type: 'Пополнение', amount: 1000, date: '2024-03-20 15:30', status: 'positive' },
    { type: 'Вывод', amount: -500, date: '2024-03-19 12:45', status: 'negative' },
    { type: 'Выигрыш', amount: 750, date: '2024-03-18 18:20', status: 'positive' }
];

// Функция для форматирования суммы
function formatAmount(amount) {
    return amount.toFixed(2) + ' USDT';
}

// Функция для добавления транзакции в список
function addTransaction(transaction) {
    const transactionElement = document.createElement('div');
    transactionElement.className = 'transaction-item';
    
    transactionElement.innerHTML = `
        <div class="transaction-info">
            <span class="transaction-type">${transaction.type}</span>
            <span class="transaction-date">${transaction.date}</span>
        </div>
        <span class="transaction-amount ${transaction.status}">
            ${transaction.status === 'positive' ? '+' : ''}${formatAmount(transaction.amount)}
        </span>
    `;
    
    transactionList.appendChild(transactionElement);
}

// Загружаем демо-транзакции
demoTransactions.forEach(addTransaction);

// Обработчик нажатия на кнопку пополнения
depositButton.addEventListener('click', () => {
    tg.sendData(JSON.stringify({
        action: 'deposit',
        user_id: tg.initDataUnsafe?.user?.id
    }));
});

// Обновляем баланс (демо)
balanceElement.textContent = formatAmount(1250.00); 