// Возвращает дату следующего дня мониторинга (пн, чт, сб) в 06:00 утра
export function getNextRunDate() {
  const now = new Date();
  const next = new Date(now);
  const allowedDays = [1, 4, 6]; // Понедельник, четверг, суббота

  do {
    next.setDate(next.getDate() + 1);
  } while (!allowedDays.includes(next.getDay()));

  next.setHours(6, 0, 0, 0);
  return next;
}
