// src/components/topics/TopicCard.tsx
// Karta tematu do wyświetlania na listach

import { Link, useNavigate } from 'react-router-dom'
import { Star, Pin, MoreVertical, Archive, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'
import { useFavorites, useTopics } from '../../hooks/useKnowledgeBase'
import { formatRelativeDate } from '../../utils/helpers'

interface TopicCardProps {
  topic: any
  showCategory?: boolean
}

export default function TopicCard({ topic, showCategory = true }: TopicCardProps) {
  const navigate = useNavigate()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { deleteTopic, updateTopic } = useTopics()
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const favorite = isFavorite(topic.id)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await toggleFavorite(topic.id)
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(false)
    try {
      await updateTopic(topic.id, { is_archived: !topic.is_archived })
    } catch (err) {
      console.error('Error archiving topic:', err)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(false)
    
    if (!confirm('Czy na pewno chcesz usunąć ten temat?')) return
    
    setIsDeleting(true)
    try {
      await deleteTopic(topic.id)
    } catch (err) {
      console.error('Error deleting topic:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(false)
    navigate(`/topic/${topic.id}?edit=true`)
  }

  if (isDeleting) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 opacity-50">
        <div className="text-center text-slate-400">Usuwanie...</div>
      </div>
    )
  }

  return (
    <Link
      to={`/topic/${topic.id}`}
      className="group block bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-500 hover:bg-slate-800 transition-all relative"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {topic.is_pinned && <Pin className="w-4 h-4 text-amber-400 shrink-0" />}
          <h3 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
            {topic.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg transition-colors ${favorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-700'}`}
          >
            <Star className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu) }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false) }} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-20 py-1">
                  <button onClick={handleEdit} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edytuj
                  </button>
                  <button onClick={handleArchive} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2">
                    <Archive className="w-4 h-4" /> {topic.is_archived ? 'Przywróć' : 'Archiwizuj'}
                  </button>
                  <hr className="my-1 border-slate-600" />
                  <button onClick={handleDelete} className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-600 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Usuń
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {topic.description && <p className="text-sm text-slate-400 line-clamp-2 mb-3">{topic.description}</p>}

      {topic.tags && topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {topic.tags.slice(0, 3).map((tag: any) => (
            <span key={tag.id} className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
              {tag.name}
            </span>
          ))}
          {topic.tags.length > 3 && <span className="px-2 py-0.5 text-xs text-slate-400">+{topic.tags.length - 3}</span>}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          {showCategory && topic.category_name && (
            <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${topic.category_color}20`, color: topic.category_color || '#9CA3AF' }}>
              {topic.category_name}
            </span>
          )}
          <span>{topic.notes_count || 0} notatek</span>
        </div>
        <span>{formatRelativeDate(topic.updated_at)}</span>
      </div>
    </Link>
  )
}
