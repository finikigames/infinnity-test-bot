const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
const io = require('socket.io');
const nocache = require('nocache');

// Порт, на котором будет работать сервер
const PORT = 8080;

// Путь к JSON-файлу
const JSON_FILE_PATH = './game_db.json';

// Функция для отправки JSON-данных клиенту
function sendJSONData(response) {
    fs.readFile(JSON_FILE_PATH, (err, data) => {
        if (err) {
            response.writeHead(500, {'Content-Type': 'text/plain', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': 0 });
            response.end('Internal Server Error');
            console.error('Error reading JSON file:', err);
            return;
        }
        response.writeHead(200, {'Content-Type': 'text/html', 'Cache-Control': 'no-cache','Pragma': 'no-cache', 'Expires': 0, 'Surrogate-Control': 'no-store'});
        var html = WriteFile(response)
        response.end(html);
    });
}
// Создание HTTP-сервера
const server = http.createServer((request, response) => {
    if (request.url === '/data') {
        sendJSONData(response);
    } else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Not Found');
    }
});

var serverSocket = new Server(server);

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Отслеживание изменений в JSON-файле
fs.watchFile(JSON_FILE_PATH, (curr, prev) => {
    console.log('JSON file changed');
});

function WriteFile() {
    const data = require("./game_db.json");
    let html = ` <html>
<head>
<title>JSON to HTML</title>

<code>
</code>
</head>
<body>
<table border=\"1\">
<tr>
    <th>ID</th>
    <th>State</th>
    <th>Current ID</th>
    <th>User Name</th>
    <th>Display Name</th>
</tr>`;

    data
        .sessions
        .forEach(session => {
            html += ` <tr>
                <td>${session.id}</td>
                <td>${JSON.stringify(session.data)}</td>
              </tr>`;
        });
    html += `
</table>
</body>
</html>`;

    return html;
}