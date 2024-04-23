const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Чтение JSON файла при запуске сервера
let sessionsData = JSON.parse(fs.readFileSync('/app/Database/game_db.json', 'utf-8'));

// Роут для отправки данных
app.get('/data', (req, res) => {
    // Чтение JSON файла
    const jsonData = JSON.parse(fs.readFileSync('/app/Database/game_db.json', 'utf-8')).sessions;

    // Добавление общего количества записей
    const totalCount = jsonData.length;

    // Формирование HTML таблицы
    let tableHtml = '<table border="1">';
    tableHtml += `<tbody><tr>Общее количество записей: ${totalCount}</tr>`;

    tableHtml += '<thead><tr><th>ID</th><th>Имя пользователя</th><th>Имя отображаемое</th><th>Состояние</th><th>Текущий ID</th><th>Результат</th></tr></thead>';
    tableHtml += '<tbody>';

    if (Array.isArray(jsonData)) {
        jsonData.forEach((session) => {
            const user = session.data[Object.keys(session.data)[0]];
            tableHtml += '<tr>';
            tableHtml += `<td>${session.id}</td>`;
            tableHtml += `<td>${user.userName}</td>`;
            tableHtml += `<td>${user.displayName}</td>`;
            tableHtml += '<td><ul>';
            const state = user.state;
            Object.keys(state).forEach((key) => {
                tableHtml += `<li>${key}: ${state[key]}</li>`;
            });
            tableHtml += '</ul></td>';
            tableHtml += `<td>${user.currentId}</td>`;
            tableHtml += `<td>${user.state.result}</td>`;
            tableHtml += '</tr>';
        });
    }

    tableHtml += '</tbody></table>';
    res.send(tableHtml);
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

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});