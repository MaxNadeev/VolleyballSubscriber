/**
 * Находит следующий номер в последовательности комментариев
 * @param {Array<{ author_id: number, text: string }>} comments
 * @returns {number} - следующий номер для записи
 */
export function getNextNumber(comments) {
    if (comments.length === 0) return 1; // Если комментариев нет, возвращаем 1
  // Извлекаем все числа из комментариев
  const numbers = comments
    .map(c => {
      const match = c.text.match(/\b\d+\b/);
      return match ? parseInt(match[0], 10) : null;
    })
    .filter(n => n !== null)
    .sort((a, b) => a - b);

  // Находим пропущенное число в последовательности
  const numberSet = new Set(numbers);
  let missing = null;

  for (let i = 1; i <= Math.max(...numbers); i++) {
      if (!numberSet.has(i)) {
          missing = i;
          break;
      }
  }

  // missing содержит пропущенное число или null
  return missing !== null ? missing : Math.max(...numbers) + 1;
}
