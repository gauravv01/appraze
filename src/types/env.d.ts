/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_SENDGRID_API_KEY: string
  readonly VITE_SENDER_EMAIL: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_MODEL: string
  readonly VITE_AUTH_REDIRECT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 