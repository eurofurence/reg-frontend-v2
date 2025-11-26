/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_AUTHSRV_BASE_URL?: string
  readonly VITE_ATTSRV_BASE_URL?: string
  readonly VITE_PAYSRV_BASE_URL?: string
  readonly VITE_ROOMSRV_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
