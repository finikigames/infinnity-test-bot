const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');

// Токен вашего бота
const token = "7029767434:AAE8JBFLQaPdP4kerhSRuNbc8TdvhpqeWo0";
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

// Создание бота
const bot = new TelegramBot(token, {polling: true});

var db;

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Я бот для проведения тестирования. Давай начнем тест.', {
    reply_markup: {
      keyboard: [['Вопрос 1'], ['Вопрос 2']],
      one_time_keyboard: true
    }
  });
});

// Обработчик текстовых сообщений с вопросами
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  
  if (messageText === 'Вопрос 1') {
    bot.sendMessage(chatId, 'Ваш ответ на вопрос 1');
  } else if (messageText === 'Вопрос 2') {
    bot.sendMessage(chatId, 'Ваш ответ на вопрос 2');
  } else {
    bot.sendMessage(chatId, 'Пожалуйста, используйте кнопки для ответа на вопросы.');
  }
});

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    db = client.db(dbName);
  
    return 'done.';
  }
  
  main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());