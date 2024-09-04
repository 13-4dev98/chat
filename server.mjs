import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Настройка базы данных
async function setupDatabase() {
    const adapter = new JSONFile('db.json');
    const db = new Low(adapter, { users: [], messages: [] });

    // Читаем данные из файла и инициализируем, если они не существуют
    await db.read();

    // Если данные отсутствуют (новый файл), инициализируем их по умолчанию
    db.data ||= { users: [], messages: [] };
    
    await db.write();

    return db;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', async (socket) => {
    console.log('a user connected');

    // Загружаем базу данных для каждого подключения
    const db = await setupDatabase();

    socket.on('set username', async (username) => {
        socket.username = username;

        // Добавляем пользователя в список и сохраняем
        db.data.users.push(username);
        await db.write();

        io.emit('user connected', db.data.users);
    });

    socket.on('chat message', async (msg) => {
        const messageData = { user: socket.username, message: msg };
        db.data.messages.push(messageData);
        await db.write();

        io.emit('chat message', messageData);
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected');

        // Удаляем пользователя из списка и сохраняем
        db.data.users = db.data.users.filter(user => user !== socket.username);
        await db.write();

        io.emit('user disconnected', db.data.users);
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('listening on *:3000');
});

