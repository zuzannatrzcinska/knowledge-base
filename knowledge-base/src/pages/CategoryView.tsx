// src/pages/CategoryView.tsx
// Widok kategorii z listą tematów

import { useParams, Link } from 'react-router-dom'
import { ChevronRight, FolderOpen, Plus } from 'lucide-react'
import { useTopics, useCategories } from '../hooks/useKnowledgeBase'
import TopicCard from '../components/topics/TopicCard'

export default function CategoryView() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { topics, loading } = useTopics(categoryId)
  const { categories } = useCategories()
  
  const category = categories.find(c => c.id === categoryId)
  const subcategories = categories.filter(c => c.parent_id === categoryId)

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

      {/* Header */}
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <FolderOpen 
              className="w-6 h-6" 
              style={{ color: category.color || '#9CA3AF' }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{category.name}</h1>
            {category.description && (
              <p className="text-slate-400 mt-1">{category.description}</p>
            )}
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nowy temat
        </button>
      </header>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-200 mb-3">Podkategorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {subcategories.map(sub => (
              <Link
                key={sub.id}
                to={`/category/${sub.id}`}
                className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${sub.color}20` }}
                >
                  <FolderOpen 
                    className="w-4 h-4" 
                    style={{ color: sub.color || '#9CA3AF' }}
                  />
                </div>
                <span className="text-slate-200 font-medium">{sub.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Topics */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-3">
          Tematy ({topics.length})
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
            <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Ta kategoria nie ma jeszcze żadnych tematów</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Dodaj pierwszy temat
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map(topic => (
              <TopicCard key={topic.id} topic={topic} showCategory={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
