export function formatDate(inputDate: string): string {
  const date = new Date(inputDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function searchArrayForKeyword<T>(
  arr: T[],
  keyword: string
): T[] {
  const results: T[] = [];
  for (const obj of arr) {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].includes(keyword)) {
        results.push(obj);
        break;
      }
    }
  }
  return results;
}
