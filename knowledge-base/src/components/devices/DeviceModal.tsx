// src/components/devices/DeviceModal.tsx
import { useState } from 'react'
import { X, Save, Watch } from 'lucide-react'
import { Device } from '../../hooks/useDevices'

interface DeviceModalProps {
  device?: Device | null
  onSave: (data: Partial<Device>) => Promise<void>
  onClose: () => void
}

export default function DeviceModal({ device, onSave, onClose }: DeviceModalProps) {
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'connectivity' | 'features' | 'other'>('basic')
  
  const [formData, setFormData] = useState<Partial<Device>>({
    name: device?.name || '', model: device?.model || '', category: device?.category || 'zegarek',
    description: device?.description || '', image_url: device?.image_url || '',
    battery_capacity: device?.battery_capacity, battery_life_days: device?.battery_life_days,
    weight_grams: device?.weight_grams, dimensions: device?.dimensions || '',
    water_resistance: device?.water_resistance || '', screen_size: device?.screen_size,
    screen_type: device?.screen_type || '', sim_type: device?.sim_type || '',
    has_gps: device?.has_gps ?? false, has_wifi: device?.has_wifi ?? false,
    has_bluetooth: device?.has_bluetooth ?? false, has_lte: device?.has_lte ?? false, has_nfc: device?.has_nfc ?? false,
    has_heart_rate: device?.has_heart_rate ?? false, has_blood_oxygen: device?.has_blood_oxygen ?? false,
    has_sleep_tracking: device?.has_sleep_tracking ?? false, has_step_counter: device?.has_step_counter ?? false,
    has_alarm: device?.has_alarm ?? false, has_stopwatch: device?.has_stopwatch ?? false,
    has_timer: device?.has_timer ?? false, has_calculator: device?.has_calculator ?? false,
    has_flashlight: device?.has_flashlight ?? false, has_camera: device?.has_camera ?? false,
    has_voice_call: device?.has_voice_call ?? false, has_video_call: device?.has_video_call ?? false,
    has_sos_button: device?.has_sos_button ?? false, has_geofence: device?.has_geofence ?? false,
    has_remote_shutdown: device?.has_remote_shutdown ?? false,
    operating_system: device?.operating_system || '', compatible_with: device?.compatible_with || '',
    price: device?.price, release_year: device?.release_year, notes: device?.notes || '',
  })

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) { alert('Nazwa jest wymagana'); return }
    setSaving(true)
    try { await onSave(formData) } finally { setSaving(false) }
  }

  const Toggle = ({ field, label }: { field: string; label: string }) => (
    <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50">
      <input type="checkbox" checked={(formData as any)[field] || false} onChange={(e) => updateField(field, e.target.checked)}
        className="w-5 h-5 rounded border-slate-600 text-cyan-500" />
      <span className="text-slate-200">{label}</span>
    </label>
  )

  const Input = ({ field, label, type = 'text', placeholder = '' }: { field: string; label: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input type={type} value={(formData as any)[field] || ''} placeholder={placeholder}
        onChange={(e) => updateField(field, type === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Watch className="w-5 h-5 text-cyan-400" /> {device ? 'Edytuj urządzenie' : 'Dodaj urządzenie'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex border-b border-slate-700">
          {['basic', 'connectivity', 'features', 'other'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 text-sm font-medium ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px' : 'text-slate-400 hover:text-slate-200'}`}>
              {tab === 'basic' ? 'Podstawowe' : tab === 'connectivity' ? 'Łączność' : tab === 'features' ? 'Funkcje' : 'Inne'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {activeTab === 'basic' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input field="name" label="Nazwa urządzenia *" placeholder="np. GJD.08" />
                  <Input field="model" label="Model" placeholder="np. GJD.08 Pro" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategoria</label>
                  <select value={formData.category} onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100">
                    <option value="zegarek">Zegarek</option>
                    <option value="lokalizator">Lokalizator</option>
                    <option value="inne">Inne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Opis</label>
                  <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 resize-none" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input field="battery_capacity" label="Bateria (mAh)" type="number" placeholder="680" />
                  <Input field="battery_life_days" label="Czas pracy (dni)" type="number" placeholder="3" />
                  <Input field="weight_grams" label="Waga (g)" type="number" placeholder="45" />
                  <Input field="water_resistance" label="Wodoodporność" placeholder="IP67" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input field="dimensions" label="Wymiary" placeholder="45x38x12mm" />
                  <Input field="screen_size" label="Ekran (cale)" type="number" placeholder="1.4" />
                  <Input field="screen_type" label="Typ ekranu" placeholder="AMOLED" />
                </div>
              </>
            )}

            {activeTab === 'connectivity' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Toggle field="has_gps" label="GPS" />
                  <Toggle field="has_wifi" label="WiFi" />
                  <Toggle field="has_bluetooth" label="Bluetooth" />
                  <Toggle field="has_lte" label="LTE / 4G" />
                  <Toggle field="has_nfc" label="NFC" />
                </div>
                <Input field="sim_type" label="Typ karty SIM" placeholder="nano SIM, eSIM" />
              </>
            )}

            {activeTab === 'features' && (
              <>
                <h4 className="text-sm font-medium text-slate-400 uppercase">Zdrowie i fitness</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Toggle field="has_heart_rate" label="Pulsometr" />
                  <Toggle field="has_blood_oxygen" label="Pomiar SpO2" />
                  <Toggle field="has_sleep_tracking" label="Monitoring snu" />
                  <Toggle field="has_step_counter" label="Krokomierz" />
                </div>
                <h4 className="text-sm font-medium text-slate-400 uppercase mt-4">Komunikacja</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Toggle field="has_voice_call" label="Połączenia głosowe" />
                  <Toggle field="has_video_call" label="Wideorozmowy" />
                  <Toggle field="has_sos_button" label="Przycisk SOS" />
                </div>
                <h4 className="text-sm font-medium text-slate-400 uppercase mt-4">Bezpieczeństwo</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Toggle field="has_geofence" label="Geofence (strefy)" />
                  <Toggle field="has_remote_shutdown" label="Zdalne wyłączanie" />
                </div>
                <h4 className="text-sm font-medium text-slate-400 uppercase mt-4">Narzędzia</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Toggle field="has_alarm" label="Budzik" />
                  <Toggle field="has_stopwatch" label="Stoper" />
                  <Toggle field="has_timer" label="Timer" />
                  <Toggle field="has_calculator" label="Kalkulator" />
                  <Toggle field="has_flashlight" label="Latarka" />
                  <Toggle field="has_camera" label="Aparat" />
                </div>
              </>
            )}

            {activeTab === 'other' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input field="operating_system" label="System operacyjny" placeholder="Android, Proprietary" />
                  <Input field="compatible_with" label="Kompatybilność" placeholder="iOS 12+, Android 6+" />
                  <Input field="price" label="Cena (PLN)" type="number" placeholder="299.99" />
                  <Input field="release_year" label="Rok wydania" type="number" placeholder="2024" />
                </div>
                <Input field="image_url" label="URL zdjęcia" placeholder="https://..." />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Notatki wewnętrzne</label>
                  <textarea value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 resize-none" />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg">Anuluj</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg font-medium">
              <Save className="w-4 h-4" /> {saving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
