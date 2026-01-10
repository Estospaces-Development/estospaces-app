import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DbProperty {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  price: number;
  currency: string;
  negotiable: boolean;
  property_type: string;
  listing_type: string;
  status: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  landmark?: string;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  parking_spaces: number;
  area: number;
  area_unit: string;
  floor_number: number;
  total_floors: number;
  year_built?: number;
  furnishing: string;
  condition: string;
  facing?: string;
  image_urls: string[];
  virtual_tour_url?: string;
  amenities: any;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company?: string;
  available_from?: string;
  minimum_lease?: number;
  deposit?: number;
  maintenance_charges?: number;
  inclusions?: string;
  exclusions?: string;
  featured: boolean;
  verified: boolean;
  published: boolean;
  draft: boolean;
  views: number;
  inquiries: number;
  favorites: number;
  agent_id?: string;
  created_at: string;
  updated_at: string;
}

// Fetch all properties for current user
export const fetchUserProperties = async () => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: { user } } = await (supabase as SupabaseClient).auth.getUser();
  
  let query = (supabase as SupabaseClient)
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (user) {
    query = query.eq('agent_id', user.id);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as DbProperty[];
};

// Fetch single property by ID
export const fetchPropertyById = async (id: string) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await (supabase as SupabaseClient)
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as DbProperty;
};

// Create new property
export const createProperty = async (propertyData: Partial<DbProperty>) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: { user } } = await (supabase as SupabaseClient).auth.getUser();
  if (!user) throw new Error('Must be logged in to create a property');

  const { data, error } = await (supabase as SupabaseClient)
    .from('properties')
    .insert({
      ...propertyData,
      agent_id: user.id,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as DbProperty;
};

// Update property
export const updatePropertyInDb = async (id: string, propertyData: Partial<DbProperty>) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await (supabase as SupabaseClient)
    .from('properties')
    .update({
      ...propertyData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as DbProperty;
};

// Delete property
export const deletePropertyFromDb = async (id: string) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await (supabase as SupabaseClient)
    .from('properties')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Delete multiple properties
export const deletePropertiesFromDb = async (ids: string[]) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await (supabase as SupabaseClient)
    .from('properties')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
};

// Update property status
export const updatePropertyStatus = async (id: string, status: string) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await (supabase as SupabaseClient)
    .from('properties')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
};

// Bulk update status
export const bulkUpdatePropertyStatus = async (ids: string[], status: string) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await (supabase as SupabaseClient)
    .from('properties')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids);
  
  if (error) throw error;
};

// Increment views
export const incrementPropertyViews = async (id: string, currentViews: number) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await (supabase as SupabaseClient)
    .from('properties')
    .update({ views: currentViews + 1 })
    .eq('id', id);
  
  if (error) throw error;
};

// Increment inquiries
export const incrementPropertyInquiries = async (id: string, currentInquiries: number) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await (supabase as SupabaseClient)
    .from('properties')
    .update({ inquiries: currentInquiries + 1 })
    .eq('id', id);
  
  if (error) throw error;
};

// Upload images to Supabase Storage
export const uploadPropertyImages = async (files: File[]): Promise<string[]> => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: { user } } = await (supabase as SupabaseClient).auth.getUser();
  if (!user) throw new Error('Must be logged in to upload images');

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await (supabase as SupabaseClient).storage
      .from('property-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue;
    }

    const { data: { publicUrl } } = (supabase as SupabaseClient).storage
      .from('property-images')
      .getPublicUrl(fileName);

    uploadedUrls.push(publicUrl);
  }

  return uploadedUrls;
};

// Delete image from storage
export const deletePropertyImage = async (imageUrl: string) => {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  const urlParts = imageUrl.split('/');
  const fileName = urlParts.slice(-2).join('/'); // Gets user_id/filename.ext
  
  const { error } = await (supabase as SupabaseClient).storage
    .from('property-images')
    .remove([fileName]);
  
  if (error) throw error;
};
