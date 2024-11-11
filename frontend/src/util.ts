export function urlBasename(url: string): string {
  const parts = decodeURI(url).split("/");
  return parts[parts.length - 1];
}
