import schedule from 'node-schedule';
import fs from 'fs';
import { main } from './index.js';
import { getNextRunDate } from './nextRun.js';

// Файл для хранения состояния
const NEXT_RUN_FILE = './nextRun.json';

// Загружаем состояние: { nextRun: Date | null, active: boolean }
function loadState() {
  if (!fs.existsSync(NEXT_RUN_FILE)) {
    return { nextRun: null, active: true };
  }

  try {
    const raw = fs.readFileSync(NEXT_RUN_FILE, 'utf-8');
    const data = JSON.parse(raw);

    return {
      nextRun: data.nextRun ? new Date(data.nextRun) : null,
      // если поля active нет или оно не false — считаем активным
      active: data.active !== false,
    };
  } catch (e) {
    console.error('Error reading nextRun.json, using defaults:', e.message);
    return { nextRun: null, active: true };
  }
}

// Сохраняем состояние
function saveState({ nextRun, active }) {
  const payload = {
    nextRun: nextRun ? nextRun.toISOString() : null,
    active: Boolean(active),
  };

  fs.writeFileSync(NEXT_RUN_FILE, JSON.stringify(payload, null, 2));
}

// Хелпер: обновить только nextRun, не трогая active
function saveNextRun(date) {
  const state = loadState();
  const newState = { ...state, nextRun: date };
  saveState(newState);

  console.log(
    `[${new Date().toLocaleString('ru-RU')}] 💤 Next run scheduled for ${date.toLocaleString('ru-RU')}`,
  );
}

// Основной запуск проверки волейбола (однократный)
async function runVolleyballCheck() {
  const state = loadState();

  // Если мониторинг выключен — ничего не делаем
  if (!state.active) {
    console.log(
      `[${new Date().toLocaleString('ru-RU')}] ⏸ Monitoring is inactive, skipping check`,
    );
    return;
  }

  const now = new Date();
  console.log(`[${now.toLocaleString('ru-RU')}] Running volleyball check...`);

  const status = await main();

  if (status === 'SIGNED' || status === 'ALREADY') {
    // Вычисляем следующую дату запуска
    const nextRunDate = getNextRunDate();
    saveNextRun(nextRunDate);
    console.log(
      `[${now.toLocaleString('ru-RU')}] ✅ Player is signed. Sleeping until ${nextRunDate.toLocaleString('ru-RU')}`,
    );
  }
}

// --- Инициализация расписания при старте процесса ---

const { nextRun, active } = loadState();
const now = new Date();

if (!active) {
  console.log(
    `[${now.toLocaleString('ru-RU')}] ⏸ Monitoring is stopped by user. Scheduler is not started.`,
  );
} else if (nextRun && nextRun > now) {
  console.log(
    `[${now.toLocaleString('ru-RU')}] 😴 Sleeping until ${nextRun.toLocaleString(
      'ru-RU',
    )} (already signed)`,
  );
} else {
  console.log(`[${now.toLocaleString('ru-RU')}] 🏐 Volleyball watcher started...`);
}

// Запускаем задачу по расписанию — каждые 3 минуты с 6:00 до 23:59
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [1, 4, 6]; // Понедельник, четверг, суббота
rule.hour = new schedule.Range(6, 23);
rule.minute = new schedule.Range(0, 59, 3);

schedule.scheduleJob(rule, async () => {
  const state = loadState();

  // Если мониторинг выключен — просто выходим
  if (!state.active) {
    return;
  }

  // Если ещё «спим» до nextRun — тоже выходим
  if (state.nextRun && state.nextRun > new Date()) {
    return;
  }

  await runVolleyballCheck();
});
