/// <reference types="vite/client" />

declare module '*.exr' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_DEV_URL: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
