// src/components/modals/NewTopicModal.tsx
// Modal do tworzenia nowego tematu

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useCategories, useTags, useTopics } from '../../hooks/useKnowledgeBase'

interface NewTopicModalProps {
  onClose: () => void
  onSuccess: (topicId: string) => void
  initialCategoryId?: string
}

export default function NewTopicModal({ onClose, onSuccess, initialCategoryId }: NewTopicModalProps) {
  const { categories } = useCategories()
  const { tags } = useTags()
  const { createTopic } = useTopics()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(initialCategoryId || '')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !categoryId) return
    
    setSaving(true)
    try {
      const topic = await createTopic({
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId
      }, selectedTags)
      
      onSuccess(topic.id)
    } catch (err: any) {
      console.error('Error creating topic:', err)
      alert('Błąd tworzenia tematu: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Nowy temat</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tytuł *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Problem z GPS w GJD.08"
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg
                       text-slate-100 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Opis (opcjonalnie)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótki opis tematu..."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg
                       text-slate-100 placeholder-slate-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Kategoria *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg
                       text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">Wybierz kategorię</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Tagi
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 text-sm rounded-full transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !categoryId || saving}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Tworzenie...' : 'Utwórz temat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
