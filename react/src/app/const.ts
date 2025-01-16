export const STATIC_BASE_URL = "http://localhost:8021";
export const API_BASE_URL = "http://localhost:8021/api";
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
