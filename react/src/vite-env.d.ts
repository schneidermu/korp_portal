/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_AUTHORITY: string;
  readonly VITE_LIFERAY_EMBED: string;
  readonly VITE_PAUTH: string;
  readonly VITE_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
