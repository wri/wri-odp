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

export function filterObjects<T, U>(array: T[], filterObject: U): T[] {
  return array.filter((item) => {
    return Object.keys(filterObject).some((key) => {
      const filterValue = filterObject[key];
      const itemValue = item[key];
      return filterValue === itemValue;
    });
  });
}

export function getKeyValues<T, K extends keyof T>(array: T[], key: K, index: K): { id: string; label: T[K] | string }[] {
  let o = array.map((item, i) => ({
    id: item[index],
    label: item[key],
  }));

  o = [{ id: "None", label: "All" }, ...o]
  return o

}

