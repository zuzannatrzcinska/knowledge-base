// src/components/topics/TopicCard.tsx
// Karta tematu do wyświetlania na listach

import { Link } from 'react-router-dom'
import { Star, Pin, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { useFavorites } from '../../hooks/useKnowledgeBase'
import type { TopicWithStats } from '../../lib/database.types'
import { formatRelativeDate } from '../../utils/helpers'

interface TopicCardProps {
  topic: TopicWithStats
  showCategory?: boolean
}

export default function TopicCard({ topic, showCategory = true }: TopicCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const [showMenu, setShowMenu] = useState(false)
  
  const favorite = isFavorite(topic.id)

  return (
    <Link
      to={`/topic/${topic.id}`}
      className="group block bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-500 hover:bg-slate-800 transition-all relative"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {topic.is_pinned && (
            <Pin className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <h3 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
            {topic.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFavorite(topic.id)
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              favorite 
                ? 'text-amber-400 bg-amber-400/10' 
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-700'
            }`}
          >
            <Star className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {topic.description && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
          {topic.description}
        </p>
      )}

      {topic.tags && topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {topic.tags.slice(0, 3).map((tag: any) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-xs rounded-full"
              style={{ 
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`
              }}
            >
              {tag.name}
            </span>
          ))}
          {topic.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-slate-400">
              +{topic.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          {showCategory && topic.category_name && (
            <span 
              className="px-2 py-0.5 rounded text-xs"
              style={{ 
                backgroundColor: `${topic.category_color}20`,
                color: topic.category_color || '#9CA3AF'
              }}
            >
              {topic.category_name}
            </span>
          )}
          <span>{topic.notes_count} notatek</span>
        </div>
        <span>{formatRelativeDate(topic.updated_at)}</span>
      </div>
    </Link>
  )
}
