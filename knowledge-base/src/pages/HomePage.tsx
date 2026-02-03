// src/pages/HomePage.tsx
// Strona główna z przeglądem kategorii i ostatnich tematów

import { Link } from 'react-router-dom'
import { FolderOpen, Clock, Star, TrendingUp, Plus } from 'lucide-react'
import { useCategories, useTopics, useFavorites, useRecentViews } from '../hooks/useKnowledgeBase'
import TopicCard from '../components/topics/TopicCard'

export default function HomePage() {
  const { categories, loading: categoriesLoading } = useCategories()
  const { topics, loading: topicsLoading } = useTopics()
  const { favorites } = useFavorites()
  const { recentTopics } = useRecentViews(5)

  // Ostatnio zaktualizowane tematy
  const recentlyUpdated = topics.slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-slate-100">Baza Wiedzy</h1>
        <p className="text-slate-400 mt-2">
          Dokumentacja techniczna zegarków i lokalizatorów
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{categories.length}</p>
              <p className="text-sm text-slate-400">Kategorii</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{topics.length}</p>
              <p className="text-sm text-slate-400">Tematów</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{favorites.length}</p>
              <p className="text-sm text-slate-400">Ulubionych</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{recentTopics.length}</p>
              <p className="text-sm text-slate-400">Ostatnio przeglądane</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-200">Kategorie</h2>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Brak kategorii. Dodaj pierwszą w panelu bocznym.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.filter((c: any) => !c.parent_id).map((category: any) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-500 hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color || '#6B7280' }}
                  />
                  <h3 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {category.name}
                  </h3>
                </div>
                {category.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recently Updated Topics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-200">Ostatnio zaktualizowane</h2>
        </div>
        
        {topicsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : recentlyUpdated.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Brak tematów. Utwórz pierwszy temat w dowolnej kategorii.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyUpdated.map((topic: any) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
