/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // you can add more variables here later
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}