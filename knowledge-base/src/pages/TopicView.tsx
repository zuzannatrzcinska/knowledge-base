// src/pages/TopicView.tsx
// Widok pojedynczego tematu z notatkami

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ChevronRight, Star, Pin, Edit, Trash2, Plus,
  MoreVertical, Archive, Tag, X, Check
} from 'lucide-react'
import { useTopic, useNotes, useFavorites, useTags } from '../hooks/useKnowledgeBase'
import { supabase } from '../lib/supabase'
import NoteEditor from '../components/notes/NoteEditor'
import NoteCard from '../components/notes/NoteCard'
import { formatDate } from '../utils/helpers'

export default function TopicView() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { topic, notes, loading, refetch } = useTopic(topicId!)
  const { createNote, updateNote, deleteNote } = useNotes(topicId!)
  const { toggleFavorite, isFavorite } = useFavorites()
  const { tags: allTags } = useTags()
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [showNewNote, setShowNewNote] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [isEditingTopic, setIsEditingTopic] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [topicTags, setTopicTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Sprawdź czy otwarto w trybie edycji
  useEffect(() => {
    if (searchParams.get('edit') === 'true' && topic) {
      setIsEditingTopic(true)
      setEditTitle(topic.title)
      setEditDescription(topic.description || '')
    }
  }, [searchParams, topic])

  // Załaduj tagi tematu
  useEffect(() => {
    if (topic?.tags) {
      setTopicTags(topic.tags.map((t: any) => t.id))
    }
  }, [topic])

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
    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, { title: noteData.title, content: noteData.content })
        setEditingNoteId(null)
      } else {
        await createNote({ title: noteData.title, content: noteData.content }, noteData.tagIds)
        setShowNewNote(false)
      }
      refetch()
    } catch (err: any) {
      console.error('Error saving note:', err)
      alert('Błąd zapisu: ' + err.message)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
      await deleteNote(noteId)
      refetch()
    }
  }

  const handleDeleteTopic = async () => {
    if (!confirm('Czy na pewno chcesz usunąć ten temat? Ta operacja jest nieodwracalna.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId)
      
      if (error) throw error
      navigate('/')
    } catch (err: any) {
      console.error('Error deleting topic:', err)
      alert('Błąd usuwania: ' + err.message)
    }
  }

  const handleArchiveTopic = async () => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_archived: !topic.is_archived })
        .eq('id', topicId)
      
      if (error) throw error
      refetch()
      setShowMenu(false)
    } catch (err: any) {
      console.error('Error archiving topic:', err)
    }
  }

  const handleTogglePin = async () => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_pinned: !topic.is_pinned })
        .eq('id', topicId)
      
      if (error) throw error
      refetch()
      setShowMenu(false)
    } catch (err: any) {
      console.error('Error pinning topic:', err)
    }
  }

  const handleSaveTopic = async () => {
    if (!editTitle.trim()) return
    
    setSaving(true)
    try {
      // Aktualizuj temat
      const { error } = await supabase
        .from('topics')
        .update({ 
          title: editTitle.trim(),
          description: editDescription.trim() || null
        })
        .eq('id', topicId)
      
      if (error) throw error
      
      // Aktualizuj tagi - usuń stare
      await supabase
        .from('topic_tags')
        .delete()
        .eq('topic_id', topicId)
      
      // Dodaj nowe tagi
      if (topicTags.length > 0) {
        await supabase
          .from('topic_tags')
          .insert(topicTags.map(tagId => ({ topic_id: topicId, tag_id: tagId })))
      }
      
      setIsEditingTopic(false)
      refetch()
    } catch (err: any) {
      console.error('Error saving topic:', err)
      alert('Błąd zapisu: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleTopicTag = (tagId: string) => {
    setTopicTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
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

      {/* Topic Header */}
      <header className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditingTopic ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-bold bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Tytuł tematu"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                  placeholder="Opis (opcjonalnie)"
                  rows={2}
                />
                
                {/* Tag picker w trybie edycji */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tagi</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag: any) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTopicTag(tag.id)}
                        className={`px-3 py-1 text-sm rounded-full transition-all ${
                          topicTags.includes(tag.id)
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{ 
                          backgroundColor: `${tag.color}20`,
                          color: tag.color
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTopic}
                    disabled={saving || !editTitle.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg font-medium"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? 'Zapisywanie...' : 'Zapisz'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTopic(false)
                      setEditTitle(topic.title)
                      setEditDescription(topic.description || '')
                      setTopicTags(topic.tags?.map((t: any) => t.id) || [])
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                    Anuluj
                  </button>
                </div>
              </div>
            ) : (
              <>
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

                {/* Tags */}
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

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Utworzono: {formatDate(topic.created_at)}</span>
                  <span>•</span>
                  <span>Aktualizacja: {formatDate(topic.updated_at)}</span>
                  <span>•</span>
                  <span>{topic.view_count} wyświetleń</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!isEditingTopic && (
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
                onClick={() => {
                  setIsEditingTopic(true)
                  setEditTitle(topic.title)
                  setEditDescription(topic.description || '')
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                title="Edytuj temat"
              >
                <Edit className="w-5 h-5" />
              </button>
              
              {/* Menu z trzema kropkami */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                  title="Więcej opcji"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-20 py-1">
                      <button
                        onClick={handleTogglePin}
                        className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                      >
                        <Pin className="w-4 h-4" />
                        {topic.is_pinned ? 'Odepnij' : 'Przypnij'}
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          setShowTagPicker(true)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                      >
                        <Tag className="w-4 h-4" />
                        Zarządzaj tagami
                      </button>
                      <button
                        onClick={handleArchiveTopic}
                        className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        {topic.is_archived ? 'Przywróć' : 'Archiwizuj'}
                      </button>
                      <hr className="my-1 border-slate-600" />
                      <button
                        onClick={handleDeleteTopic}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Usuń temat
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Notes Section */}
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

        {/* New Note Editor */}
        {showNewNote && (
          <div className="mb-4">
            <NoteEditor
              onSave={handleSaveNote}
              onCancel={() => setShowNewNote(false)}
            />
          </div>
        )}

        {/* Notes List */}
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
            {notes.map((note) => (
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

      {/* Tag Picker Modal */}
      {showTagPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-slate-100">Zarządzaj tagami</h2>
              <button
                onClick={() => setShowTagPicker(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-400 text-sm mb-4">Wybierz tagi dla tego tematu:</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {allTags.map((tag: any) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTopicTag(tag.id)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      topicTags.includes(tag.id)
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: `${tag.color}20`,
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTagPicker(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg"
                >
                  Anuluj
                </button>
                <button
                  onClick={async () => {
                    setSaving(true)
                    try {
                      // Usuń stare tagi
                      await supabase
                        .from('topic_tags')
                        .delete()
                        .eq('topic_id', topicId)
                      
                      // Dodaj nowe
                      if (topicTags.length > 0) {
                        await supabase
                          .from('topic_tags')
                          .insert(topicTags.map(tagId => ({ topic_id: topicId, tag_id: tagId })))
                      }
                      
                      setShowTagPicker(false)
                      refetch()
                    } catch (err: any) {
                      console.error('Error updating tags:', err)
                      alert('Błąd: ' + err.message)
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg font-medium"
                >
                  {saving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
