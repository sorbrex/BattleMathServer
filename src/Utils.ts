
// Generate a random multiplication question
export function generateQuestion() {
  const num1 = Math.floor(Math.random() * 8) + 2;
  const num2 = Math.floor(Math.random() * 8) + 2;
  return `${num1} * ${num2}`;
}

