import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

// Загружаем токен и ID из .env
const TG_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

// Создаём бота
export const bot = new TelegramBot(TG_TOKEN, { polling: false });

/**
 * Отправляет сообщение в Telegram
 * @param {string} message - текст сообщения
 */
export async function sendTgMessage(message) {
  try {
    await bot.sendMessage(CHAT_ID, message);
    console.log('📨 Message sent in Telegram:', message);
  } catch (error) {
    console.error('❌ Error during send in Telegram:', error.message);
  }
}
