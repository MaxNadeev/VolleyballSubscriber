/**
 * Проверяет, соответствует ли переданный Unix timestamp (в секундах)
 * сегодняшней дате по локальному времени.
 *
 * @param {number} unixTimestamp — время поста (в секундах)
 * @returns {boolean} true, если дата сегодняшняя
 */
export function isToday(unixTimestamp) {
  const postDate = new Date(unixTimestamp * 1000);
  const now = new Date();

  return (
    postDate.getDate() === now.getDate() &&
    postDate.getMonth() === now.getMonth() &&
    postDate.getFullYear() === now.getFullYear()
  );
}
