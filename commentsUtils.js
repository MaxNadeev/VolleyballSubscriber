export function getMaxNumberFromComments(comments) {
  let max = 0;

  comments.forEach(comment => {
    // Ищем все числа в тексте
    const numbers = comment.text.match(/\d+/g); // массив найденных чисел
    if (numbers) {
      numbers.forEach(num => {
        const n = parseInt(num, 10);
        if (n > max) max = n;
      });
    }
  });

  return max;
}
