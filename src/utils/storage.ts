import { supabase } from '../lib/supabase'

// Helper function to get Supabase Storage URL
export function getModelUrl(filename: string): string {
  const { data } = supabase.storage
    .from('3d-models')
    .getPublicUrl(filename)
  
  return data.publicUrl
}
