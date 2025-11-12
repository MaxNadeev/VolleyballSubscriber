import schedule from 'node-schedule';
import fs from 'fs';
import { main } from './index.js';
import { getNextRunDate } from './nextRun.js';

// Файл для хранения даты следующего запуска
const NEXT_RUN_FILE = './nextRun.json';

// Загружаем сохранённое состояние
function loadNextRun() {
  if (!fs.existsSync(NEXT_RUN_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(NEXT_RUN_FILE, 'utf-8'));
    return new Date(data.nextRun);
  } catch {
    return null;
  }
}

// Сохраняем дату следующего запуска
function saveNextRun(date) {
  fs.writeFileSync(
    NEXT_RUN_FILE,
    JSON.stringify({ nextRun: date.toISOString() }, null, 2)
  );
  console.log(`[${new Date().toLocaleString('ru-RU')}] 💤 Next run scheduled for ${date.toLocaleString('ru-RU')}`);
}

async function runVolleyballCheck() {
  const now = new Date();
  console.log(`[${now.toLocaleString('ru-RU')}] Running volleyball check...`);

  const status = await main();

  if (status === 'SIGNED' || status === 'ALREADY') {
    // Вычисляем следующую дату запуска
    const nextRunDate = getNextRunDate();
    saveNextRun(nextRunDate);

    console.log(`[${now.toLocaleString('ru-RU')}] ✅ Player is signed. Sleeping until ${nextRunDate.toLocaleString('ru-RU')}`);
  }
}

// Проверяем, не нужно ли «спать»
const savedNextRun = loadNextRun();
const now = new Date();

if (savedNextRun && savedNextRun > new Date()) {
  console.log(`[${now.toLocaleString('ru-RU')}] 😴 Sleeping until ${savedNextRun.toLocaleString('ru-RU')} (already signed)`);
} else {
  console.log(`[${now.toLocaleString('ru-RU')}] 🏐 Volleyball watcher started...`);

  // Запускаем задачу по расписанию — каждые 3 минуты с 6:00 до 23:59
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [1, 4, 6]; // Понедельник, четверг, суббота
  rule.hour = new schedule.Range(6, 23);
  rule.minute = new schedule.Range(0, 59, 3);

  schedule.scheduleJob(rule, async () => {
    const nextRun = loadNextRun();
    if (nextRun && nextRun > new Date()) {
      // Если дата следующего запуска ещё не наступила — выходим
      return;
    }

    await runVolleyballCheck();
  });
}
