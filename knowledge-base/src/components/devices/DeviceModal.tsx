// src/components/devices/DeviceModal.tsx
import { useState } from 'react'
import { X, Save, Watch, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Device, DeviceFeature, DEVICE_SPECS } from '../../hooks/useDevices'

interface DeviceModalProps {
  device?: Device | null
  features: DeviceFeature[]
  featuresByCategory: Record<string, DeviceFeature[]>
  onSave: (data: Partial<Device>) => Promise<void>
  onClose: () => void
}

export default function DeviceModal({ device, features, featuresByCategory, onSave, onClose }: DeviceModalProps) {
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'features'>('basic')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(featuresByCategory)))
  
  // Inicjalizacja formData
  const [formData, setFormData] = useState<Partial<Device>>(() => {
    const initial: Partial<Device> = {
      name: device?.name || '',
      model: device?.model || '',
      category: device?.category || 'zegarek',
      description: device?.description || '',
      notes: device?.notes || '',
    }
    
    // Dodaj wszystkie specs
    Object.keys(DEVICE_SPECS).forEach(key => {
      initial[key] = device?.[key] ?? null
    })
    
    // Dodaj wszystkie features
    features.forEach(f => {
      initial[f.key] = device?.[f.key] ?? false
    })
    
    return initial
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) { 
      alert('Nazwa jest wymagana')
      return 
    }
    setSaving(true)
    try { 
      await onSave(formData) 
    } finally { 
      setSaving(false) 
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) newSet.delete(category)
      else newSet.add(category)
      return newSet
    })
  }

  // Liczenie zaznaczonych funkcji
  const selectedFeaturesCount = features.filter(f => formData[f.key]).length

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Watch className="w-5 h-5 text-cyan-400" /> 
            {device ? 'Edytuj urządzenie' : 'Dodaj urządzenie'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0">
          {[
            { id: 'basic', label: 'Podstawowe' },
            { id: 'specs', label: 'Parametry techniczne' },
            { id: 'features', label: `Funkcje (${selectedFeaturesCount}/${features.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Tab: Podstawowe */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Nazwa urządzenia *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="np. GJD.08"
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Model</label>
                    <input
                      type="text"
                      value={formData.model || ''}
                      onChange={(e) => updateField('model', e.target.value)}
                      placeholder="np. GJD.08 Pro"
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategoria</label>
                  <select
                    value={formData.category || 'zegarek'}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="zegarek">Zegarek</option>
                    <option value="lokalizator">Lokalizator</option>
                    <option value="inne">Inne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Opis</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Krótki opis urządzenia..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Notatki wewnętrzne</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Dodatkowe uwagi..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            )}

            {/* Tab: Parametry techniczne */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400 mb-4">
                  Wprowadź parametry techniczne urządzenia. Możesz później porównywać i filtrować urządzenia po tych parametrach.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(DEVICE_SPECS).map(([key, spec]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        {spec.label} {spec.unit && <span className="text-slate-500">({spec.unit})</span>}
                      </label>
                      {spec.type === 'number' ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formData[key] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                              updateField(key, val === '' ? null : parseFloat(val))
                            }
                          }}
                          placeholder={`np. ${key === 'battery_mah' ? '680' : key === 'weight_grams' ? '45' : key === 'ram_mb' ? '128' : key === 'rom_mb' ? '256' : '0'}`}
                          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData[key] || ''}
                          onChange={(e) => updateField(key, e.target.value || null)}
                          placeholder={key === 'network' ? 'np. 2G/3G/4G LTE' : key === 'ip_rating' ? 'np. IP67' : key === 'screen_size' ? 'np. 1.4"' : key === 'screen_resolution' ? 'np. 240x240' : ''}
                          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Funkcje */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400 mb-4">
                  Zaznacz funkcje dostępne w tym urządzeniu. Kliknij na kategorię, aby ją rozwinąć/zwinąć.
                </p>
                
                {Object.entries(featuresByCategory).map(([category, catFeatures]) => {
                  const isExpanded = expandedCategories.has(category)
                  const selectedInCategory = catFeatures.filter(f => formData[f.key]).length
                  
                  return (
                    <div key={category} className="border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                      >
                        <span className="font-medium text-slate-200">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${selectedInCategory > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {selectedInCategory}/{catFeatures.length}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {catFeatures.map((feature) => (
                            <label 
                              key={feature.key}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                formData[feature.key] 
                                  ? 'bg-cyan-500/20 border border-cyan-500/50' 
                                  : 'bg-slate-700/30 border border-transparent hover:bg-slate-700/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData[feature.key] || false}
                                onChange={(e) => updateField(feature.key, e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500/50"
                              />
                              <span className={formData[feature.key] ? 'text-cyan-400' : 'text-slate-300'}>
                                {feature.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Quick actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => features.forEach(f => updateField(f.key, true))}
                    className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                  >
                    Zaznacz wszystkie
                  </button>
                  <button
                    type="button"
                    onClick={() => features.forEach(f => updateField(f.key, false))}
                    className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                  >
                    Odznacz wszystkie
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50 shrink-0">
            <div className="text-sm text-slate-400">
              {selectedFeaturesCount} / {features.length} funkcji zaznaczonych
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg">
                Anuluj
              </button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg font-medium">
                <Save className="w-4 h-4" /> {saving ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
