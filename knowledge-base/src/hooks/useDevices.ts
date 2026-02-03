// src/hooks/useDevices.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Definicja wszystkich funkcji urządzenia
export const DEVICE_FEATURES = {
  // Podstawowe
  fn_alarm: { label: 'Budzik', category: 'Podstawowe' },
  fn_calculator: { label: 'Kalkulator', category: 'Podstawowe' },
  fn_voice_chat: { label: 'Czat głosowy', category: 'Podstawowe' },
  fn_gallery: { label: 'Galeria zdjęć', category: 'Podstawowe' },
  fn_pedometer: { label: 'Krokomierz', category: 'Podstawowe' },
  fn_stopwatch: { label: 'Stoper', category: 'Podstawowe' },
  fn_phonebook: { label: 'Książka telefoniczna', category: 'Podstawowe' },
  fn_calendar: { label: 'Kalendarz', category: 'Podstawowe' },
  
  // Lokalizacja
  fn_location_cyclic: { label: 'Lokalizowanie cykliczne', category: 'Lokalizacja' },
  fn_location_on_demand: { label: 'Lokalizowanie na żądanie', category: 'Lokalizacja' },
  fn_location_live: { label: 'Lokalizowanie LIVE', category: 'Lokalizacja' },
  fn_location_history: { label: 'Historia lokalizacji', category: 'Lokalizacja' },
  fn_geofence: { label: 'Geostrefa', category: 'Lokalizacja' },
  
  // Komunikacja
  fn_calls: { label: 'Połączenia', category: 'Komunikacja' },
  fn_force_call: { label: 'Wymuś połączenie', category: 'Komunikacja' },
  fn_video_calls: { label: 'Wideorozmowy', category: 'Komunikacja' },
  fn_whatsapp: { label: 'WhatsApp', category: 'Komunikacja' },
  fn_friends: { label: 'Przyjaciele', category: 'Komunikacja' },
  
  // Kontrola zdalna
  fn_watch_shutdown: { label: 'Wyłączenie z poziomu zegarka', category: 'Kontrola' },
  fn_remote_shutdown: { label: 'Zdalne wyłączenie urządzenia', category: 'Kontrola' },
  fn_remote_photo: { label: 'Zdalne zdjęcie', category: 'Kontrola' },
  fn_listening: { label: 'Nasłuch', category: 'Kontrola' },
  fn_play_sound: { label: 'Odtwórz dźwięk', category: 'Kontrola' },
  
  // Aparat i AI
  fn_camera: { label: 'Aparat', category: 'Multimedia' },
  fn_magic_camera: { label: 'Magic Camera', category: 'Multimedia' },
  fn_ai_assistant: { label: 'Asystent AI', category: 'Multimedia' },
  fn_dictionary: { label: 'Słownik', category: 'Multimedia' },
  fn_voice_recorder: { label: 'Rejestrator dźwięku', category: 'Multimedia' },
  fn_games: { label: 'Gry', category: 'Multimedia' },
  
  // Bezpieczeństwo
  fn_sos_alarm: { label: 'Alarm SOS', category: 'Bezpieczeństwo' },
  fn_school_mode: { label: 'Tryb szkolny', category: 'Bezpieczeństwo' },
  fn_fall_detection: { label: 'Czujnik upadku', category: 'Bezpieczeństwo' },
  
  // Zdrowie
  fn_heart_rate: { label: 'Pomiar pulsu', category: 'Zdrowie' },
  fn_blood_pressure: { label: 'Pomiar ciśnienia', category: 'Zdrowie' },
  fn_spo2: { label: 'Pomiar SpO2', category: 'Zdrowie' },
  fn_temperature: { label: 'Pomiar temperatury', category: 'Zdrowie' },
  fn_medication_reminder: { label: 'Przypomnienie o lekach', category: 'Zdrowie' },
}

// Definicja parametrów technicznych
export const DEVICE_SPECS = {
  battery_mah: { label: 'Bateria', unit: 'mAh', type: 'number' },
  battery_life_days: { label: 'Czas pracy na baterii', unit: 'dni', type: 'number' },
  weight_grams: { label: 'Waga', unit: 'g', type: 'number' },
  memory_mb: { label: 'Pamięć', unit: 'MB', type: 'number' },
  network: { label: 'Sieć', unit: '', type: 'text' },
  ip_rating: { label: 'IP (wodoodporność)', unit: '', type: 'text' },
  screen_size: { label: 'Rozmiar ekranu', unit: '', type: 'text' },
  screen_resolution: { label: 'Rozdzielczość ekranu', unit: '', type: 'text' },
  processor: { label: 'Procesor', unit: '', type: 'text' },
  sim_type: { label: 'Typ SIM', unit: '', type: 'text' },
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
  
  // Parametry techniczne
  battery_mah?: number
  battery_life_days?: number
  weight_grams?: number
  memory_mb?: number
  network?: string
  ip_rating?: string
  screen_size?: string
  screen_resolution?: string
  processor?: string
  sim_type?: string
  
  // Funkcje (wszystkie boolean)
  [key: string]: any
}

export interface DeviceFilters {
  search?: string
  searchSpec?: string // wyszukiwanie po konkretnym parametrze
  features?: string[] // lista wymaganych funkcji
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

      // Wyszukiwanie po nazwie
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
      }

      // Filtrowanie po funkcjach
      if (filters?.features && filters.features.length > 0) {
        for (const feature of filters.features) {
          query = query.eq(feature, true)
        }
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      
      // Filtrowanie po parametrze (np. bateria) - po stronie klienta
      let filteredData = data || []
      if (filters?.searchSpec) {
        const specKey = filters.searchSpec.toLowerCase()
        // Znajdź pasujący klucz w DEVICE_SPECS
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
  }, [filters?.search, filters?.searchSpec, filters?.features?.join(',')])

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
