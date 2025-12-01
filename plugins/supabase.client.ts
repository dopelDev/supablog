import { createClient, type SupabaseClient } from '@supabase/supabase-js'

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient | null
  }
}
export {}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  let supabase: SupabaseClient | null = null

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[supabase] Faltan SUPABASE_URL o SUPABASE_ANON_KEY en runtimeConfig.')
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  return {
    provide: {
      supabase
    }
  }
})
