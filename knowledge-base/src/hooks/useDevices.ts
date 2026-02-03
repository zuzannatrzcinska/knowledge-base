// src/hooks/useDevices.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Device {
  id: string
  name: string
  model?: string
  category: string
  description?: string
  image_url?: string
  battery_capacity?: number
  battery_life_days?: number
  weight_grams?: number
  dimensions?: string
  water_resistance?: string
  screen_size?: number
  screen_type?: string
  has_gps: boolean
  has_wifi: boolean
  has_bluetooth: boolean
  has_lte: boolean
  has_nfc: boolean
  sim_type?: string
  has_heart_rate: boolean
  has_blood_oxygen: boolean
  has_sleep_tracking: boolean
  has_step_counter: boolean
  has_alarm: boolean
  has_stopwatch: boolean
  has_timer: boolean
  has_calculator: boolean
  has_flashlight: boolean
  has_camera: boolean
  has_voice_call: boolean
  has_video_call: boolean
  has_sos_button: boolean
  has_geofence: boolean
  has_remote_shutdown: boolean
  operating_system?: string
  compatible_with?: string
  price?: number
  currency: string
  release_year?: number
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface DeviceFilters {
  category?: string
  has_gps?: boolean
  has_wifi?: boolean
  has_bluetooth?: boolean
  has_lte?: boolean
  has_heart_rate?: boolean
  has_alarm?: boolean
  has_sos_button?: boolean
  has_geofence?: boolean
  has_voice_call?: boolean
  has_video_call?: boolean
  min_battery_days?: number
  max_weight?: number
  search?: string
}

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

      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.has_gps !== undefined) query = query.eq('has_gps', filters.has_gps)
      if (filters?.has_wifi !== undefined) query = query.eq('has_wifi', filters.has_wifi)
      if (filters?.has_bluetooth !== undefined) query = query.eq('has_bluetooth', filters.has_bluetooth)
      if (filters?.has_lte !== undefined) query = query.eq('has_lte', filters.has_lte)
      if (filters?.has_heart_rate !== undefined) query = query.eq('has_heart_rate', filters.has_heart_rate)
      if (filters?.has_alarm !== undefined) query = query.eq('has_alarm', filters.has_alarm)
      if (filters?.has_sos_button !== undefined) query = query.eq('has_sos_button', filters.has_sos_button)
      if (filters?.has_geofence !== undefined) query = query.eq('has_geofence', filters.has_geofence)
      if (filters?.has_voice_call !== undefined) query = query.eq('has_voice_call', filters.has_voice_call)
      if (filters?.has_video_call !== undefined) query = query.eq('has_video_call', filters.has_video_call)
      if (filters?.min_battery_days) query = query.gte('battery_life_days', filters.min_battery_days)
      if (filters?.max_weight) query = query.lte('weight_grams', filters.max_weight)
      if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setDevices(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchDevices() }, [fetchDevices])

  const createDevice = async (deviceData: Partial<Device>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('devices').insert({ ...deviceData, created_by: user?.id }).select().single()
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
