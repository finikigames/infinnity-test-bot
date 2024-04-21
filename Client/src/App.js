import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        // Обработка события при получении данных от сервера
        socket.on('updateData', (data) => {
            setSessions(data.sessions);
        });

        // Запрос на получение данных с сервера
        socket.emit('getData');

        return () => {
            socket.off('updateData');
        };
    }, []);

    return (
        <div>
            <h1>Сессии</h1>
            <table border="1">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Имя пользователя</th>
                    <th>Имя отображаемое</th>
                    <th>Состояние</th>
                    <th>Текущий ID</th>
                    <th>Результат</th>
                </tr>
                </thead>
                <tbody>
                {sessions.map((session) => (
                    <tr key={session.id}>
                        <td>{session.id}</td>
                        <td>{session.data.userName}</td>
                        <td>{session.data.displayName}</td>
                        <td>
                            <ul>
                                {Object.entries(session.data.state).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        </td>
                        <td>{session.data.currentId}</td>
                        <td>{session.data.state.result}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;