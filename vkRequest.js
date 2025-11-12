// vkRequest.js
import axios from 'axios';
import 'dotenv/config';

const TOKEN = process.env.VK_TOKEN;

export async function vkRequest(method, params, maxRetries = 3) {
  const url = `https://api.vk.com/method/${method}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await axios.get(url, {
        params: {
          ...params,
          access_token: TOKEN,
          v: '5.199'
        },
        timeout: 15000
      });

      if (data.error) {
        console.error(`⚠️ VK API Error (${method}): ${data.error.error_msg}`);
        return null;
      }

      return data.response;
    } catch (error) {
      console.error(`[${new Date().toLocaleString('ru-RU')}] ❌ Error VK API (try ${attempt}/${maxRetries}): ${error.code}`);

      if (attempt < maxRetries) {
        // Экспоненциальная задержка: 2, 4, 8 секунд
        const delay = 2000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        return null;
      }
    }
  }
}
