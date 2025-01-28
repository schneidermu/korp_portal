export const BACKEND_AUTHORITY = import.meta.env.VITE_BACKEND_AUTHORITY;

export const STATIC_BASE_URL = BACKEND_AUTHORITY;
export const API_BASE_URL = BACKEND_AUTHORITY + "/api";
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
