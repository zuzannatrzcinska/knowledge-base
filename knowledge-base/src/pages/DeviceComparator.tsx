// src/pages/DeviceComparator.tsx
import { useState, useMemo } from 'react'
import { Search, Plus, Filter, X, Check, Watch, ChevronDown, ChevronUp, Edit, Trash2, Eye, BarChart3, Settings } from 'lucide-react'
import { useDevices, useDeviceFeatures, useDeviceSpecs, Device } from '../hooks/useDevices'
import DeviceModal from '../components/devices/DeviceModal'
import DeviceDetailModal from '../components/devices/DeviceDetailModal'
import ManageFeaturesModal from '../components/devices/ManageFeaturesModal'

export default function DeviceComparator() {
  // Dane z hooków
  const { devices, loading, error, createDevice, updateDevice, deleteDevice, refetch } = useDevices()
  const { features, featuresByCategory, refetch: refetchFeatures } = useDeviceFeatures()
  const { specs, specsByCategory, refetch: refetchSpecs } = useDeviceSpecs()

  // Stan UI
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [specSearchQuery, setSpecSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null)
  const [showManageFeatures, setShowManageFeatures] = useState(false)
  
  // Filtry
  const [selectedFeatureFilters, setSelectedFeatureFilters] = useState<string[]>([])
  const [specRangeFilters, setSpecRangeFilters] = useState<Record<string, { min?: number; max?: number }>>({})
  
  // Porównanie
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(new Set())
  const [compareMode, setCompareMode] = useState(false)

  // ==================== WYSZUKIWANIE PARAMETRU/FUNKCJI ====================
  // Znajdź parametr pasujący do wyszukiwania (po label lub key)
  const matchedSpec = useMemo(() => {
    if (!specSearchQuery.trim()) return null
    
    const query = specSearchQuery.toLowerCase().trim()
    
    // Szukaj dokładnego lub częściowego dopasowania
    return specs.find(s => 
      s.label.toLowerCase().includes(query) || 
      s.key.toLowerCase().includes(query) ||
      // Dodatkowe aliasy dla popularnych wyszukiwań
      (query === 'bateria' && s.key === 'battery_mah') ||
      (query === 'pamięć' && (s.key === 'ram' || s.key === 'rom')) ||
      (query === 'memory' && (s.key === 'ram' || s.key === 'rom'))
    )
  }, [specSearchQuery, specs])

  // Znajdź funkcję pasującą do wyszukiwania (po label lub key)
  const matchedFeature = useMemo(() => {
    if (!specSearchQuery.trim() || matchedSpec) return null // Priorytet dla parametrów
    
    const query = specSearchQuery.toLowerCase().trim()
    
    return features.find(f => 
      f.label.toLowerCase().includes(query) || 
      f.key.toLowerCase().includes(query)
    )
  }, [specSearchQuery, features, matchedSpec])

  // ==================== FILTROWANIE URZĄDZEŃ ====================
  const filteredDevices = useMemo(() => {
    let result = [...devices]

    // Filtruj po nazwie
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.model?.toLowerCase().includes(query)
      )
    }

    // Filtruj po wybranych funkcjach (urządzenie musi mieć WSZYSTKIE wybrane)
    if (selectedFeatureFilters.length > 0) {
      result = result.filter(d => 
        selectedFeatureFilters.every(fKey => d.features[fKey] === true)
      )
    }

    // Filtruj po zakresach parametrów
    Object.entries(specRangeFilters).forEach(([specKey, range]) => {
      if (range.min !== undefined || range.max !== undefined) {
        result = result.filter(d => {
          const value = d.specs[specKey]
          if (value == null) return false
          if (range.min !== undefined && value < range.min) return false
          if (range.max !== undefined && value > range.max) return false
          return true
        })
      }
    })

    // Jeśli wyszukujemy parametr, filtruj tylko urządzenia które go mają
    if (matchedSpec) {
      result = result.filter(d => d.specs[matchedSpec.key] != null)
    }

    // Jeśli wyszukujemy funkcję, nie filtrujemy - pokaż wszystkie urządzenia
    // (później w tabeli pokażemy które mają a które nie)

    return result
  }, [devices, searchQuery, selectedFeatureFilters, specRangeFilters, matchedSpec])

  // ==================== SORTOWANIE PO PARAMETRZE/FUNKCJI ====================
  const sortedDevices = useMemo(() => {
    // Jeśli wyszukujemy parametr numeryczny, sortuj po nim
    if (matchedSpec && matchedSpec.data_type === 'number') {
      return [...filteredDevices].sort((a, b) => {
        const aVal = a.specs[matchedSpec.key] ?? -Infinity
        const bVal = b.specs[matchedSpec.key] ?? -Infinity
        return bVal - aVal // Od największego do najmniejszego
      })
    }
    
    // Jeśli wyszukujemy funkcję, sortuj: najpierw które mają, potem które nie mają
    if (matchedFeature) {
      return [...filteredDevices].sort((a, b) => {
        const aHas = a.features[matchedFeature.key] === true ? 1 : 0
        const bHas = b.features[matchedFeature.key] === true ? 1 : 0
        return bHas - aHas
      })
    }
    
    return filteredDevices
  }, [filteredDevices, matchedSpec, matchedFeature])

  // ==================== WIDOK PORÓWNANIA ====================
  const displayDevices = useMemo(() => {
    if (compareMode && selectedDeviceIds.size > 0) {
      return sortedDevices.filter(d => selectedDeviceIds.has(d.id))
    }
    return sortedDevices
  }, [sortedDevices, compareMode, selectedDeviceIds])

  // ==================== AKCJE ====================
  const toggleFeatureFilter = (featureKey: string) => {
    setSelectedFeatureFilters(prev => 
      prev.includes(featureKey) 
        ? prev.filter(k => k !== featureKey) 
        : [...prev, featureKey]
    )
  }

  const clearAllFilters = () => {
    setSelectedFeatureFilters([])
    setSpecRangeFilters({})
    setSearchQuery('')
    setSpecSearchQuery('')
  }

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDeviceIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(deviceId)) newSet.delete(deviceId)
      else newSet.add(deviceId)
      return newSet
    })
  }

  const handleDeleteDevice = async (device: Device) => {
    if (!confirm(`Czy na pewno chcesz usunąć "${device.name}"?`)) return
    try {
      await deleteDevice(device.id)
    } catch (err: any) {
      alert('Błąd: ' + err.message)
    }
  }

  const handleSaveDevice = async (
    deviceData: { name: string; model?: string; category?: string; description?: string; notes?: string },
    specValues: Record<string, any>,
    featureValues: Record<string, boolean>
  ) => {
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.id, deviceData, specValues, featureValues)
      } else {
        await createDevice(deviceData, specValues, featureValues)
      }
      setShowAddModal(false)
      setEditingDevice(null)
    } catch (err: any) {
      alert('Błąd: ' + err.message)
    }
  }

  const handleManageClose = () => {
    setShowManageFeatures(false)
    refetchFeatures()
    refetchSpecs()
    refetch()
  }

  // Licznik aktywnych filtrów
  const activeFilterCount = selectedFeatureFilters.length + 
    Object.values(specRangeFilters).filter(r => r.min !== undefined || r.max !== undefined).length

  // Kolumny tabeli (główne parametry numeryczne)
  const tableSpecs = specs.filter(s => s.data_type === 'number').slice(0, 5)
  
  // Jeśli wyszukujemy konkretny parametr, dodaj go do kolumn (jeśli nie jest już tam)
  const displayTableSpecs = useMemo(() => {
    if (matchedSpec && !tableSpecs.find(s => s.key === matchedSpec.key)) {
      return [matchedSpec, ...tableSpecs.slice(0, 4)]
    }
    return tableSpecs
  }, [matchedSpec, tableSpecs])

  return (
    <div className="space-y-6">
      {/* ==================== HEADER ==================== */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Watch className="w-7 h-7 text-cyan-400" />
            Porównywarka urządzeń
          </h1>
          <p className="text-slate-400 mt-1">Porównaj parametry zegarków i lokalizatorów</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowManageFeatures(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
            <Settings className="w-4 h-4" /> Zarządzaj
          </button>
          <button onClick={() => setShowAddModal(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium">
            <Plus className="w-4 h-4" /> Dodaj urządzenie
          </button>
        </div>
      </header>

      {/* ==================== WYSZUKIWANIE ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Szukaj po nazwie */}
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

        {/* Porównaj parametr */}
        <div className="relative">
          <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={specSearchQuery}
            onChange={(e) => setSpecSearchQuery(e.target.value)}
            placeholder="Porównaj parametr (np. RAM, bateria, waga)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          {matchedSpec && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
              {matchedSpec.label} {matchedSpec.unit && `(${matchedSpec.unit})`}
            </span>
          )}
        </div>
      </div>

      {/* ==================== PRZYCISKI AKCJI ==================== */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            activeFilterCount > 0 
              ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' 
              : 'bg-slate-800/50 border-slate-700 text-slate-300'
          }`}>
          <Filter className="w-4 h-4" /> Filtry
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-cyan-500 text-white rounded-full">{activeFilterCount}</span>
          )}
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {selectedDeviceIds.size > 0 && (
          <button onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              compareMode 
                ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                : 'bg-slate-800/50 border-slate-700 text-slate-300'
            }`}>
            <Eye className="w-4 h-4" /> 
            {compareMode ? 'Pokaż wszystkie' : `Porównaj (${selectedDeviceIds.size})`}
          </button>
        )}

        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" /> Wyczyść filtry
          </button>
        )}
      </div>

      {/* ==================== PANEL FILTRÓW ==================== */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-6">
          {/* Filtry funkcji */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Filtruj po funkcjach</h3>
            {Object.entries(featuresByCategory).map(([category, catFeatures]) => (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {catFeatures.map((f) => {
                    const isActive = selectedFeatureFilters.includes(f.key)
                    return (
                      <button key={f.key} onClick={() => toggleFeatureFilter(f.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isActive 
                            ? 'bg-cyan-600/20 border border-cyan-500 text-cyan-400' 
                            : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}>
                        {f.label} {isActive && <Check className="w-3 h-3 inline ml-1" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Filtry parametrów (zakresy min/max) */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Filtruj po parametrach (zakres)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {specs.filter(s => s.data_type === 'number').map(spec => (
                <div key={spec.key} className="space-y-1">
                  <label className="text-xs text-slate-400">{spec.label} {spec.unit && `(${spec.unit})`}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="min"
                      value={specRangeFilters[spec.key]?.min ?? ''}
                      onChange={(e) => setSpecRangeFilters(prev => ({
                        ...prev,
                        [spec.key]: { ...prev[spec.key], min: e.target.value ? Number(e.target.value) : undefined }
                      }))}
                      className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100"
                    />
                    <input
                      type="number"
                      placeholder="max"
                      value={specRangeFilters[spec.key]?.max ?? ''}
                      onChange={(e) => setSpecRangeFilters(prev => ({
                        ...prev,
                        [spec.key]: { ...prev[spec.key], max: e.target.value ? Number(e.target.value) : undefined }
                      }))}
                      className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== WYNIKI ==================== */}
      <div className="text-sm text-slate-400">
        {loading ? 'Ładowanie...' : `Znaleziono ${displayDevices.length} urządzeń`}
        {matchedSpec && (
          <span className="text-purple-400 ml-2">
            • Sortowanie po: <strong>{matchedSpec.label}</strong>
          </span>
        )}
        {matchedFeature && (
          <span className="text-cyan-400 ml-2">
            • Porównanie funkcji: <strong>{matchedFeature.label}</strong>
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>
      )}

      {/* ==================== WYKRES PORÓWNANIA PARAMETRU ==================== */}
      {matchedSpec && matchedSpec.data_type === 'number' && displayDevices.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-purple-500/10 border-b border-slate-700">
            <h3 className="font-medium text-purple-400">
              Porównanie: {matchedSpec.label} {matchedSpec.unit && `(${matchedSpec.unit})`}
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {displayDevices.map((device, index) => {
              const value = device.specs[matchedSpec.key]
              const maxValue = Math.max(...displayDevices.map(d => d.specs[matchedSpec.key] || 0))
              const percentage = maxValue > 0 && value ? (value / maxValue) * 100 : 0
              
              return (
                <div key={device.id} className="flex items-center gap-4">
                  <div className="w-8 text-center text-slate-500 text-sm font-medium">#{index + 1}</div>
                  <button 
                    onClick={() => setViewingDevice(device)} 
                    className="w-32 text-left text-slate-200 hover:text-cyan-400 truncate font-medium"
                  >
                    {device.name}
                  </button>
                  <div className="flex-1 h-8 bg-slate-700/50 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white drop-shadow">
                      {value != null ? `${value} ${matchedSpec.unit || ''}` : 'Brak danych'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ==================== TABELA PORÓWNANIA FUNKCJI ==================== */}
      {matchedFeature && displayDevices.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-cyan-500/10 border-b border-slate-700">
            <h3 className="font-medium text-cyan-400">
              Porównanie funkcji: {matchedFeature.label}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Model</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">{matchedFeature.label}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {displayDevices.map((device, index) => {
                  const hasFeature = device.features[matchedFeature.key] === true
                  return (
                    <tr key={device.id} className="hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-slate-500 text-sm font-medium">#{index + 1}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => setViewingDevice(device)} 
                          className="font-medium text-slate-200 hover:text-cyan-400"
                        >
                          {device.name}
                        </button>
                        {device.model && device.model !== device.name && (
                          <span className="text-slate-500 text-sm ml-2">({device.model})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasFeature ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400">
                            <Check className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-400">
                            <X className="w-5 h-5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TABELA GŁÓWNA ==================== */}
      {!loading && displayDevices.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    <input
                      type="checkbox"
                      checked={selectedDeviceIds.size === displayDevices.length && displayDevices.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDeviceIds(new Set(displayDevices.map(d => d.id)))
                        } else {
                          setSelectedDeviceIds(new Set())
                        }
                      }}
                      className="rounded border-slate-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Nazwa</th>
                  {displayTableSpecs.map(spec => (
                    <th key={spec.key} className={`px-4 py-3 text-left text-xs font-medium uppercase whitespace-nowrap ${
                      matchedSpec?.key === spec.key ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'
                    }`}>
                      {spec.label} {spec.unit && <span className="text-slate-500">({spec.unit})</span>}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Funkcje</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {displayDevices.map((device) => {
                  const featureCount = Object.values(device.features).filter(Boolean).length
                  return (
                    <tr key={device.id} className={`hover:bg-slate-700/30 ${selectedDeviceIds.has(device.id) ? 'bg-purple-500/10' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedDeviceIds.has(device.id)}
                          onChange={() => toggleDeviceSelection(device.id)}
                          className="rounded border-slate-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewingDevice(device)} className="font-medium text-slate-200 hover:text-cyan-400">
                          {device.name}
                        </button>
                        {device.model && device.model !== device.name && (
                          <span className="text-slate-500 text-sm ml-2">({device.model})</span>
                        )}
                      </td>
                      {displayTableSpecs.map(spec => (
                        <td key={spec.key} className={`px-4 py-3 whitespace-nowrap ${
                          matchedSpec?.key === spec.key ? 'text-purple-300 bg-purple-500/10 font-semibold' : 'text-slate-300'
                        }`}>
                          {device.specs[spec.key] != null 
                            ? `${device.specs[spec.key]}` 
                            : <span className="text-slate-500">−</span>
                          }
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        {matchedFeature ? (
                          // Jeśli wyszukiwana jest funkcja, pokaż tylko tę funkcję
                          <div className="flex items-center gap-2">
                            {device.features[matchedFeature.key] === true ? (
                              <>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">
                                  <Check className="w-4 h-4" />
                                </span>
                                <span className="text-sm text-slate-300">{matchedFeature.label}</span>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400">
                                  <X className="w-4 h-4" />
                                </span>
                                <span className="text-sm text-slate-400">{matchedFeature.label}</span>
                              </>
                            )}
                          </div>
                        ) : (
                          // Normalnie pokaż licznik funkcji
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                            {featureCount} / {features.length}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewingDevice(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingDevice(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteDevice(device)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* ==================== EMPTY STATE ==================== */}
      {!loading && displayDevices.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
          <Watch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">
            {activeFilterCount > 0 || searchQuery || specSearchQuery
              ? 'Brak urządzeń pasujących do kryteriów'
              : 'Nie dodano jeszcze żadnych urządzeń'
            }
          </p>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium">
            <Plus className="w-4 h-4" /> Dodaj pierwsze urządzenie
          </button>
        </div>
      )}

      {/* ==================== MODALE ==================== */}
      {(showAddModal || editingDevice) && (
        <DeviceModal
          device={editingDevice}
          specs={specs}
          specsByCategory={specsByCategory}
          features={features}
          featuresByCategory={featuresByCategory}
          onSave={handleSaveDevice}
          onClose={() => { setShowAddModal(false); setEditingDevice(null) }}
          onSpecsChange={refetchSpecs}
          onFeaturesChange={refetchFeatures}
        />
      )}

      {viewingDevice && (
        <DeviceDetailModal
          device={viewingDevice}
          specs={specs}
          specsByCategory={specsByCategory}
          features={features}
          featuresByCategory={featuresByCategory}
          onClose={() => setViewingDevice(null)}
          onEdit={() => { setEditingDevice(viewingDevice); setViewingDevice(null) }}
        />
      )}

      {showManageFeatures && (
        <ManageFeaturesModal onClose={handleManageClose} />
      )}
    </div>
  )
}
