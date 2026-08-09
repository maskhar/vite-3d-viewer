// ============================================
// TypeScript Types untuk Supabase Integration
// ============================================
// File: src/types/supabase.ts

export interface ModelsCatalogRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  model_filename: string;
  preview_camera_x: number;
  preview_camera_y: number;
  preview_camera_z: number;
  preview_rotation_x: number;
  preview_rotation_y: number;
  preview_rotation_z: number;
  preview_scale: number;
  viewer_auto_rotate: boolean;
  viewer_auto_rotate_speed: number;
  viewer_camera_x: number;
  viewer_camera_y: number;
  viewer_camera_z: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ModelsCatalogFormatted {
  id: string;
  name: string;
  category: string;
  description: string | null;
  model_filename: string;
  preview: {
    cameraPosition: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  };
  viewer: {
    autoRotate: boolean;
    autoRotateSpeed: number;
    cameraPosition: [number, number, number];
  };
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateModelParams {
  p_name: string;
  p_category: string;
  p_description: string;
  p_model_filename: string;
  p_preview_camera_x?: number;
  p_preview_camera_y?: number;
  p_preview_camera_z?: number;
  p_preview_scale?: number;
  p_viewer_auto_rotate?: boolean;
  p_display_order?: number;
}

export interface UpdateModelParams {
  p_id: string;
  p_name?: string;
  p_category?: string;
  p_description?: string;
  p_model_filename?: string;
  p_preview_camera_x?: number;
  p_preview_camera_y?: number;
  p_preview_camera_z?: number;
  p_preview_scale?: number;
  p_viewer_auto_rotate?: boolean;
  p_is_active?: boolean;
  p_display_order?: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface DisplayOrderUpdate {
  id: string;
  order: number;
}

// ============================================
// Supabase Service Functions
// ============================================
// File: src/services/catalogService.ts

import { supabase } from '../lib/supabase';
import type {
  ModelsCatalogFormatted,
  CreateModelParams,
  UpdateModelParams,
  CategoryCount,
  DisplayOrderUpdate,
} from '../types/supabase';

/**
 * Get all models from catalog with optional filtering
 */
export async function getModelsCatalog(options?: {
  category?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ModelsCatalogFormatted[]> {
  const { data, error } = await supabase.rpc('get_models_catalog', {
    p_category: options?.category || null,
    p_active_only: options?.activeOnly ?? false,
    p_limit: options?.limit || 100,
    p_offset: options?.offset || 0,
  });

  if (error) {
    console.error('Error fetching models:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get single model by ID
 */
export async function getModelById(
  id: string
): Promise<ModelsCatalogFormatted | null> {
  const { data, error } = await supabase.rpc('get_model_by_id', {
    p_id: id,
  });

  if (error) {
    console.error('Error fetching model:', error);
    throw error;
  }

  return data?.[0] || null;
}

/**
 * Create new model
 */
export async function createModel(
  params: CreateModelParams
): Promise<string> {
  const { data, error } = await supabase.rpc('create_model', params);

  if (error) {
    console.error('Error creating model:', error);
    throw error;
  }

  return data;
}

/**
 * Update existing model
 */
export async function updateModel(
  params: UpdateModelParams
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_model', params);

  if (error) {
    console.error('Error updating model:', error);
    throw error;
  }

  return data;
}

/**
 * Soft delete (deactivate) model
 */
export async function deactivateModel(id: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('deactivate_model', {
    p_id: id,
  });

  if (error) {
    console.error('Error deactivating model:', error);
    throw error;
  }

  return data;
}

/**
 * Hard delete model
 */
export async function deleteModel(id: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_model', {
    p_id: id,
  });

  if (error) {
    console.error('Error deleting model:', error);
    throw error;
  }

  return data;
}

/**
 * Update display orders in bulk
 */
export async function updateDisplayOrders(
  updates: DisplayOrderUpdate[]
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_display_orders', {
    p_updates: JSON.stringify(updates),
  });

  if (error) {
    console.error('Error updating display orders:', error);
    throw error;
  }

  return data;
}

/**
 * Search models by keyword
 */
export async function searchModels(searchTerm: string): Promise<any[]> {
  const { data, error } = await supabase.rpc('search_models', {
    p_search_term: searchTerm,
  });

  if (error) {
    console.error('Error searching models:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all categories with counts
 */
export async function getCategories(): Promise<CategoryCount[]> {
  const { data, error } = await supabase.rpc('get_categories');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * Direct table query (alternative method)
 */
export async function getModelsDirectQuery(activeOnly = false) {
  let query = supabase
    .from('models_catalog')
    .select('*')
    .order('display_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching models:', error);
    throw error;
  }

  return data || [];
}

/**
 * Upload model file to storage
 */
export async function uploadModelFile(
  file: File,
  filename: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('3d-models')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  return data.path;
}

/**
 * Delete model file from storage
 */
export async function deleteModelFile(filename: string): Promise<void> {
  const { error } = await supabase.storage
    .from('3d-models')
    .remove([filename]);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get public URL for model file
 */
export function getModelFileUrl(filename: string): string {
  const { data } = supabase.storage
    .from('3d-models')
    .getPublicUrl(filename);

  return data.publicUrl;
}
