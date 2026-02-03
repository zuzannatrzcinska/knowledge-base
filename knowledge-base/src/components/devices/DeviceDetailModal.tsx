// src/components/devices/DeviceDetailModal.tsx
import { X, Edit, Watch, Check, Minus } from 'lucide-react'
import { Device } from '../../hooks/useDevices'

interface Props {
  device: Device
  onClose: () => void
  onEdit: () => void
}

export default function DeviceDetailModal({ device, onClose, onEdit }: Props) {
  const Feature = ({ label, value }: { label: string; value: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${value ? 'bg-green-500/10' : 'bg-slate-700/30'}`}>
      <span className={value ? 'text-slate-200' : 'text-slate-500'}>{label}</span>
      <span className={`ml-auto ${value ? 'text-green-400' : 'text-slate-500'}`}>{value ? <Check className="w-4 h-4" /> : <Minus className="w-4 h-4" />}</span>
    </div>
  )

  const Spec = ({ label, value, suffix }: { label: string; value: any; suffix?: string }) => {
    if (value == null || value === '') return null
    return <div className="flex justify-between py-2 border-b border-slate-700/50"><span className="text-slate-400">{label}</span><span className="text-slate-200 font-medium">{value}{suffix}</span></div>
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
              <Watch className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">{device.name}</h2>
              {device.model && device.model !== device.name && <p className="text-sm text-slate-400">{device.model}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700"><Edit className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {device.description && <p className="text-slate-300">{device.description}</p>}
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm capitalize">{device.category}</span>

          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase mb-3">Specyfikacja techniczna</h3>
            <div className="bg-slate-700/20 rounded-lg p-4">
              <Spec label="Pojemność baterii" value={device.battery_capacity} suffix=" mAh" />
              <Spec label="Czas pracy" value={device.battery_life_days} suffix=" dni" />
              <Spec label="Waga" value={device.weight_grams} suffix=" g" />
              <Spec label="Wymiary" value={device.dimensions} />
              <Spec label="Wodoodporność" value={device.water_resistance} />
              <Spec label="Ekran" value={device.screen_size} suffix='"' />
              <Spec label="Typ ekranu" value={device.screen_type} />
              <Spec label="Karta SIM" value={device.sim_type} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase mb-3">Łączność</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Feature label="GPS" value={device.has_gps} />
              <Feature label="WiFi" value={device.has_wifi} />
              <Feature label="Bluetooth" value={device.has_bluetooth} />
              <Feature label="LTE / 4G" value={device.has_lte} />
              <Feature label="NFC" value={device.has_nfc} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase mb-3">Zdrowie i fitness</h3>
            <div className="grid grid-cols-2 gap-2">
              <Feature label="Pulsometr" value={device.has_heart_rate} />
              <Feature label="Pomiar SpO2" value={device.has_blood_oxygen} />
              <Feature label="Monitoring snu" value={device.has_sleep_tracking} />
              <Feature label="Krokomierz" value={device.has_step_counter} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase mb-3">Komunikacja i bezpieczeństwo</h3>
            <div className="grid grid-cols-2 gap-2">
              <Feature label="Połączenia głosowe" value={device.has_voice_call} />
              <Feature label="Wideorozmowy" value={device.has_video_call} />
              <Feature label="Przycisk SOS" value={device.has_sos_button} />
              <Feature label="Geofence" value={device.has_geofence} />
              <Feature label="Zdalne wyłączanie" value={device.has_remote_shutdown} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase mb-3">Narzędzia</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Feature label="Budzik" value={device.has_alarm} />
              <Feature label="Stoper" value={device.has_stopwatch} />
              <Feature label="Timer" value={device.has_timer} />
              <Feature label="Kalkulator" value={device.has_calculator} />
              <Feature label="Latarka" value={device.has_flashlight} />
              <Feature label="Aparat" value={device.has_camera} />
            </div>
          </div>

          {(device.operating_system || device.compatible_with || device.price || device.release_year) && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 uppercase mb-3">Dodatkowe informacje</h3>
              <div className="bg-slate-700/20 rounded-lg p-4">
                <Spec label="System operacyjny" value={device.operating_system} />
                <Spec label="Kompatybilność" value={device.compatible_with} />
                <Spec label="Cena" value={device.price} suffix=" PLN" />
                <Spec label="Rok wydania" value={device.release_year} />
              </div>
            </div>
          )}

          {device.notes && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 uppercase mb-3">Notatki</h3>
              <div className="bg-slate-700/20 rounded-lg p-4"><p className="text-slate-300 whitespace-pre-wrap">{device.notes}</p></div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg"><Edit className="w-4 h-4" /> Edytuj</button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Zamknij</button>
        </div>
      </div>
    </div>
  )
}
