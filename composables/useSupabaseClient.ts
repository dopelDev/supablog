import type { SupabaseClient } from '@supabase/supabase-js'

export const useSupabaseClient = () => {
  const { $supabase } = useNuxtApp()
  if (!$supabase) {
    throw new Error('Supabase client no disponible: revisa SUPABASE_URL y SUPABASE_ANON_KEY en runtimeConfig.')
  }
  return $supabase as SupabaseClient
}
