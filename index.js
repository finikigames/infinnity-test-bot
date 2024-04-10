const TelegramBot = require('node-telegram-bot-api');

// Токен вашего бота
const token = process.env.BOT_TOKEN;

// Создание бота
const bot = new TelegramBot(token, {polling: true});

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