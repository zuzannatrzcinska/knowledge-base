// src/components/modals/NewTopicModal.tsx
// Modal do tworzenia nowego tematu

import { useState } from 'react'
import { X, FolderOpen, Hash } from 'lucide-react'
import { useTopics, useCategories, useTags } from '../../hooks/useKnowledgeBase'

interface NewTopicModalProps {
  onClose: () => void
  onSuccess: (topicId: string) => void
  initialCategoryId?: string
}

export default function NewTopicModal({ onClose, onSuccess, initialCategoryId }: NewTopicModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(initialCategoryId || '')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { createTopic } = useTopics()
  const { categories } = useCategories()
  const { tags } = useTags()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    setError(null)

    try {
      const topic = await createTopic({
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || undefined
      }, selectedTags)

      onSuccess(topic.id)
    } catch (err: any) {
      setError(err.message || 'Nie udało się utworzyć tematu')
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Nowy temat</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tytuł tematu *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Zegarek X1 - Problemy z GPS"
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg
                       text-slate-100 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Opis (opcjonalnie)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótki opis tematu..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg
                       text-slate-100 placeholder-slate-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <FolderOpen className="w-4 h-4 inline mr-1" />
              Kategoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg
                       text-slate-100
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            >
              <option value="">Bez kategorii</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.path || cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Hash className="w-4 h-4 inline mr-1" />
              Tagi
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 text-sm rounded-full transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'ring-2 ring-offset-2 ring-offset-slate-800'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: tag.color,
                    ...(selectedTags.includes(tag.id) && { ringColor: tag.color })
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {saving ? 'Tworzenie...' : 'Utwórz temat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
