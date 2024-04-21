const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Чтение JSON файла при запуске сервера
let sessionsData = JSON.parse(fs.readFileSync('../game_db.json', 'utf-8'));

// Роут для отправки данных
app.get('/data', (req, res) => {
    res.json(sessionsData);
});

// Роут для обновления данных
app.post('/update', (req, res) => {
    // Ваша логика обновления данных в файле
    // Например, можно просто прочитать файл, обновить данные и перезаписать файл
    sessionsData = JSON.parse(fs.readFileSync('../game_db.json', 'utf-8'));
    res.send('Data updated');
    // Отправить обновленные данные клиентам
    io.emit('updateData', sessionsData);
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Обработка события получения данных от клиента
    socket.on('getData', () => {
        socket.emit('updateData', sessionsData);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});