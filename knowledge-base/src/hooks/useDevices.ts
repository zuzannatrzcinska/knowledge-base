// src/hooks/useDevices.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ==================== TYPY ====================

export interface DeviceSpec {
  id: string
  key: string
  label: string
  unit: string
  data_type: 'number' | 'text'
  category: string
  is_default: boolean
  sort_order: number
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
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
  specs: Record<string, any>
  features: Record<string, boolean>
}

// ==================== HOOK: PARAMETRY TECHNICZNE ====================

export function useDeviceSpecs() {
  const [specs, setSpecs] = useState<DeviceSpec[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSpecs = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('device_specs')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      setSpecs(data || [])
    } catch (err) {
      console.error('Error fetching specs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSpecs() }, [fetchSpecs])

  const addSpec = async (label: string, unit: string, dataType: 'number' | 'text', category: string) => {
    const key = 'spec_' + Date.now()
    const { data, error } = await supabase
      .from('device_specs')
      .insert({ key, label, unit, data_type: dataType, category, is_default: false, sort_order: 100 })
      .select()
      .single()
    
    if (error) throw error
    await fetchSpecs()
    return data
  }

  const updateSpec = async (id: string, updates: Partial<DeviceSpec>) => {
    const { error } = await supabase.from('device_specs').update(updates).eq('id', id)
    if (error) throw error
    await fetchSpecs()
  }

  const deleteSpec = async (id: string) => {
    const { error } = await supabase.from('device_specs').delete().eq('id', id)
    if (error) throw error
    await fetchSpecs()
  }

  // Grupowanie po kategoriach
  const specsByCategory = specs.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {} as Record<string, DeviceSpec[]>)

  return { specs, specsByCategory, loading, refetch: fetchSpecs, addSpec, updateSpec, deleteSpec }
}

// ==================== HOOK: FUNKCJE ====================

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
    const key = 'fn_' + Date.now()
    const { data, error } = await supabase
      .from('device_features')
      .insert({ key, label, category, is_default: false, sort_order: 100 })
      .select()
      .single()
    
    if (error) throw error
    await fetchFeatures()
    return data
  }

  const updateFeature = async (id: string, updates: Partial<DeviceFeature>) => {
    const { error } = await supabase.from('device_features').update(updates).eq('id', id)
    if (error) throw error
    await fetchFeatures()
  }

  const deleteFeature = async (id: string) => {
    const { error } = await supabase.from('device_features').delete().eq('id', id)
    if (error) throw error
    await fetchFeatures()
  }

  // Grupowanie po kategoriach
  const featuresByCategory = features.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  }, {} as Record<string, DeviceFeature[]>)

  return { features, featuresByCategory, loading, refetch: fetchFeatures, addFeature, updateFeature, deleteFeature }
}

// ==================== HOOK: URZĄDZENIA ====================

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Pobierz urządzenia
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (devicesError) throw devicesError

      // Pobierz wszystkie definicje specs i features
      const { data: specsData } = await supabase.from('device_specs').select('id, key, data_type')
      const { data: featuresData } = await supabase.from('device_features').select('id, key')

      // Pobierz wartości parametrów
      const { data: specValuesData } = await supabase
        .from('device_spec_values')
        .select('device_id, spec_id, value_number, value_text')
      
      // Pobierz wartości funkcji
      const { data: featureValuesData } = await supabase
        .from('device_feature_values')
        .select('device_id, feature_id, has_feature')

      // Mapowanie spec_id -> key
      const specIdToKey = new Map(specsData?.map(s => [s.id, { key: s.key, data_type: s.data_type }]) || [])
      const featureIdToKey = new Map(featuresData?.map(f => [f.id, f.key]) || [])

      // Złóż dane urządzeń
      const enrichedDevices: Device[] = (devicesData || []).map(device => {
        const specs: Record<string, any> = {}
        const features: Record<string, boolean> = {}

        // Dodaj wartości parametrów
        specValuesData?.filter(sv => sv.device_id === device.id).forEach(sv => {
          const specInfo = specIdToKey.get(sv.spec_id)
          if (specInfo) {
            specs[specInfo.key] = specInfo.data_type === 'number' ? sv.value_number : sv.value_text
          }
        })

        // Dodaj wartości funkcji
        featureValuesData?.filter(fv => fv.device_id === device.id).forEach(fv => {
          const featureKey = featureIdToKey.get(fv.feature_id)
          if (featureKey) {
            features[featureKey] = fv.has_feature
          }
        })

        return { ...device, specs, features }
      })

      setDevices(enrichedDevices)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDevices() }, [fetchDevices])

  const createDevice = async (
    deviceData: { name: string; model?: string; category?: string; description?: string; notes?: string },
    specValues: Record<string, any>,
    featureValues: Record<string, boolean>
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Utwórz urządzenie
    const { data: newDevice, error: deviceError } = await supabase
      .from('devices')
      .insert({ ...deviceData, created_by: user?.id })
      .select()
      .single()
    
    if (deviceError) throw deviceError

    // Pobierz definicje
    const { data: specs } = await supabase.from('device_specs').select('id, key, data_type')
    const { data: features } = await supabase.from('device_features').select('id, key')

    // Zapisz wartości parametrów
    const specInserts = Object.entries(specValues)
      .filter(([_, v]) => v != null && v !== '')
      .map(([key, value]) => {
        const spec = specs?.find(s => s.key === key)
        if (!spec) return null
        return {
          device_id: newDevice.id,
          spec_id: spec.id,
          value_number: spec.data_type === 'number' ? Number(value) : null,
          value_text: spec.data_type === 'text' ? String(value) : null
        }
      })
      .filter(Boolean)

    if (specInserts.length > 0) {
      const { error } = await supabase.from('device_spec_values').insert(specInserts)
      if (error) console.error('Error inserting spec values:', error)
    }

    // Zapisz wartości funkcji (tylko te które są true)
    const featureInserts = Object.entries(featureValues)
      .filter(([_, v]) => v === true)
      .map(([key]) => {
        const feature = features?.find(f => f.key === key)
        if (!feature) return null
        return {
          device_id: newDevice.id,
          feature_id: feature.id,
          has_feature: true
        }
      })
      .filter(Boolean)

    if (featureInserts.length > 0) {
      const { error } = await supabase.from('device_feature_values').insert(featureInserts)
      if (error) console.error('Error inserting feature values:', error)
    }

    await fetchDevices()
    return newDevice
  }

  const updateDevice = async (
    id: string,
    deviceData: { name?: string; model?: string; category?: string; description?: string; notes?: string },
    specValues: Record<string, any>,
    featureValues: Record<string, boolean>
  ) => {
    // Aktualizuj urządzenie
    const { error: deviceError } = await supabase
      .from('devices')
      .update(deviceData)
      .eq('id', id)
    
    if (deviceError) throw deviceError

    // Pobierz definicje
    const { data: specs } = await supabase.from('device_specs').select('id, key, data_type')
    const { data: features } = await supabase.from('device_features').select('id, key')

    // Usuń stare i dodaj nowe wartości parametrów
    await supabase.from('device_spec_values').delete().eq('device_id', id)
    
    const specInserts = Object.entries(specValues)
      .filter(([_, v]) => v != null && v !== '')
      .map(([key, value]) => {
        const spec = specs?.find(s => s.key === key)
        if (!spec) return null
        return {
          device_id: id,
          spec_id: spec.id,
          value_number: spec.data_type === 'number' ? Number(value) : null,
          value_text: spec.data_type === 'text' ? String(value) : null
        }
      })
      .filter(Boolean)

    if (specInserts.length > 0) {
      await supabase.from('device_spec_values').insert(specInserts)
    }

    // Usuń stare i dodaj nowe wartości funkcji
    await supabase.from('device_feature_values').delete().eq('device_id', id)
    
    const featureInserts = Object.entries(featureValues)
      .filter(([_, v]) => v === true)
      .map(([key]) => {
        const feature = features?.find(f => f.key === key)
        if (!feature) return null
        return {
          device_id: id,
          feature_id: feature.id,
          has_feature: true
        }
      })
      .filter(Boolean)

    if (featureInserts.length > 0) {
      await supabase.from('device_feature_values').insert(featureInserts)
    }

    await fetchDevices()
  }

  const deleteDevice = async (id: string) => {
    const { error } = await supabase.from('devices').delete().eq('id', id)
    if (error) throw error
    await fetchDevices()
  }

  return { devices, loading, error, refetch: fetchDevices, createDevice, updateDevice, deleteDevice }
}
