export function cleanUrl(url: string): string {
  return url.replace(/([^:]\/)\/+/g, "$1");
}
