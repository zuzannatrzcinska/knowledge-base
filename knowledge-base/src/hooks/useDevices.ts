// src/hooks/useDevices.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Definicja parametrów technicznych
export const DEVICE_SPECS = {
  battery_mah: { label: 'Bateria', unit: 'mAh', type: 'number' },
  battery_life_days: { label: 'Czas pracy na baterii', unit: 'dni', type: 'number' },
  weight_grams: { label: 'Waga', unit: 'g', type: 'number' },
  ram_mb: { label: 'RAM', unit: 'MB', type: 'number' },
  rom_mb: { label: 'ROM', unit: 'MB', type: 'number' },
  network: { label: 'Sieć', unit: '', type: 'text' },
  ip_rating: { label: 'IP (wodoodporność)', unit: '', type: 'text' },
  screen_size: { label: 'Rozmiar ekranu', unit: '', type: 'text' },
  screen_resolution: { label: 'Rozdzielczość ekranu', unit: '', type: 'text' },
  processor: { label: 'Procesor', unit: '', type: 'text' },
  sim_type: { label: 'Typ SIM', unit: '', type: 'text' },
}

export interface DeviceFeature {
  id: string
  key: string
  label: string
  category: string
  is_default: boolean
  sort_order: number
}

export interface Device {
  id: string
  name: string
  model?: string
  category: string
  description?: string
  image_url?: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
  [key: string]: any
}

export interface DeviceFilters {
  search?: string
  searchSpec?: string
  features?: string[]
  specs?: { key: string; min?: number; max?: number }[]
}

// Hook do zarządzania funkcjami
export function useDeviceFeatures() {
  const [features, setFeatures] = useState<DeviceFeature[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeatures = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('device_features')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      setFeatures(data || [])
    } catch (err) {
      console.error('Error fetching features:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFeatures() }, [fetchFeatures])

  const addFeature = async (label: string, category: string) => {
    const key = 'fn_custom_' + Date.now()
    const { data, error } = await supabase
      .from('device_features')
      .insert({ key, label, category, is_default: false, sort_order: 100 })
      .select()
      .single()
    
    if (error) throw error
    fetchFeatures()
    return data
  }

  const updateFeature = async (id: string, updates: Partial<DeviceFeature>) => {
    const { error } = await supabase
      .from('device_features')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
    fetchFeatures()
  }

  const deleteFeature = async (id: string) => {
    const { error } = await supabase
      .from('device_features')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    fetchFeatures()
  }

  // Grupowanie funkcji po kategoriach
  const featuresByCategory = features.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  }, {} as Record<string, DeviceFeature[]>)

  return { 
    features, 
    featuresByCategory, 
    loading, 
    refetch: fetchFeatures, 
    addFeature, 
    updateFeature, 
    deleteFeature 
  }
}

// Hook do zarządzania urządzeniami
export function useDevices(filters?: DeviceFilters) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('devices')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      // Wyszukiwanie po nazwie
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
      }

      // Filtrowanie po funkcjach (kolumny fn_*)
      if (filters?.features && filters.features.length > 0) {
        for (const feature of filters.features) {
          query = query.eq(feature, true)
        }
      }

      // Filtrowanie po parametrach numerycznych
      if (filters?.specs) {
        for (const spec of filters.specs) {
          if (spec.min !== undefined) query = query.gte(spec.key, spec.min)
          if (spec.max !== undefined) query = query.lte(spec.key, spec.max)
        }
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      
      let filteredData = data || []
      
      // Filtrowanie po parametrze (wyszukiwanie)
      if (filters?.searchSpec) {
        const specKey = filters.searchSpec.toLowerCase()
        const matchingSpec = Object.entries(DEVICE_SPECS).find(([key, spec]) => 
          spec.label.toLowerCase().includes(specKey) || key.toLowerCase().includes(specKey)
        )
        if (matchingSpec) {
          filteredData = filteredData.filter(d => d[matchingSpec[0]] != null)
        }
      }
      
      setDevices(filteredData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [
    filters?.search, 
    filters?.searchSpec, 
    filters?.features?.join(','),
    JSON.stringify(filters?.specs)
  ])

  useEffect(() => { fetchDevices() }, [fetchDevices])

  const createDevice = async (deviceData: Partial<Device>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('devices')
      .insert({ ...deviceData, created_by: user?.id })
      .select()
      .single()
    if (error) throw error
    fetchDevices()
    return data
  }

  const updateDevice = async (id: string, updates: Partial<Device>) => {
    const { error } = await supabase.from('devices').update(updates).eq('id', id)
    if (error) throw error
    fetchDevices()
  }

  const deleteDevice = async (id: string) => {
    const { error } = await supabase.from('devices').delete().eq('id', id)
    if (error) throw error
    fetchDevices()
  }

  return { devices, loading, error, refetch: fetchDevices, createDevice, updateDevice, deleteDevice }
}
