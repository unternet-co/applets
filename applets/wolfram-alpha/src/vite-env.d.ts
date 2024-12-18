/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WOLFRAM_ALPHA_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
