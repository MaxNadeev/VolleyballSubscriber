import 'dotenv/config';
import axios from 'axios';

const TOKEN = process.env.VK_TOKEN;

/**
 * Добавление комментария к посту
 * @param {number} postId - ID поста
 * @param {number} maxSequential - максимальное последовательное число в комментариях
 */
export async function addComment(postId, maxSequential) {
  // Формируем текст комментария
  let commentText = '';
  if (maxSequential < 12) {
    commentText = `${maxSequential + 1}`;
  } else {
    commentText = `${maxSequential + 1} резерв`;
  }

  console.log('💬 Text of comment for sending:', commentText);


  
  try {
    const ownerId = -Math.abs(Number(process.env.VK_GROUP_ID)); // ID сообщества
    const url = 'https://api.vk.com/method/wall.createComment';
    const params = {
      owner_id: ownerId,
      post_id: postId,
      message: commentText,
      access_token: TOKEN,
      v: '5.199'
    };

    const response = await axios.get(url, { params });
    if (response.data.response) {
      console.log('✅ Comment successfully sent! ID:', response.data.response.comment_id);
    } else {
      console.error('⚠️ Error when sending comment:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Query error:', error.message);
  }

  return commentText;

}
