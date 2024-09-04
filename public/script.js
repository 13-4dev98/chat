const socket = io();

// Запрашиваем имя пользователя при подключении
let username = '';

function promptUsername() {
    username = prompt("Enter your username:");
    if (!username) {
        promptUsername(); // Повторяем запрос, если имя не введено
    } else {
        socket.emit('set username', username); // Отправляем имя пользователя на сервер
    }
}

promptUsername(); // Инициализируем запрос имени

// Обновляем список пользователей при подключении
socket.on('user connected', function(users) {
    const userList = document.querySelector('.user-list');
    userList.innerHTML = ''; // Очищаем список

    users.forEach(user => {
        let userElement = document.createElement('div');
        userElement.className = 'user';
        userElement.textContent = `> ${user}`;
        userList.appendChild(userElement);
    });
});

// Обновляем список пользователей при отключении
socket.on('user disconnected', function(users) {
    const userList = document.querySelector('.user-list');
    userList.innerHTML = ''; // Очищаем список

    users.forEach(user => {
        let userElement = document.createElement('div');
        userElement.className = 'user';
        userElement.textContent = `> ${user}`;
        userList.appendChild(userElement);
    });
});

// Отправка сообщения по нажатию Enter
document.querySelector('input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Отправка сообщения по нажатию на кнопку "Send"
document.getElementById('send-button').addEventListener('click', function () {
    sendMessage();
});

// Функция отправки сообщения
function sendMessage() {
    let input = document.querySelector('input');
    let message = input.value.trim();
    if (message !== "") {
        socket.emit('chat message', message);
        input.value = "";
    }
}

// Получение сообщения
socket.on('chat message', function(data) {
    let chatWindow = document.querySelector('.chat-window');
    let newMessage = document.createElement('div');
    newMessage.className = 'message';
    newMessage.textContent = `${data.user}: ${data.message}`;
    chatWindow.appendChild(newMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
