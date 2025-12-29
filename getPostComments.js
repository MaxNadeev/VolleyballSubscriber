// getPostComments.js
import 'dotenv/config';
import axios from 'axios';

const TOKEN = process.env.VK_TOKEN;

export async function getPostComments(groupId, postId) {
  // Для групп owner_id = -GROUP_ID
  const ownerId = -Math.abs(Number(groupId));

  console.log(`[${now.toLocaleString('ru-RU')}]🔍 Fetching comments for post ${postId} in group ${ownerId}`);

  const { data } = await axios.get('https://api.vk.com/method/wall.getComments', {
    params: {
      owner_id: ownerId,       // важно: отрицательное число!
      post_id: postId,
      count: 100,              // можно увеличить лимит
      sort: 'asc',             // от старых к новым
      access_token: TOKEN,
      v: '5.199'
    }
  });

  if (data.error) {
    console.error(`[${now.toLocaleString('ru-RU')}] ⚠️ Ошибка VK API: ${data.error}`);
    return [];
  }

  if (!data.response?.items) return [];

  // Возвращаем массив объектов { author_id, text }
  return data.response.items.map(comment => ({
    author_id: comment.from_id,
    text: comment.text || ''
  }));
}
