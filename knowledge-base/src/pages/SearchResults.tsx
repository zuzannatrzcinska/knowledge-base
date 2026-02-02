// src/pages/SearchResults.tsx
// Strona wyników wyszukiwania

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, FileText, FolderOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const tagId = searchParams.get('tag') || ''
  
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function search() {
      if (!query.trim() && !tagId) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        if (tagId) {
          // Szukaj po tagu
          const { data: topicTagsData, error: topicTagsError } = await supabase
            .from('topic_tags')
            .select(`
              topic_id,
              topics(
                id,
                title,
                description,
                updated_at,
                categories(name, color)
              )
            `)
            .eq('tag_id', tagId)
          
          if (topicTagsError) throw topicTagsError
          
          const topics = topicTagsData
            ?.map((tt: any) => tt.topics)
            .filter(Boolean)
            .map((t: any) => ({
              ...t,
              category_name: t.categories?.name,
              category_color: t.categories?.color
            })) || []
          
          setResults(topics)
        } else if (query.trim()) {
          // Szukaj tekstowo
          const { data: topicsData, error: topicsError } = await supabase
            .from('topics')
            .select(`
              id,
              title,
              description,
              updated_at,
              categories(name, color)
            `)
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .eq('is_archived', false)
            .order('updated_at', { ascending: false })
            .limit(50)
          
          if (topicsError) throw topicsError
          
          // Szukaj też w notatkach
          const { data: notesData, error: notesError } = await supabase
            .from('notes')
            .select(`
              id,
              title,
              content,
              topic_id,
              topics(id, title, categories(name, color))
            `)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .limit(50)
          
          if (notesError) throw notesError
          
          // Połącz wyniki - najpierw tematy, potem unikalne tematy z notatek
          const topicResults = (topicsData || []).map((t: any) => ({
            type: 'topic',
            id: t.id,
            title: t.title,
            description: t.description,
            updated_at: t.updated_at,
            category_name: t.categories?.name,
            category_color: t.categories?.color
          }))
          
          const noteTopicIds = new Set(topicResults.map((t: any) => t.id))
          const noteResults = (notesData || [])
            .filter((n: any) => n.topics && !noteTopicIds.has(n.topics.id))
            .map((n: any) => ({
              type: 'note',
              id: n.topics.id,
              title: n.topics.title,
              noteTitle: n.title,
              notePreview: n.content?.substring(0, 150) + '...',
              category_name: n.topics.categories?.name,
              category_color: n.topics.categories?.color
            }))
          
          setResults([...topicResults, ...noteResults])
        }
      } catch (err: any) {
        console.error('Search error:', err)
        setError(err.message || 'Błąd wyszukiwania')
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [query, tagId])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Search className="w-6 h-6 text-cyan-400" />
          Wyniki wyszukiwania
        </h1>
        {query && (
          <p className="text-slate-400 mt-1">
            Szukasz: <span className="text-cyan-400">"{query}"</span>
          </p>
        )}
        {tagId && (
          <p className="text-slate-400 mt-1">
            Filtrowanie po tagu
          </p>
        )}
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-slate-800/30 border border-red-500/30 rounded-xl">
          <p className="text-red-400">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">
            {query || tagId ? 'Nie znaleziono wyników' : 'Wpisz frazę do wyszukania'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Znaleziono {results.length} wyników
          </p>
          
          {results.map((result: any, index: number) => (
            <Link
              key={`${result.type}-${result.id}-${index}`}
              to={`/topic/${result.id}`}
              className="block bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-500 hover:bg-slate-800 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-700/50">
                  {result.type === 'note' ? (
                    <FileText className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <FolderOpen className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-200 hover:text-cyan-400 transition-colors">
                    {result.title}
                  </h3>
                  
                  {result.type === 'note' && result.noteTitle && (
                    <p className="text-sm text-cyan-400 mt-1">
                      Notatka: {result.noteTitle}
                    </p>
                  )}
                  
                  {result.description && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                  
                  {result.notePreview && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {result.notePreview}
                    </p>
                  )}
                  
                  {result.category_name && (
                    <span 
                      className="inline-block mt-2 px-2 py-0.5 text-xs rounded"
                      style={{ 
                        backgroundColor: `${result.category_color}20`,
                        color: result.category_color || '#9CA3AF'
                      }}
                    >
                      {result.category_name}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
