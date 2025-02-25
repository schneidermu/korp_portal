export const BACKEND_PREFIX = import.meta.env.VITE_BACKEND_PREFIX;

export const BACKEND_API_PREFIX = BACKEND_PREFIX + "/api";

export const FEED_PAGE_LIMIT = 5;
export const LOCALE = "ru-RU";

/**
 * The number of days that news about someone's birthday remains visible in the feed
 * after the actual birthday date.
 */
export const BIRTHDAY_NEWS_EXPIRY = 14;

export const ACCEPT_IMAGES = [".jpg", ".jpeg", ".png"] as const;
export const ACCEPT_DOCUMENTS = [
  ...ACCEPT_IMAGES,
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".pdf",
] as const;

/**
 * The delay, in milliseconds, between the time a Data Processing Agreement (DPA)
 * is checked and the subsequent automatic closing of the DPA notification.
 *
 * * DPA = согласие на обработку персональных данных
 */
export const DPA_CLOSE_DELAY: number = 1000;

/**
 * The URL pointing to the full terms of the Data Processing Agreement (DPA).
 *
 * * DPA = согласие на обработку персональных данных
 */
export const DPA_TERMS_URL: string =
  BACKEND_PREFIX +
  "/media/doc/Положение_о_защите_и_обработке_персональных_данных.pdf";

export const MS_PER_DAY = 1000 * 60 * 60 * 24;
