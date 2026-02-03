// src/components/devices/ManageFeaturesModal.tsx
import { useState } from 'react'
import { X, Plus, Edit, Trash2, Save, GripVertical } from 'lucide-react'
import { useDeviceFeatures, DeviceFeature } from '../../hooks/useDevices'

interface Props {
  onClose: () => void
}

const CATEGORIES = ['Podstawowe', 'Lokalizacja', 'Komunikacja', 'Kontrola', 'Multimedia', 'Bezpieczeństwo', 'Zdrowie', 'Inne']

export default function ManageFeaturesModal({ onClose }: Props) {
  const { features, featuresByCategory, addFeature, updateFeature, deleteFeature, refetch } = useDeviceFeatures()
  
  const [newFeatureName, setNewFeatureName] = useState('')
  const [newFeatureCategory, setNewFeatureCategory] = useState('Inne')
  const [editingFeature, setEditingFeature] = useState<DeviceFeature | null>(null)
  const [saving, setSaving] = useState(false)

  const handleAddFeature = async () => {
    if (!newFeatureName.trim()) return
    
    setSaving(true)
    try {
      await addFeature(newFeatureName.trim(), newFeatureCategory)
      setNewFeatureName('')
      setNewFeatureCategory('Inne')
    } catch (err: any) {
      alert('Błąd: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateFeature = async () => {
    if (!editingFeature || !editingFeature.label.trim()) return
    
    setSaving(true)
    try {
      await updateFeature(editingFeature.id, {
        label: editingFeature.label.trim(),
        category: editingFeature.category
      })
      setEditingFeature(null)
    } catch (err: any) {
      alert('Błąd: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFeature = async (feature: DeviceFeature) => {
    if (feature.is_default) {
      alert('Nie można usunąć domyślnej funkcji')
      return
    }
    
    if (!confirm(`Czy na pewno chcesz usunąć funkcję "${feature.label}"?`)) return
    
    try {
      await deleteFeature(feature.id)
    } catch (err: any) {
      alert('Błąd: ' + err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <h2 className="text-xl font-semibold text-slate-100">Zarządzaj funkcjami</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dodaj nową funkcję */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Dodaj nową funkcję</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="Nazwa funkcji"
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <select
                value={newFeatureCategory}
                onChange={(e) => setNewFeatureCategory(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={handleAddFeature}
                disabled={!newFeatureName.trim() || saving}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Dodaj
              </button>
            </div>
          </div>

          {/* Lista funkcji po kategoriach */}
          {CATEGORIES.map(category => {
            const catFeatures = featuresByCategory[category]
            if (!catFeatures || catFeatures.length === 0) return null
            
            return (
              <div key={category}>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                  {category} ({catFeatures.length})
                </h3>
                <div className="space-y-1">
                  {catFeatures.map((feature) => (
                    <div 
                      key={feature.id}
                      className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg group"
                    >
                      {editingFeature?.id === feature.id ? (
                        <>
                          <input
                            type="text"
                            value={editingFeature.label}
                            onChange={(e) => setEditingFeature({ ...editingFeature, label: e.target.value })}
                            className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100"
                            autoFocus
                          />
                          <select
                            value={editingFeature.category}
                            onChange={(e) => setEditingFeature({ ...editingFeature, category: e.target.value })}
                            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <button
                            onClick={handleUpdateFeature}
                            disabled={saving}
                            className="p-1.5 text-green-400 hover:bg-slate-600 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingFeature(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-600 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <GripVertical className="w-4 h-4 text-slate-600" />
                          <span className="flex-1 text-slate-200">{feature.label}</span>
                          {feature.is_default && (
                            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">domyślna</span>
                          )}
                          <button
                            onClick={() => setEditingFeature({ ...feature })}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!feature.is_default && (
                            <button
                              onClick={() => handleDeleteFeature(feature)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Info */}
          <div className="text-sm text-slate-500 bg-slate-700/20 rounded-lg p-3">
            <p>💡 <strong>Domyślne funkcje</strong> można edytować, ale nie usuwać.</p>
            <p className="mt-1">💡 <strong>Niestandardowe funkcje</strong> (dodane przez Ciebie) można w pełni edytować i usuwać.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center shrink-0">
          <span className="text-sm text-slate-400">
            Łącznie: {features.length} funkcji
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  )
}
