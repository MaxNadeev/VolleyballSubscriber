import { getLastPost } from './getLastPost.js';
import { getPostComments } from './getPostComments.js';
import { addComment } from './addComment.js';
import { sendTgMessage } from './tg-volleyball-bot.js';
import { getNextNumber } from './getNextNumber.js';
import { isToday } from './isToday.js';
import 'dotenv/config';

const GROUP_ID = process.env.VK_GROUP_ID;
const MY_ID = Number(process.env.VK_MY_ID);

/**
 * Основная функция мониторинга и записи на волейбол.
 * Возвращает один из статусов:
 *  - "SIGNED"  — успешно записался на игру
 *  - "ALREADY" — уже был записан
 *  - "NO_NEW_POSTS" — нет новых постов сегодня
 *  - "ERROR" — ошибка получения данных
 */
export async function main() {
  try {
    const lastPost = await getLastPost(GROUP_ID);

    if (!lastPost) {
      const now = new Date();
      console.log(`${now.toLocaleString('ru-RU')} Can't get new post.`);
      return 'ERROR';
    }

    const { id: postId, text, date } = lastPost;

    // Проверяем, сегодняшний ли пост
    if (!isToday(date)) {
      console.log(`[${now.toLocaleString('ru-RU')}] No new posts`);
      return 'NO_NEW_POSTS';
    }

    // Получаем комментарии (от старых к новым)
    const comments = await getPostComments(GROUP_ID, postId);

    // Проверяем первый комментарий
    const firstComment = comments.length > 0 ? comments[0].text : '';

    // Регулярное выражение для проверки наличия цифры 1
    const regex = /1/;

    if (!regex.test(firstComment)) {
      // Если цифры 1 в первом комментарии нет - ждем появления подходящего комментария
      console.log(`[${now.toLocaleString('ru-RU')}] First comment doesn't include digit 1, post is not game announce.`);
      return 'NO_NEW_POSTS';
    }

    // Проверяем, записан ли уже пользователь
    const wroteSelf = comments.some(c => c.author_id === MY_ID);

    if (wroteSelf) {
      const now = new Date();
      console.log(`[${now.toLocaleString('ru-RU')}] Already signed in game`);
      return 'ALREADY';
    }

    // Если не записан — ищем свободный номер
    const nextNumber = getNextNumber(comments);

    // Формируем ссылку на пост
    const postLink = `https://vk.com/wall-${GROUP_ID}_${postId}`;

    // Формируем текст комментария
    const commentText = await addComment(postId, nextNumber - 1);

    // Формируем текст для Telegram
    const message = `Забил местечко на волейболе: ${commentText}.\n${text}\n${postLink}`;

    // Отправляем уведомление в Telegram
    await sendTgMessage(message);

    return 'SIGNED';
  } catch (error) {
    console.error(`[${now.toLocaleString('ru-RU')}] ❌ Unexpected error in main(): ${error.message}`);
    return 'ERROR';
  }
}

