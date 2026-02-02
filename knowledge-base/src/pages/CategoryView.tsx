// src/pages/CategoryView.tsx
// Widok kategorii z listą tematów

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Plus, FolderOpen } from 'lucide-react'
import { useCategory, useTopics } from '../hooks/useKnowledgeBase'
import TopicCard from '../components/topics/TopicCard'
import NewTopicModal from '../components/modals/NewTopicModal'
import { useNavigate } from 'react-router-dom'

export default function CategoryView() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const { category, loading: categoryLoading } = useCategory(categoryId!)
  const { topics, loading: topicsLoading } = useTopics(categoryId)
  const [showNewTopicModal, setShowNewTopicModal] = useState(false)

  if (categoryLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-700 rounded w-1/3"></div>
        <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-slate-400">Kategoria nie znaleziona</h2>
        <Link to="/" className="text-cyan-400 hover:underline mt-2 inline-block">
          Wróć do strony głównej
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/" className="hover:text-cyan-400">Strona główna</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-200">{category.name}</span>
      </nav>

      {/* Category Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <FolderOpen 
              className="w-8 h-8" 
              style={{ color: category.color || '#6B7280' }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{category.name}</h1>
            {category.description && (
              <p className="text-slate-400 mt-1">{category.description}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowNewTopicModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nowy temat
        </button>
      </header>

      {/* Topics Section */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Tematy ({topics.length})
        </h2>

        {topicsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Ta kategoria nie ma jeszcze żadnych tematów</p>
            <button
              onClick={() => setShowNewTopicModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Dodaj pierwszy temat
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic: any) => (
              <TopicCard key={topic.id} topic={topic} showCategory={false} />
            ))}
          </div>
        )}
      </section>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <NewTopicModal 
          onClose={() => setShowNewTopicModal(false)}
          onSuccess={(topicId) => {
            setShowNewTopicModal(false)
            navigate(`/topic/${topicId}`)
          }}
          initialCategoryId={categoryId}
        />
      )}
    </div>
  )
}
