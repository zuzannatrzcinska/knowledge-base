// src/pages/SearchResults.tsx
// Strona wyników wyszukiwania

import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, FileText, Tag, FolderOpen } from 'lucide-react'
import { useSearch, useTags } from '../hooks/useKnowledgeBase'
import { highlightSearchTerm } from '../utils/helpers'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const tagId = searchParams.get('tag')
  
  const { results, loading, search, searchByTag } = useSearch()
  const { tags } = useTags()

  const selectedTag = tagId ? tags.find(t => t.id === tagId) : null

  useEffect(() => {
    if (tagId) {
      searchByTag(tagId)
    } else if (query) {
      search(query)
    }
  }, [query, tagId, search, searchByTag])

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold text-slate-100">
            Wyniki wyszukiwania
          </h1>
        </div>
        <p className="text-slate-400">
          {selectedTag ? (
            <>
              Tag: <span 
                className="px-2 py-0.5 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${selectedTag.color}20`,
                  color: selectedTag.color
                }}
              >
                {selectedTag.name}
              </span>
            </>
          ) : (
            <>Szukasz: <span className="text-slate-200">"{query}"</span></>
          )}
          {!loading && (
            <span className="ml-2">• Znaleziono {results.length} wyników</span>
          )}
        </p>
      </header>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-pulse">
              <div className="h-5 bg-slate-700 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
          <Search className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 mb-2">Nie znaleziono wyników dla tego zapytania</p>
          <p className="text-slate-500 text-sm">Spróbuj użyć innych słów kluczowych</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Link
              key={result.note_id}
              to={`/topic/${result.topic_id}`}
              className="block bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-500 hover:bg-slate-800 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-700/50 rounded-lg shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Note title */}
                  <h3 className="font-medium text-slate-200 mb-1">
                    {result.title || 'Bez tytułu'}
                  </h3>
                  
                  {/* Content preview */}
                  <p 
                    className="text-sm text-slate-400 line-clamp-2 mb-2"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightSearchTerm(result.content_preview, query) 
                    }}
                  />
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {result.category_name && (
                      <>
                        <FolderOpen className="w-3 h-3" />
                        <span>{result.category_name}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{result.topic_title}</span>
                  </div>
                </div>

                {/* Relevance indicator */}
                <div className="text-xs text-slate-500 shrink-0">
                  {Math.round(result.rank * 100)}% trafności
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Search tips */}
      <aside className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
        <h3 className="font-medium text-slate-200 mb-2">💡 Wskazówki wyszukiwania</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Użyj konkretnych słów kluczowych</li>
          <li>• Szukaj po nazwie urządzenia, np. "zegarek X1"</li>
          <li>• Możesz szukać po kodach błędów, np. "ERR_001"</li>
          <li>• Użyj tagów do filtrowania wyników</li>
        </ul>
      </aside>
    </div>
  )
}
