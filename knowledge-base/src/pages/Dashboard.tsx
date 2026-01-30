// src/pages/Dashboard.tsx
// Strona główna - Dashboard

import { Link } from 'react-router-dom'
import { 
  FileText, Clock, Star, TrendingUp, 
  FolderOpen, Plus, ArrowRight 
} from 'lucide-react'
import { useTopics, useCategories, useRecentViews, useFavorites } from '../hooks/useKnowledgeBase'
import TopicCard from '../components/topics/TopicCard'

export default function Dashboard() {
  const { topics, loading: topicsLoading } = useTopics()
  const { categories } = useCategories()
  const { recentTopics } = useRecentViews(5)
  const { favorites } = useFavorites()

  const pinnedTopics = topics.filter(t => t.is_pinned)
  const recentlyUpdated = [...topics]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)

  const stats = [
    { 
      label: 'Wszystkich tematów', 
      value: topics.length, 
      icon: FileText, 
      color: 'from-cyan-500 to-blue-500' 
    },
    { 
      label: 'Kategorii', 
      value: categories.length, 
      icon: FolderOpen, 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      label: 'Ulubionych', 
      value: favorites.length, 
      icon: Star, 
      color: 'from-amber-500 to-orange-500' 
    },
    { 
      label: 'Ostatnio przeglądanych', 
      value: recentTopics.length, 
      icon: Clock, 
      color: 'from-emerald-500 to-teal-500' 
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">
          Witaj w Bazie Wiedzy 👋
        </h1>
        <p className="mt-2 text-slate-400">
          Dział Techniczny • Zegarki i Lokalizatory
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pinned Topics */}
      {pinnedTopics.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">
              Przypięte tematy
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedTopics.map(topic => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Updated */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-slate-100">
              Ostatnio aktualizowane
            </h2>
          </div>
          <Link 
            to="/search"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Zobacz wszystkie
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {topicsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyUpdated.map(topic => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-slate-100">
            Przeglądaj kategorie
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.filter(c => !c.parent_id).map(category => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group bg-slate-800/50 border border-slate-700 rounded-xl p-4 
                       hover:border-slate-500 hover:bg-slate-800 transition-all"
            >
              <div 
                className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: category.color || '#6B7280' }}
                />
              </div>
              <h3 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
          
          {/* Add Category Card */}
          <button className="bg-slate-800/30 border border-dashed border-slate-600 rounded-xl p-4 
                           hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all
                           flex flex-col items-center justify-center text-slate-400 hover:text-cyan-400">
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm">Dodaj kategorię</span>
          </button>
        </div>
      </section>
    </div>
  )
}
