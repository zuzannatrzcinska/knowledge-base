// src/components/devices/DeviceModal.tsx
import { useState, useEffect } from 'react'
import { X, Save, Watch, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Device, DeviceSpec, DeviceFeature, useDeviceSpecs, useDeviceFeatures } from '../../hooks/useDevices'

interface Props {
  device?: Device | null
  specs: DeviceSpec[]
  specsByCategory: Record<string, DeviceSpec[]>
  features: DeviceFeature[]
  featuresByCategory: Record<string, DeviceFeature[]>
  onSave: (deviceData: any, specValues: Record<string, any>, featureValues: Record<string, boolean>) => Promise<void>
  onClose: () => void
  onSpecsChange: () => void
  onFeaturesChange: () => void
}

const SPEC_CATEGORIES = ['Zasilanie', 'Pamięć', 'Fizyczne', 'Łączność', 'Wyświetlacz', 'Hardware', 'Inne']
const FEATURE_CATEGORIES = ['Podstawowe', 'Lokalizacja', 'Komunikacja', 'Kontrola', 'Multimedia', 'Bezpieczeństwo', 'Zdrowie', 'Inne']

export default function DeviceModal({ 
  device, specs, specsByCategory, features, featuresByCategory, 
  onSave, onClose, onSpecsChange, onFeaturesChange 
}: Props) {
  const { addSpec } = useDeviceSpecs()
  const { addFeature } = useDeviceFeatures()

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'features'>('basic')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([...SPEC_CATEGORIES, ...FEATURE_CATEGORIES]))

  // Formularz podstawowy
  const [formData, setFormData] = useState({
    name: device?.name || '',
    model: device?.model || '',
    category: device?.category || 'zegarek',
    description: device?.description || '',
    notes: device?.notes || '',
  })

  // Wartości parametrów
  const [specValues, setSpecValues] = useState<Record<string, any>>({})
  
  // Wartości funkcji
  const [featureValues, setFeatureValues] = useState<Record<string, boolean>>({})

  // Dodawanie nowego parametru
  const [showAddSpec, setShowAddSpec] = useState(false)
  const [newSpecLabel, setNewSpecLabel] = useState('')
  const [newSpecUnit, setNewSpecUnit] = useState('')
  const [newSpecType, setNewSpecType] = useState<'number' | 'text'>('number')
  const [newSpecCategory, setNewSpecCategory] = useState('Inne')

  // Dodawanie nowej funkcji
  const [showAddFeature, setShowAddFeature] = useState(false)
  const [newFeatureLabel, setNewFeatureLabel] = useState('')
  const [newFeatureCategory, setNewFeatureCategory] = useState('Inne')

  // Inicjalizacja wartości przy zmianie device lub specs/features
  useEffect(() => {
    const newSpecValues: Record<string, any> = {}
    specs.forEach(s => {
      newSpecValues[s.key] = device?.specs?.[s.key] ?? ''
    })
    setSpecValues(newSpecValues)

    const newFeatureValues: Record<string, boolean> = {}
    features.forEach(f => {
      newFeatureValues[f.key] = device?.features?.[f.key] ?? false
    })
    setFeatureValues(newFeatureValues)
  }, [device, specs, features])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) newSet.delete(category)
      else newSet.add(category)
      return newSet
    })
  }

  const handleAddSpec = async () => {
    if (!newSpecLabel.trim()) return
    try {
      const newSpec = await addSpec(newSpecLabel.trim(), newSpecUnit.trim(), newSpecType, newSpecCategory)
      setSpecValues(prev => ({ ...prev, [newSpec.key]: '' }))
      setNewSpecLabel('')
      setNewSpecUnit('')
      setNewSpecType('number')
      setNewSpecCategory('Inne')
      setShowAddSpec(false)
      onSpecsChange()
    } catch (err: any) {
      alert('Błąd: ' + err.message)
    }
  }

  const handleAddFeature = async () => {
    if (!newFeatureLabel.trim()) return
    try {
      const newFeature = await addFeature(newFeatureLabel.trim(), newFeatureCategory)
      setFeatureValues(prev => ({ ...prev, [newFeature.key]: true }))
      setNewFeatureLabel('')
      setNewFeatureCategory('Inne')
      setShowAddFeature(false)
      onFeaturesChange()
    } catch (err: any) {
      alert('Błąd: ' + err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Nazwa jest wymagana')
      return
    }
    setSaving(true)
    try {
      await onSave(formData, specValues, featureValues)
    } finally {
      setSaving(false)
    }
  }

  const filledSpecsCount = Object.entries(specValues).filter(([_, v]) => v !== '' && v != null).length
  const selectedFeaturesCount = Object.values(featureValues).filter(Boolean).length

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
          <button onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'basic' ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px' : 'text-slate-400 hover:text-slate-200'}`}>
            Podstawowe
          </button>
          <button onClick={() => setActiveTab('specs')}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'specs' ? 'text-purple-400 border-b-2 border-purple-400 -mb-px' : 'text-slate-400 hover:text-slate-200'}`}>
            Parametry ({filledSpecsCount}/{specs.length})
          </button>
          <button onClick={() => setActiveTab('features')}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'features' ? 'text-green-400 border-b-2 border-green-400 -mb-px' : 'text-slate-400 hover:text-slate-200'}`}>
            Funkcje ({selectedFeaturesCount}/{features.length})
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">

            {/* TAB: Podstawowe */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Nazwa urządzenia *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="np. GJD.08" className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Model</label>
                    <input type="text" value={formData.model} onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="np. GJD.08 Pro" className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategoria</label>
                  <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100">
                    <option value="zegarek">Zegarek</option>
                    <option value="lokalizator">Lokalizator</option>
                    <option value="inne">Inne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Opis</label>
                  <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3} placeholder="Krótki opis urządzenia..." className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Notatki</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3} placeholder="Notatki wewnętrzne..." className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 resize-none" />
                </div>
              </div>
            )}

            {/* TAB: Parametry */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                {/* Dodaj nowy parametr */}
                {!showAddSpec ? (
                  <button type="button" onClick={() => setShowAddSpec(true)}
                    className="w-full p-3 border-2 border-dashed border-purple-500/30 rounded-lg text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Dodaj nowy parametr techniczny
                  </button>
                ) : (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-300 mb-3">Nowy parametr</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={newSpecLabel} onChange={(e) => setNewSpecLabel(e.target.value)}
                        placeholder="Nazwa (np. Pojemność baterii)" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm" />
                      <input type="text" value={newSpecUnit} onChange={(e) => setNewSpecUnit(e.target.value)}
                        placeholder="Jednostka (np. mAh)" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm" />
                      <select value={newSpecType} onChange={(e) => setNewSpecType(e.target.value as 'number' | 'text')}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm">
                        <option value="number">Liczba (do porównań)</option>
                        <option value="text">Tekst</option>
                      </select>
                      <select value={newSpecCategory} onChange={(e) => setNewSpecCategory(e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm">
                        {SPEC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={handleAddSpec} disabled={!newSpecLabel.trim()}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 rounded text-sm font-medium">
                        Dodaj
                      </button>
                      <button type="button" onClick={() => setShowAddSpec(false)} className="px-3 py-1.5 text-slate-400 hover:text-slate-200">
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista parametrów */}
                {SPEC_CATEGORIES.map(category => {
                  const catSpecs = specsByCategory[category]
                  if (!catSpecs || catSpecs.length === 0) return null
                  const isExpanded = expandedCategories.has(category)

                  return (
                    <div key={category} className="border border-slate-700 rounded-lg overflow-hidden">
                      <button type="button" onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/30 hover:bg-slate-700/50">
                        <span className="font-medium text-slate-200">{category}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {catSpecs.map(spec => (
                            <div key={spec.key}>
                              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                {spec.label} {spec.unit && <span className="text-slate-500">({spec.unit})</span>}
                              </label>
                              <input
                                type="text"
                                inputMode={spec.data_type === 'number' ? 'numeric' : 'text'}
                                value={specValues[spec.key] ?? ''}
                                onChange={(e) => setSpecValues(prev => ({ ...prev, [spec.key]: e.target.value }))}
                                placeholder={spec.data_type === 'number' ? '0' : ''}
                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* TAB: Funkcje */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                {/* Dodaj nową funkcję */}
                {!showAddFeature ? (
                  <button type="button" onClick={() => setShowAddFeature(true)}
                    className="w-full p-3 border-2 border-dashed border-green-500/30 rounded-lg text-green-400 hover:border-green-500/50 hover:bg-green-500/10 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Dodaj nową funkcję
                  </button>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-300 mb-3">Nowa funkcja</h4>
                    <div className="flex gap-2">
                      <input type="text" value={newFeatureLabel} onChange={(e) => setNewFeatureLabel(e.target.value)}
                        placeholder="Nazwa funkcji" className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm" />
                      <select value={newFeatureCategory} onChange={(e) => setNewFeatureCategory(e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm">
                        {FEATURE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={handleAddFeature} disabled={!newFeatureLabel.trim()}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 rounded text-sm font-medium">
                        Dodaj i zaznacz
                      </button>
                      <button type="button" onClick={() => setShowAddFeature(false)} className="px-3 py-1.5 text-slate-400 hover:text-slate-200">
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista funkcji */}
                {FEATURE_CATEGORIES.map(category => {
                  const catFeatures = featuresByCategory[category]
                  if (!catFeatures || catFeatures.length === 0) return null
                  const isExpanded = expandedCategories.has(category)
                  const selectedInCat = catFeatures.filter(f => featureValues[f.key]).length

                  return (
                    <div key={category} className="border border-slate-700 rounded-lg overflow-hidden">
                      <button type="button" onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/30 hover:bg-slate-700/50">
                        <span className="font-medium text-slate-200">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${selectedInCat > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                            {selectedInCat}/{catFeatures.length}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {catFeatures.map(feature => (
                            <label key={feature.key}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                featureValues[feature.key]
                                  ? 'bg-green-500/20 border border-green-500/50'
                                  : 'bg-slate-700/30 border border-transparent hover:bg-slate-700/50'
                              }`}>
                              <input type="checkbox" checked={featureValues[feature.key] || false}
                                onChange={(e) => setFeatureValues(prev => ({ ...prev, [feature.key]: e.target.checked }))}
                                className="w-5 h-5 rounded border-slate-600 text-green-500" />
                              <span className={featureValues[feature.key] ? 'text-green-400' : 'text-slate-300'}>
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
                  <button type="button" onClick={() => {
                    const newValues: Record<string, boolean> = {}
                    features.forEach(f => newValues[f.key] = true)
                    setFeatureValues(newValues)
                  }} className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300">
                    Zaznacz wszystkie
                  </button>
                  <button type="button" onClick={() => {
                    const newValues: Record<string, boolean> = {}
                    features.forEach(f => newValues[f.key] = false)
                    setFeatureValues(newValues)
                  }} className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300">
                    Odznacz wszystkie
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50 shrink-0">
            <div className="text-sm text-slate-400">
              {filledSpecsCount} parametrów • {selectedFeaturesCount} funkcji
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
