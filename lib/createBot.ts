import Telegraf = require('telegraf');
import LocalSession = require('telegraf-session-local');

export function createBot(token: string, db: string): Telegraf {
    token = '7029767434:AAE8JBFLQaPdP4kerhSRuNbc8TdvhpqeWo0';
    const bot = new Telegraf(token);

    if (!token) {
        throw new Error('Empty Telegram API token. Did you forget to add .env file with BOT_TOKEN =< your_token>?');
    }

    const localSession = new LocalSession({ database: db });
    bot.use(localSession.middleware());

    return bot;
}