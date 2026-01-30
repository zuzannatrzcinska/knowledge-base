// src/pages/TopicView.tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ChevronRight, Star, Pin, Edit, Plus, MoreVertical
} from 'lucide-react'
import { useTopic, useNotes, useFavorites } from '../hooks/useKnowledgeBase'
import NoteEditor from '../components/notes/NoteEditor'
import NoteCard from '../components/notes/NoteCard'
import { formatDate } from '../utils/helpers'

export default function TopicView() {
  const { topicId } = useParams<{ topicId: string }>()
  const { topic, notes, loading, refetch } = useTopic(topicId!)
  const { createNote, updateNote, deleteNote } = useNotes(topicId!)
  const { toggleFavorite, isFavorite } = useFavorites()
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [showNewNote, setShowNewNote] = useState(false)

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-700 rounded w-1/3"></div>
        <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-slate-400">Temat nie znaleziony</h2>
        <Link to="/" className="text-cyan-400 hover:underline mt-2 inline-block">
          Wróć do strony głównej
        </Link>
      </div>
    )
  }

  const favorite = isFavorite(topic.id)

  const handleSaveNote = async (noteData: { title?: string; content: string; tagIds?: string[] }) => {
    if (editingNoteId) {
      await updateNote(editingNoteId, { title: noteData.title, content: noteData.content })
      setEditingNoteId(null)
    } else {
      await createNote({ title: noteData.title, content: noteData.content }, noteData.tagIds)
      setShowNewNote(false)
    }
    refetch()
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
      await deleteNote(noteId)
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/" className="hover:text-cyan-400">Strona główna</Link>
        <ChevronRight className="w-4 h-4" />
        {topic.category_name && (
          <>
            <Link 
              to={`/category/${topic.category_id}`} 
              className="hover:text-cyan-400"
              style={{ color: topic.category_color || undefined }}
            >
              {topic.category_name}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-slate-200">{topic.title}</span>
      </nav>

      <header className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {topic.is_pinned && (
                <Pin className="w-5 h-5 text-amber-400" />
              )}
              <h1 className="text-2xl font-bold text-slate-100">
                {topic.title}
              </h1>
            </div>
            
            {topic.description && (
              <p className="text-slate-400 mb-4">{topic.description}</p>
            )}

            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {topic.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      border: `1px solid ${tag.color}40`
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Utworzono: {formatDate(topic.created_at)}</span>
              <span>•</span>
              <span>Aktualizacja: {formatDate(topic.updated_at)}</span>
              <span>•</span>
              <span>{topic.view_count} wyświetleń</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(topic.id)}
              className={`p-2 rounded-lg transition-colors ${
                favorite 
                  ? 'text-amber-400 bg-amber-400/10' 
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-700'
              }`}
              title={favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            >
              <Star className="w-5 h-5" fill={favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
              title="Edytuj temat"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              title="Więcej opcji"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">
            Notatki ({notes.length})
          </h2>
          <button
            onClick={() => setShowNewNote(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj notatkę
          </button>
        </div>

        {showNewNote && (
          <div className="mb-4">
            <NoteEditor
              onSave={handleSaveNote}
              onCancel={() => setShowNewNote(false)}
            />
          </div>
        )}

        {notes.length === 0 && !showNewNote ? (
          <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-400 mb-4">Ten temat nie ma jeszcze żadnych notatek</p>
            <button
              onClick={() => setShowNewNote(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Dodaj pierwszą notatkę
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note: any) => (
              <NoteCard
                key={note.id}
                note={note}
                isEditing={editingNoteId === note.id}
                onEdit={() => setEditingNoteId(note.id)}
                onSave={handleSaveNote}
                onCancel={() => setEditingNoteId(null)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
