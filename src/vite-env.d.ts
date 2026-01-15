/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly VITE_WS_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
