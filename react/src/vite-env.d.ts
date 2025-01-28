/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_AUTHORITY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
