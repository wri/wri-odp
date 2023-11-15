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
      if (typeof obj[key] === 'string' && (obj[key] as string).includes(keyword)) {
        results.push(obj);
        break;
      }
    }
  }
  return results;
}

export function filterObjects<T>(arrayObject: T[], filterObject: Record<string, string>): T[] {
  return arrayObject.filter((item) => {

    return Object.keys(filterObject).some((key) => {
      const filterValue = filterObject[key];
      const itemValue = (item as Record<string, string>)[key];
      if (key === 'timestamp') {
        return isWithinTimeframe(itemValue!, filterValue!);
      }
      return filterValue === itemValue;
    });
  });
}

export function getKeyValues<T, K extends keyof T>(array: T[], key: K, index: K): { id: string; label: string }[] {
  const o: {
    id: string;
    label: string;
  }[] = array.map((item, i) => ({
    id: item[index] as string,
    label: item[key] as string,
  }));

  return o

}

export function getKeyValues2<T, K extends keyof T>(array: T[], key: K, index: K): { id: string; label: T[K] | string }[] {
  const keyValueMap = new Map<string, string>();
  const result: { id: string; label: string }[] = [];

  array.forEach((item, i) => {
    const keyValue = item[key];
    if (!keyValueMap.has(keyValue as string)) {
      keyValueMap.set(keyValue as string, item[index] as string);
      result.push({ id: item[index] as string, label: item[key] as string });
    }
  });
  return result;
}

function isWithinTimeframe(isoTimestamp: string, timeframe: string): boolean {
  const timestamp = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const millisecondsInDay = 24 * 60 * 60 * 1000; // 1 day
  const millisecondsInWeek = 7 * millisecondsInDay;
  const millisecondsInMonth = 30 * millisecondsInDay; // Assuming a month is 30 days
  const millisecondsInYear = 365 * millisecondsInDay; // Assuming a year is 365 days

  switch (timeframe) {
    case 'day':
      return now - timestamp < millisecondsInDay;
    case 'week':
      return now - timestamp < millisecondsInWeek;
    case 'month':
      return now - timestamp < millisecondsInMonth;
    case 'year':
      return now - timestamp < millisecondsInYear;
    default:
      return true;
  }
}