import { supabase } from '../lib/supabase'

// Helper function to get Supabase Storage URL
export function getModelUrl(filename: string): string {
  const { data } = supabase.storage
    .from('3d-models')
    .getPublicUrl(filename)
  
  return data.publicUrl
}

// Helper function to get thumbnail URL
export function getThumbnailUrl(filename: string): string {
  const { data } = supabase.storage
    .from('3d-models')
    .getPublicUrl(`thumbnails/${filename}`)
  
  return data.publicUrl
}

// Helper function to get local model URL
export function getLocalModelUrl(filename: string): string {
  return `/models/${filename}`
}

// Helper function to get local thumbnail URL
export function getLocalThumbnailUrl(filename: string): string {
  return `/thumbnails/${filename}`
}
