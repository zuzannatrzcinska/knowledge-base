// src/pages/DeviceComparator.tsx
import { useState, useMemo } from 'react'
import { Search, Plus, Filter, X, Check, Watch, ChevronDown, ChevronUp, Edit, Trash2, Eye, BarChart3 } from 'lucide-react'
import { useDevices, DeviceFilters, Device, DEVICE_FEATURES, DEVICE_SPECS } from '../hooks/useDevices'
import DeviceModal from '../components/devices/DeviceModal'
import DeviceDetailModal from '../components/devices/DeviceDetailModal'

export default function DeviceComparator() {
  const [filters, setFilters] = useState<DeviceFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [specSearch, setSpecSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set())
  const [compareMode, setCompareMode] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'spec'>('table')

  const activeFilters = useMemo(() => ({
    search: searchQuery || undefined,
    searchSpec: specSearch || undefined,
    features: selectedFeatures.length > 0 ? selectedFeatures : undefined
  }), [searchQuery, specSearch, selectedFeatures])

  const { devices, loading, error, createDevice, updateDevice, deleteDevice } = useDevices(activeFilters)

  const displayDevices = useMemo(() => {
    if (compareMode && selectedDevices.size > 0) return devices.filter(d => selectedDevices.has(d.id))
    return devices
  }, [devices, compareMode, selectedDevices])

  // Znajdź aktywny parametr do porównania
  const activeSpec = useMemo(() => {
    if (!specSearch) return null
    const spec = Object.entries(DEVICE_SPECS).find(([key, s]) => 
      s.label.toLowerCase().includes(specSearch.toLowerCase()) || key.toLowerCase().includes(specSearch.toLowerCase())
    )
    return spec ? { key: spec[0], ...spec[1] } : null
  }, [specSearch])

  // Sortowanie urządzeń po parametrze
  const sortedBySpec = useMemo(() => {
    if (!activeSpec) return displayDevices
    return [...displayDevices].sort((a, b) => {
      const aVal = a[activeSpec.key] ?? -Infinity
      const bVal = b[activeSpec.key] ?? -Infinity
      return bVal - aVal // od największego
    })
  }, [displayDevices, activeSpec])

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    )
  }

  const clearFilters = () => {
    setSelectedFeatures([])
    setSearchQuery('')
    setSpecSearch('')
  }

  const toggleDeviceSelection = (id: string) => {
    setSelectedDevices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleDelete = async (device: Device) => {
    if (!confirm(`Czy na pewno chcesz usunąć "${device.name}"?`)) return
    try { await deleteDevice(device.id) } catch (err: any) { alert('Błąd: ' + err.message) }
  }

  const handleSave = async (data: Partial<Device>) => {
    try {
      if (editingDevice) await updateDevice(editingDevice.id, data)
      else await createDevice(data)
      setShowAddModal(false)
      setEditingDevice(null)
    } catch (err: any) { alert('Błąd: ' + err.message) }
  }

  // Grupowanie funkcji po kategoriach
  const featuresByCategory = useMemo(() => {
    const grouped: Record<string, { key: string; label: string }[]> = {}
    Object.entries(DEVICE_FEATURES).forEach(([key, { label, category }]) => {
      if (!grouped[category]) grouped[category] = []
      grouped[category].push({ key, label })
    })
    return grouped
  }, [])

  const activeFilterCount = selectedFeatures.length + (specSearch ? 1 : 0)

  // Kolumny dla tabeli głównej
  const mainColumns = [
    { key: 'name', label: 'Nazwa' },
    { key: 'battery_mah', label: 'Bateria', unit: 'mAh' },
    { key: 'weight_grams', label: 'Waga', unit: 'g' },
    { key: 'memory_mb', label: 'Pamięć', unit: 'MB' },
    { key: 'network', label: 'Sieć' },
    { key: 'ip_rating', label: 'IP' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Watch className="w-7 h-7 text-cyan-400" />
            Porównywarka urządzeń
          </h1>
          <p className="text-slate-400 mt-1">Porównaj parametry zegarków i lokalizatorów</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium">
          <Plus className="w-4 h-4" /> Dodaj urządzenie
        </button>
      </header>

      {/* Search bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Szukaj urządzenia po nazwie..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" 
          />
        </div>
        <div className="relative">
          <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={specSearch} 
            onChange={(e) => setSpecSearch(e.target.value)} 
            placeholder="Porównaj parametr (np. bateria, waga, pamięć)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50" 
          />
          {activeSpec && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
              {activeSpec.label}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${activeFilterCount > 0 ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}>
          <Filter className="w-4 h-4" /> Filtruj po funkcjach
          {activeFilterCount > 0 && <span className="px-1.5 py-0.5 text-xs bg-cyan-500 text-white rounded-full">{activeFilterCount}</span>}
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {selectedDevices.size > 0 && (
          <button onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${compareMode ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}>
            <Eye className="w-4 h-4" /> {compareMode ? 'Pokaż wszystkie' : `Porównaj (${selectedDevices.size})`}
          </button>
        )}

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" /> Wyczyść filtry
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Filtruj po funkcjach</h3>
          {Object.entries(featuresByCategory).map(([category, features]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {features.map(({ key, label }) => {
                  const isActive = selectedFeatures.includes(key)
                  return (
                    <button key={key} onClick={() => toggleFeature(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${isActive ? 'bg-cyan-600/20 border border-cyan-500 text-cyan-400' : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                      {label} {isActive && <Check className="w-3 h-3 inline ml-1" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-400">
        {loading ? 'Ładowanie...' : `Znaleziono ${sortedBySpec.length} urządzeń`}
        {activeSpec && <span className="text-purple-400 ml-2">• Sortowanie po: {activeSpec.label}</span>}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>}

      {/* Spec comparison view */}
      {activeSpec && sortedBySpec.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-purple-500/10 border-b border-slate-700">
            <h3 className="font-medium text-purple-400">Porównanie: {activeSpec.label}</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {sortedBySpec.map((device, index) => {
                const value = device[activeSpec.key]
                const maxValue = Math.max(...sortedBySpec.map(d => d[activeSpec.key] || 0))
                const percentage = maxValue > 0 && value ? (value / maxValue) * 100 : 0
                
                return (
                  <div key={device.id} className="flex items-center gap-4">
                    <div className="w-8 text-center text-slate-500 text-sm">#{index + 1}</div>
                    <button onClick={() => setViewingDevice(device)} className="w-32 text-left text-slate-200 hover:text-cyan-400 truncate">
                      {device.name}
                    </button>
                    <div className="flex-1 h-8 bg-slate-700/50 rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                        {value != null ? `${value} ${activeSpec.unit}` : 'Brak danych'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      {!loading && sortedBySpec.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    <input type="checkbox" 
                      checked={selectedDevices.size === sortedBySpec.length && sortedBySpec.length > 0}
                      onChange={(e) => setSelectedDevices(e.target.checked ? new Set(sortedBySpec.map(d => d.id)) : new Set())} 
                      className="rounded border-slate-600" 
                    />
                  </th>
                  {mainColumns.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Funkcje</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sortedBySpec.map((device) => {
                  const featureCount = Object.keys(DEVICE_FEATURES).filter(k => device[k]).length
                  return (
                    <tr key={device.id} className={`hover:bg-slate-700/30 ${selectedDevices.has(device.id) ? 'bg-purple-500/10' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedDevices.has(device.id)} onChange={() => toggleDeviceSelection(device.id)} className="rounded border-slate-600" />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewingDevice(device)} className="font-medium text-slate-200 hover:text-cyan-400">
                          {device.name}
                        </button>
                      </td>
                      {mainColumns.slice(1).map(col => (
                        <td key={col.key} className="px-4 py-3 whitespace-nowrap text-slate-300">
                          {device[col.key] != null ? `${device[col.key]}${col.unit ? ` ${col.unit}` : ''}` : <span className="text-slate-500">−</span>}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                          {featureCount} funkcji
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewingDevice(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => setEditingDevice(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && sortedBySpec.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
          <Watch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">{activeFilterCount > 0 ? 'Brak urządzeń pasujących do filtrów' : 'Nie dodano jeszcze żadnych urządzeń'}</p>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium">
            <Plus className="w-4 h-4" /> Dodaj pierwsze urządzenie
          </button>
        </div>
      )}

      {/* Modals */}
      {(showAddModal || editingDevice) && <DeviceModal device={editingDevice} onSave={handleSave} onClose={() => { setShowAddModal(false); setEditingDevice(null) }} />}
      {viewingDevice && <DeviceDetailModal device={viewingDevice} onClose={() => setViewingDevice(null)} onEdit={() => { setEditingDevice(viewingDevice); setViewingDevice(null) }} />}
    </div>
  )
}
