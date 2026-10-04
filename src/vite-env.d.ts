/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_ENV?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_LOCAL_DEVELOPMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
