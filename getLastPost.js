import { vkRequest } from './vkRequest.js';

export async function getLastPost(groupId) {
  const ownerId = -Math.abs(Number(groupId));

  const response = await vkRequest('wall.get', {
    owner_id: ownerId,
    count: 1
  });

  if (!response || !response.items?.length) return null;

  const post = response.items[0];
  return { id: post.id, text: post.text || '', date: post.date };
}
