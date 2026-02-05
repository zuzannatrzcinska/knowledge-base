// src/components/devices/ManageFeaturesModal.tsx
import { useState } from 'react'
import { X, Plus, Edit, Trash2, Save, Settings, Sliders } from 'lucide-react'
import { useDeviceFeatures, useDeviceSpecs } from '../../hooks/useDevices'

interface Props {
  onClose: () => void
}

const SPEC_CATEGORIES = ['Zasilanie', 'Pamięć', 'Fizyczne', 'Łączność', 'Wyświetlacz', 'Hardware', 'Inne']
const FEATURE_CATEGORIES = ['Podstawowe', 'Lokalizacja', 'Komunikacja', 'Kontrola', 'Multimedia', 'Bezpieczeństwo', 'Zdrowie', 'Inne']

export default function ManageFeaturesModal({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'features' | 'specs'>('features')

  const { features, featuresByCategory, addFeature, updateFeature, deleteFeature } = useDeviceFeatures()
  const { specs, specsByCategory, addSpec, updateSpec, deleteSpec } = useDeviceSpecs()

  const [newFeatureLabel, setNewFeatureLabel] = useState('')
  const [newFeatureCategory, setNewFeatureCategory] = useState('Inne')
  const [editingFeature, setEditingFeature] = useState<any>(null)

  const [newSpecLabel, setNewSpecLabel] = useState('')
  const [newSpecUnit, setNewSpecUnit] = useState('')
  const [newSpecType, setNewSpecType] = useState<'number' | 'text'>('number')
  const [newSpecCategory, setNewSpecCategory] = useState('Inne')
  const [editingSpec, setEditingSpec] = useState<any>(null)

  const [saving, setSaving] = useState(false)

  const handleAddFeature = async () => {
    if (!newFeatureLabel.trim()) return
    setSaving(true)
    try {
      await addFeature(newFeatureLabel.trim(), newFeatureCategory)
      setNewFeatureLabel('')
    } catch (err: any) { alert('Błąd: ' + err.message) }
    finally { setSaving(false) }
  }

  const handleUpdateFeature = async () => {
    if (!editingFeature) return
    setSaving(true)
    try {
      await updateFeature(editingFeature.id, { label: editingFeature.label, category: editingFeature.category })
      setEditingFeature(null)
    } catch (err: any) { alert('Błąd: ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDeleteFeature = async (id: string, isDefault: boolean) => {
    if (isDefault) { alert('Nie można usunąć domyślnej funkcji'); return }
    if (!confirm('Usunąć?')) return
    try { await deleteFeature(id) } catch (err: any) { alert('Błąd: ' + err.message) }
  }

  const handleAddSpec = async () => {
    if (!newSpecLabel.trim()) return
    setSaving(true)
    try {
      await addSpec(newSpecLabel.trim(), newSpecUnit.trim(), newSpecType, newSpecCategory)
      setNewSpecLabel(''); setNewSpecUnit('')
    } catch (err: any) { alert('Błąd: ' + err.message) }
    finally { setSaving(false) }
  }

  const handleUpdateSpec = async () => {
    if (!editingSpec) return
    setSaving(true)
    try {
      await updateSpec(editingSpec.id, { label: editingSpec.label, unit: editingSpec.unit, data_type: editingSpec.data_type, category: editingSpec.category })
      setEditingSpec(null)
    } catch (err: any) { alert('Błąd: ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDeleteSpec = async (id: string, isDefault: boolean) => {
    if (isDefault) { alert('Nie można usunąć domyślnego parametru'); return }
    if (!confirm('Usunąć?')) return
    try { await deleteSpec(id) } catch (err: any) { alert('Błąd: ' + err.message) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" /> Zarządzaj
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex border-b border-slate-700 shrink-0">
          <button onClick={() => setActiveTab('features')} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium ${activeTab === 'features' ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px' : 'text-slate-400'}`}>
            <Settings className="w-4 h-4" /> Funkcje ({features.length})
          </button>
          <button onClick={() => setActiveTab('specs')} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium ${activeTab === 'specs' ? 'text-purple-400 border-b-2 border-purple-400 -mb-px' : 'text-slate-400'}`}>
            <Sliders className="w-4 h-4" /> Parametry ({specs.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'features' && (
            <>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Dodaj funkcję</h3>
                <div className="flex gap-2 flex-wrap">
                  <input type="text" value={newFeatureLabel} onChange={(e) => setNewFeatureLabel(e.target.value)} placeholder="Nazwa funkcji"
                    className="flex-1 min-w-[200px] px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100" />
                  <select value={newFeatureCategory} onChange={(e) => setNewFeatureCategory(e.target.value)} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100">
                    {FEATURE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={handleAddFeature} disabled={!newFeatureLabel.trim() || saving} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Dodaj
                  </button>
                </div>
              </div>
              {FEATURE_CATEGORIES.map(cat => {
                const items = featuresByCategory[cat]
                if (!items?.length) return null
                return (
                  <div key={cat}>
                    <h3 className="text-sm font-medium text-slate-400 uppercase mb-2">{cat} ({items.length})</h3>
                    <div className="space-y-1">
                      {items.map(f => (
                        <div key={f.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg group">
                          {editingFeature?.id === f.id ? (
                            <>
                              <input type="text" value={editingFeature.label} onChange={(e) => setEditingFeature({...editingFeature, label: e.target.value})} className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100" />
                              <select value={editingFeature.category} onChange={(e) => setEditingFeature({...editingFeature, category: e.target.value})} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100">
                                {FEATURE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <button onClick={handleUpdateFeature} className="p-1.5 text-green-400 hover:bg-slate-600 rounded"><Save className="w-4 h-4" /></button>
                              <button onClick={() => setEditingFeature(null)} className="p-1.5 text-slate-400 hover:bg-slate-600 rounded"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-slate-200">{f.label}</span>
                              {f.is_default && <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">domyślna</span>}
                              <button onClick={() => setEditingFeature({...f})} className="p-1.5 text-slate-400 hover:text-cyan-400 rounded opacity-0 group-hover:opacity-100"><Edit className="w-4 h-4" /></button>
                              {!f.is_default && <button onClick={() => handleDeleteFeature(f.id, f.is_default)} className="p-1.5 text-slate-400 hover:text-red-400 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {activeTab === 'specs' && (
            <>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-300 mb-3">Dodaj parametr</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={newSpecLabel} onChange={(e) => setNewSpecLabel(e.target.value)} placeholder="Nazwa (np. Bateria)" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100" />
                  <input type="text" value={newSpecUnit} onChange={(e) => setNewSpecUnit(e.target.value)} placeholder="Jednostka (np. mAh)" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100" />
                  <select value={newSpecType} onChange={(e) => setNewSpecType(e.target.value as 'number'|'text')} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100">
                    <option value="number">Liczba (do wykresów)</option>
                    <option value="text">Tekst</option>
                  </select>
                  <select value={newSpecCategory} onChange={(e) => setNewSpecCategory(e.target.value)} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100">
                    {SPEC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={handleAddSpec} disabled={!newSpecLabel.trim() || saving} className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 rounded-lg font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Dodaj
                </button>
              </div>
              {SPEC_CATEGORIES.map(cat => {
                const items = specsByCategory[cat]
                if (!items?.length) return null
                return (
                  <div key={cat}>
                    <h3 className="text-sm font-medium text-slate-400 uppercase mb-2">{cat} ({items.length})</h3>
                    <div className="space-y-1">
                      {items.map(s => (
                        <div key={s.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg group">
                          {editingSpec?.id === s.id ? (
                            <>
                              <input type="text" value={editingSpec.label} onChange={(e) => setEditingSpec({...editingSpec, label: e.target.value})} className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100" />
                              <input type="text" value={editingSpec.unit} onChange={(e) => setEditingSpec({...editingSpec, unit: e.target.value})} placeholder="Jednostka" className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100" />
                              <select value={editingSpec.data_type} onChange={(e) => setEditingSpec({...editingSpec, data_type: e.target.value})} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100">
                                <option value="number">Liczba</option>
                                <option value="text">Tekst</option>
                              </select>
                              <button onClick={handleUpdateSpec} className="p-1.5 text-green-400 hover:bg-slate-600 rounded"><Save className="w-4 h-4" /></button>
                              <button onClick={() => setEditingSpec(null)} className="p-1.5 text-slate-400 hover:bg-slate-600 rounded"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-slate-200">{s.label} {s.unit && <span className="text-slate-500">({s.unit})</span>}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${s.data_type === 'number' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{s.data_type === 'number' ? 'Liczba' : 'Tekst'}</span>
                              {s.is_default && <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">domyślny</span>}
                              <button onClick={() => setEditingSpec({...s})} className="p-1.5 text-slate-400 hover:text-purple-400 rounded opacity-0 group-hover:opacity-100"><Edit className="w-4 h-4" /></button>
                              {!s.is_default && <button onClick={() => handleDeleteSpec(s.id, s.is_default)} className="p-1.5 text-slate-400 hover:text-red-400 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center shrink-0">
          <span className="text-sm text-slate-400">{features.length} funkcji • {specs.length} parametrów</span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Zamknij</button>
        </div>
      </div>
    </div>
  )
}
