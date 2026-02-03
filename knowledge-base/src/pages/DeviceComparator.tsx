// src/pages/DeviceComparator.tsx
import { useState, useMemo } from 'react'
import { Search, Plus, Filter, X, Check, Watch, Battery, Wifi, MapPin, Phone, Heart, Bell, Shield, ChevronDown, ChevronUp, Edit, Trash2, Eye } from 'lucide-react'
import { useDevices, DeviceFilters, Device } from '../hooks/useDevices'
import DeviceModal from '../components/devices/DeviceModal'
import DeviceDetailModal from '../components/devices/DeviceDetailModal'

const FEATURE_FILTERS = [
  { key: 'has_gps', label: 'GPS', icon: MapPin },
  { key: 'has_wifi', label: 'WiFi', icon: Wifi },
  { key: 'has_lte', label: 'LTE/4G', icon: Phone },
  { key: 'has_heart_rate', label: 'Pulsometr', icon: Heart },
  { key: 'has_alarm', label: 'Budzik', icon: Bell },
  { key: 'has_sos_button', label: 'Przycisk SOS', icon: Shield },
  { key: 'has_geofence', label: 'Geofence', icon: MapPin },
  { key: 'has_voice_call', label: 'Połączenia', icon: Phone },
]

const TABLE_COLUMNS = [
  { key: 'name', label: 'Nazwa', type: 'text' },
  { key: 'battery_life_days', label: 'Bateria (dni)', type: 'number', suffix: ' dni' },
  { key: 'weight_grams', label: 'Waga (g)', type: 'number', suffix: 'g' },
  { key: 'water_resistance', label: 'Wodoodporność', type: 'text' },
  { key: 'has_gps', label: 'GPS', type: 'boolean' },
  { key: 'has_wifi', label: 'WiFi', type: 'boolean' },
  { key: 'has_lte', label: 'LTE', type: 'boolean' },
  { key: 'has_heart_rate', label: 'Pulsometr', type: 'boolean' },
  { key: 'has_alarm', label: 'Budzik', type: 'boolean' },
  { key: 'has_sos_button', label: 'SOS', type: 'boolean' },
  { key: 'has_geofence', label: 'Geofence', type: 'boolean' },
  { key: 'has_voice_call', label: 'Połączenia', type: 'boolean' },
]

export default function DeviceComparator() {
  const [filters, setFilters] = useState<DeviceFilters>({})
  const [showFilters, setShowFilters] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null)
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set())
  const [compareMode, setCompareMode] = useState(false)

  const activeFilters = useMemo(() => ({ ...filters, search: searchQuery || undefined }), [filters, searchQuery])
  const { devices, loading, error, createDevice, updateDevice, deleteDevice } = useDevices(activeFilters)

  const displayDevices = useMemo(() => {
    if (compareMode && selectedDevices.size > 0) return devices.filter(d => selectedDevices.has(d.id))
    return devices
  }, [devices, compareMode, selectedDevices])

  const toggleFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      if ((newFilters as any)[key] === true) delete (newFilters as any)[key]
      else (newFilters as any)[key] = true
      return newFilters
    })
  }

  const clearFilters = () => { setFilters({}); setSearchQuery('') }
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

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Szukaj urządzenia..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${activeFilterCount > 0 ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}>
          <Filter className="w-4 h-4" /> Filtry
          {activeFilterCount > 0 && <span className="px-1.5 py-0.5 text-xs bg-cyan-500 text-white rounded-full">{activeFilterCount}</span>}
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {selectedDevices.size > 0 && (
          <button onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${compareMode ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}>
            <Eye className="w-4 h-4" /> {compareMode ? 'Pokaż wszystkie' : `Porównaj (${selectedDevices.size})`}
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">Filtruj według funkcji</h3>
            {activeFilterCount > 0 && <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"><X className="w-3 h-3" /> Wyczyść</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {FEATURE_FILTERS.map(filter => {
              const Icon = filter.icon
              const isActive = (filters as any)[filter.key] === true
              return (
                <button key={filter.key} onClick={() => toggleFilter(filter.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${isActive ? 'bg-cyan-600/20 border border-cyan-500 text-cyan-400' : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                  <Icon className="w-4 h-4" /> {filter.label} {isActive && <Check className="w-3 h-3" />}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-slate-400" />
              <label className="text-sm text-slate-400">Min. bateria:</label>
              <input type="number" min="0" value={filters.min_battery_days || ''} onChange={(e) => setFilters(prev => ({ ...prev, min_battery_days: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="dni" className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">⚖️</span>
              <label className="text-sm text-slate-400">Max. waga:</label>
              <input type="number" min="0" value={filters.max_weight || ''} onChange={(e) => setFilters(prev => ({ ...prev, max_weight: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="gram" className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100" />
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-slate-400">{loading ? 'Ładowanie...' : `Znaleziono ${displayDevices.length} urządzeń`}</div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>}

      {!loading && displayDevices.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    <input type="checkbox" checked={selectedDevices.size === displayDevices.length && displayDevices.length > 0}
                      onChange={(e) => setSelectedDevices(e.target.checked ? new Set(displayDevices.map(d => d.id)) : new Set())} className="rounded border-slate-600" />
                  </th>
                  {TABLE_COLUMNS.map(col => <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase whitespace-nowrap">{col.label}</th>)}
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {displayDevices.map((device) => (
                  <tr key={device.id} className={`hover:bg-slate-700/30 ${selectedDevices.has(device.id) ? 'bg-purple-500/10' : ''}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedDevices.has(device.id)} onChange={() => toggleDeviceSelection(device.id)} className="rounded border-slate-600" /></td>
                    {TABLE_COLUMNS.map(col => (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                        {col.type === 'boolean' ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${(device as any)[col.key] ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                            {(device as any)[col.key] ? '✓' : '−'}
                          </span>
                        ) : col.key === 'name' ? (
                          <button onClick={() => setViewingDevice(device)} className="font-medium text-slate-200 hover:text-cyan-400">{device.name}</button>
                        ) : (
                          <span className="text-slate-300">{(device as any)[col.key] != null ? `${(device as any)[col.key]}${col.suffix || ''}` : <span className="text-slate-500">−</span>}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewingDevice(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setEditingDevice(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && displayDevices.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
          <Watch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">{activeFilterCount > 0 ? 'Brak urządzeń pasujących do filtrów' : 'Nie dodano jeszcze żadnych urządzeń'}</p>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium">
            <Plus className="w-4 h-4" /> Dodaj pierwsze urządzenie
          </button>
        </div>
      )}

      {(showAddModal || editingDevice) && <DeviceModal device={editingDevice} onSave={handleSave} onClose={() => { setShowAddModal(false); setEditingDevice(null) }} />}
      {viewingDevice && <DeviceDetailModal device={viewingDevice} onClose={() => setViewingDevice(null)} onEdit={() => { setEditingDevice(viewingDevice); setViewingDevice(null) }} />}
    </div>
  )
}
