import 'dotenv/config';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';

// Загружаем токен и ID из .env
const TG_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

// Файл состояния
const NEXT_RUN_FILE = './nextRun.json';

// Клавиатура с кнопками погнали/перерыв
const replyKeyboard = {
  reply_markup: {
    keyboard: [[{ text: 'Погнали!' }, { text: 'Перерыв' }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

// Создаём бота с polling
export const bot = new TelegramBot(TG_TOKEN, { polling: true });

// --- Работа с состоянием (тот же формат, что в scheduler.js) ---

function loadState() {
  if (!fs.existsSync(NEXT_RUN_FILE)) {
    return { nextRun: null, active: true };
  }

  try {
    const raw = fs.readFileSync(NEXT_RUN_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return {
      nextRun: data.nextRun ? new Date(data.nextRun) : null,
      active: data.active !== false,
    };
  } catch (e) {
    console.error('Error reading nextRun.json in bot, using default values:', e.message);
    return { nextRun: null, active: true };
  }
}

function saveState({ nextRun, active }) {
  const payload = {
    nextRun: nextRun ? new Date(nextRun).toISOString() : null,
    active: Boolean(active),
  };

  fs.writeFileSync(NEXT_RUN_FILE, JSON.stringify(payload, null, 2));
}

// --- Обработчики команд/кнопок ---

// /start — просто показать клавиатуру и текущее состояние
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id.toString();
  if (chatId !== CHAT_ID) return;

  const state = loadState();
  const statusText = state.active ? 'в деле' : 'не при делах';

  await bot.sendMessage(
    chatId,
    `Сейчас я ${statusText}. Используй кнопки.`,
    replyKeyboard,
  );
});

// Обработка всех сообщений (кнопки отправляют обычный текст)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  if (chatId !== CHAT_ID) return;

  const text = (msg.text || '').trim().toLowerCase();

  if (text === 'перерыв') {
    const state = loadState();
    if (!state.active) {
      await bot.sendMessage(chatId, 'Уже остановлен 💤', replyKeyboard);
      return;
    }

    // Здесь сброс nextRun в null и установка active в false
    saveState({ nextRun: null, active: false });
    await bot.sendMessage(chatId, 'Понял. Отдыхаем... 😴', replyKeyboard);
  }

  if (text === 'погнали!') {
    const state = loadState();
    if (state.active) {
      await bot.sendMessage(chatId, 'Да-да, я внимательно слежу за новыми анонсами 👀', replyKeyboard);
      return;
    }

    saveState({ ...state, active: true });
    await bot.sendMessage(chatId, 'Снова в деле! 🚀 Ищу анонсы и записываю на игры 🏐', replyKeyboard);
  }
});


// --- Отправка сообщений из кода ---

/**
 * Отправляет сообщение в Telegram
 * @param {string} message - текст сообщения
 */
export async function sendTgMessage(message) {
  try {
    await bot.sendMessage(CHAT_ID, message, replyKeyboard);
    console.log(`[${now.toLocaleString('ru-RU')}] 📨 Message sent in Telegram: ${message}`);
  } catch (error) {
    console.error(`[${now.toLocaleString('ru-RU')}] ❌ Error during send in Telegram: ${error.message}`);
  }
}
