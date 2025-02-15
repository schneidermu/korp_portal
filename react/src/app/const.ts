export const BACKEND_PREFIX = import.meta.env.VITE_BACKEND_PREFIX;

export const BACKEND_API_PREFIX = BACKEND_PREFIX + "/api";

export const FEED_PAGE_LIMIT = 5;
export const LOCALE = "ru-RU";

export const ACCEPT_IMAGES = [".jpg", ".jpeg", ".png"] as const;
export const ACCEPT_DOCUMENTS = [
  ...ACCEPT_IMAGES,
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".pdf",
] as const;
