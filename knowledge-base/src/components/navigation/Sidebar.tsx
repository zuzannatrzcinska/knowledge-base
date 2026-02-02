// src/components/navigation/Sidebar.tsx
// Boczny panel nawigacji z kategoriami

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, Star, Clock, Tag, 
  ChevronRight, ChevronDown, Plus, Settings, X, Edit, Trash2
} from 'lucide-react'
import { useCategories, useFavorites, useRecentViews, useTags } from '../../hooks/useKnowledgeBase'
import { supabase } from '../../lib/supabase'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories()
  const { favorites } = useFavorites()
  const { recentTopics } = useRecentViews(5)
  const { tags, refetch: refetchTags } = useTags()

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showAllTags, setShowAllTags] = useState(false)
  
  // Modal nowej kategorii
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6')
  const [savingCategory, setSavingCategory] = useState(false)
  
  // Modal zarządzania tagami
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6B7280')
  const [editingTag, setEditingTag] = useState<any>(null)
  const [savingTag, setSavingTag] = useState(false)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    
    setSavingCategory(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategoryName.trim(),
          color: newCategoryColor,
          created_by: user?.id
        })
      
      if (error) throw error
      
      setNewCategoryName('')
      setShowNewCategoryModal(false)
      refetchCategories()
    } catch (err: any) {
      console.error('Error creating category:', err)
      alert('Nie udało się utworzyć kategorii: ' + err.message)
    } finally {
      setSavingCategory(false)
    }
  }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    
    setSavingTag(true)
    try {
      const { error } = await supabase
        .from('tags')
        .insert({
          name: newTagName.trim(),
          color: newTagColor
        })
      
      if (error) throw error
      
      setNewTagName('')
      setNewTagColor('#6B7280')
      refetchTags()
    } catch (err: any) {
      console.error('Error creating tag:', err)
      alert('Nie udało się utworzyć tagu: ' + err.message)
    } finally {
      setSavingTag(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return
    
    setSavingTag(true)
    try {
      const { error } = await supabase
        .from('tags')
        .update({
          name: editingTag.name.trim(),
          color: editingTag.color
        })
        .eq('id', editingTag.id)
      
      if (error) throw error
      
      setEditingTag(null)
      refetchTags()
    } catch (err: any) {
      console.error('Error updating tag:', err)
      alert('Nie udało się zaktualizować tagu: ' + err.message)
    } finally {
      setSavingTag(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten tag? Zostanie usunięty ze wszystkich tematów i notatek.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)
      
      if (error) throw error
      refetchTags()
    } catch (err: any) {
      console.error('Error deleting tag:', err)
      alert('Nie udało się usunąć tagu: ' + err.message)
    }
  }

  // Grupuj kategorie według parent_id
  const rootCategories = categories.filter((c: any) => !c.parent_id)
  const getChildren = (parentId: string) => 
    categories.filter((c: any) => c.parent_id === parentId)

  const isActive = (path: string) => location.pathname === path

  const navLinkClass = (active: boolean) => `
    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
    ${active 
      ? 'bg-cyan-600/20 text-cyan-400' 
      : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
    }
  `

  const CategoryItem = ({ category, level = 0 }: { category: any; level?: number }) => {
    const children = getChildren(category.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const isActiveCategory = location.pathname === `/category/${category.id}`

    return (
      <div>
        <div 
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
            ${isActiveCategory 
              ? 'bg-cyan-600/20 text-cyan-400' 
              : 'text-slate-300 hover:bg-slate-700/50'
            }
          `}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleCategory(category.id)
            }
            navigate(`/category/${category.id}`)
          }}
        >
          {hasChildren ? (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                toggleCategory(category.id)
              }}
              className="p-0.5 hover:bg-slate-600 rounded"
            >
              {isExpanded 
                ? <ChevronDown className="w-4 h-4" /> 
                : <ChevronRight className="w-4 h-4" />
              }
            </button>
          ) : (
            <span className="w-5" />
          )}
          
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: category.color || '#6B7280' }}
          />
          
          <span className="flex-1 truncate text-sm">{category.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-2">
            {children.map((child: any) => (
              <CategoryItem key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const colorOptions = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899',
    '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  return (
    <>
      <aside 
        className={`
          fixed left-0 top-16 bottom-0 w-64 bg-slate-800/95 backdrop-blur-sm 
          border-r border-slate-700 overflow-y-auto z-40
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-4 space-y-6">
          {/* Główna nawigacja */}
          <div className="space-y-1">
            <Link to="/" className={navLinkClass(isActive('/'))}>
              <Home className="w-5 h-5" />
              <span>Strona główna</span>
            </Link>
          </div>

          {/* Kategorie */}
          <div>
            <div className="flex items-center justify-between mb-2 px-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Kategorie
              </h3>
              <button 
                onClick={() => setShowNewCategoryModal(true)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
                title="Dodaj kategorię"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {categoriesLoading ? (
              <div className="px-3 py-2 text-slate-500 text-sm">Ładowanie...</div>
            ) : (
              <div className="space-y-0.5">
                {rootCategories.map((category: any) => (
                  <CategoryItem key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>

          {/* Ostatnio przeglądane */}
          {recentTopics.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Ostatnio przeglądane
              </h3>
              <div className="space-y-1">
                {recentTopics.slice(0, 5).map((topic: any) => (
                  <Link
                    key={topic.id}
                    to={`/topic/${topic.id}`}
                    className="block px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg truncate"
                  >
                    {topic.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tagi */}
          <div>
            <div className="flex items-center justify-between mb-2 px-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Tag className="w-4 h-4" />
                Tagi
              </h3>
              <button 
                onClick={() => setShowTagsModal(true)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
                title="Zarządzaj tagami"
              >
                <Settings className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 px-3">
              {(showAllTags ? tags : tags.slice(0, 8)).map((tag: any) => (
                <Link
                  key={tag.id}
                  to={`/search?tag=${tag.id}`}
                  className="px-2 py-0.5 text-xs rounded-full transition-colors hover:opacity-80"
                  style={{ 
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    border: `1px solid ${tag.color}40`
                  }}
                >
                  {tag.name}
                </Link>
              ))}
              {tags.length > 8 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="px-2 py-0.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  {showAllTags ? 'Mniej' : `+${tags.length - 8}`}
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button className="flex items-center gap-2 w-full px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Ustawienia</span>
          </button>
        </div>
      </aside>

      {/* Modal dodawania kategorii */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-slate-100">Nowa kategoria</h2>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Nazwa kategorii *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="np. Nowe urządzenia"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg
                           text-slate-100 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Kolor
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        newCategoryColor === color 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' 
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || savingCategory}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium"
                >
                  {savingCategory ? 'Tworzenie...' : 'Utwórz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal zarządzania tagami */}
      {showTagsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-slate-100">Zarządzaj tagami</h2>
              <button
                onClick={() => {
                  setShowTagsModal(false)
                  setEditingTag(null)
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Dodaj nowy tag */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Dodaj nowy tag</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nazwa tagu"
                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg
                             text-slate-100 placeholder-slate-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                  </div>
                  <button
                    onClick={handleAddTag}
                    disabled={!newTagName.trim() || savingTag}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg font-medium text-sm"
                  >
                    Dodaj
                  </button>
                </div>
              </div>

              {/* Lista tagów */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Istniejące tagi</h3>
                <div className="space-y-2">
                  {tags.map((tag: any) => (
                    <div 
                      key={tag.id}
                      className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg"
                    >
                      {editingTag?.id === tag.id ? (
                        <>
                          <input
                            type="text"
                            value={editingTag.name}
                            onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                            className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100"
                            autoFocus
                          />
                          <input
                            type="color"
                            value={editingTag.color}
                            onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <button
                            onClick={handleUpdateTag}
                            disabled={savingTag}
                            className="p-1.5 text-green-400 hover:bg-slate-600 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingTag(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-600 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            className="px-3 py-1 text-sm rounded-full flex-1"
                            style={{ 
                              backgroundColor: `${tag.color}20`,
                              color: tag.color
                            }}
                          >
                            {tag.name}
                          </span>
                          <button
                            onClick={() => setEditingTag({ ...tag })}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-600 rounded"
                            title="Edytuj"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded"
                            title="Usuń"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {tags.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">
                      Brak tagów. Dodaj pierwszy tag powyżej.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowTagsModal(false)
                  setEditingTag(null)
                }}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
