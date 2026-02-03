// src/components/devices/DeviceDetailModal.tsx
import { useMemo } from 'react'
import { X, Edit, Watch, Check, Minus } from 'lucide-react'
import { Device, DEVICE_FEATURES, DEVICE_SPECS } from '../../hooks/useDevices'

interface Props {
  device: Device
  onClose: () => void
  onEdit: () => void
}

export default function DeviceDetailModal({ device, onClose, onEdit }: Props) {
  // Grupowanie funkcji po kategoriach
  const featuresByCategory = useMemo(() => {
    const grouped: Record<string, { key: string; label: string; hasFeature: boolean }[]> = {}
    Object.entries(DEVICE_FEATURES).forEach(([key, { label, category }]) => {
      if (!grouped[category]) grouped[category] = []
      grouped[category].push({ key, label, hasFeature: device[key] || false })
    })
    return grouped
  }, [device])

  // Liczenie funkcji
  const totalFeatures = Object.keys(DEVICE_FEATURES).length
  const activeFeatures = Object.keys(DEVICE_FEATURES).filter(k => device[k]).length

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Watch className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">{device.name}</h2>
              {device.model && device.model !== device.name && (
                <p className="text-sm text-slate-400">{device.model}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          {device.description && (
            <p className="text-slate-300">{device.description}</p>
          )}

          {/* Category & Stats */}
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm capitalize">
              {device.category}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
              {activeFeatures}/{totalFeatures} funkcji
            </span>
          </div>

          {/* Parametry techniczne */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Parametry techniczne
            </h3>
            <div className="bg-slate-700/20 rounded-lg divide-y divide-slate-700/50">
              {Object.entries(DEVICE_SPECS).map(([key, spec]) => {
                const value = device[key]
                if (value == null && value !== 0) return null
                return (
                  <div key={key} className="flex justify-between py-3 px-4">
                    <span className="text-slate-400">{spec.label}</span>
                    <span className="text-slate-200 font-medium">
                      {value}{spec.unit ? ` ${spec.unit}` : ''}
                    </span>
                  </div>
                )
              })}
              {Object.entries(DEVICE_SPECS).every(([key]) => device[key] == null) && (
                <div className="py-3 px-4 text-slate-500 text-center">
                  Brak danych technicznych
                </div>
              )}
            </div>
          </div>

          {/* Funkcje */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Funkcje urządzenia
            </h3>
            
            {Object.entries(featuresByCategory).map(([category, features]) => {
              const activeInCategory = features.filter(f => f.hasFeature).length
              if (activeInCategory === 0) return null
              
              return (
                <div key={category} className="mb-4">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    {category}
                    <span className="text-cyan-400">({activeInCategory})</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {features.filter(f => f.hasFeature).map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-slate-200 text-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Brakujące funkcje */}
            <details className="mt-4">
              <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-400">
                Pokaż brakujące funkcje ({totalFeatures - activeFeatures})
              </summary>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(DEVICE_FEATURES)
                  .filter(([key]) => !device[key])
                  .map(([key, { label }]) => (
                    <div key={key} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg">
                      <Minus className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-500 text-sm">{label}</span>
                    </div>
                  ))
                }
              </div>
            </details>
          </div>

          {/* Notatki */}
          {device.notes && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                Notatki
              </h3>
              <div className="bg-slate-700/20 rounded-lg p-4">
                <p className="text-slate-300 whitespace-pre-wrap">{device.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 shrink-0">
          <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg">
            <Edit className="w-4 h-4" /> Edytuj
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
            Zamknij
          </button>
        </div>
      </div>
    </div>
  )
}
