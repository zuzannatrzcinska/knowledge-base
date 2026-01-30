// src/hooks/useKnowledgeBase.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ============================================
// Hook: Kategorie
// ============================================
export function useCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_category_tree')
      if (error) throw error
      setCategories(data || [])
    } catch (e: any) {
      setError(e.message || 'Błąd pobierania kategorii')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = async (category: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, created_by: user?.id })
      .select()
      .single()
    if (error) throw error
    await fetchCategories()
    return data
  }

  return { categories, loading, error, fetchCategories, createCategory }
}

// ============================================
// Hook: Tematy
// ============================================
export function useTopics(categoryId?: string) {
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('topics_with_stats')
        .select('*')
        .eq('is_archived', false)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query
      if (error) throw error
      setTopics(data || [])
    } catch (e: any) {
      setError(e.message || 'Błąd pobierania tematów')
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const createTopic = async (topic: any, tagIds?: string[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('topics')
      .insert({ ...topic, created_by: user?.id })
      .select()
      .single()
    if (error) throw error

    if (tagIds && tagIds.length > 0 && data) {
      await supabase
        .from('topic_tags')
        .insert(tagIds.map(tag_id => ({ topic_id: data.id, tag_id })))
    }

    await fetchTopics()
    return data
  }

  const updateTopic = async (id: string, updates: any) => {
    const { error } = await supabase.from('topics').update(updates).eq('id', id)
    if (error) throw error
    await fetchTopics()
  }

  const deleteTopic = async (id: string) => {
    const { error } = await supabase.from('topics').delete().eq('id', id)
    if (error) throw error
    await fetchTopics()
  }

  return { topics, loading, error, fetchTopics, createTopic, updateTopic, deleteTopic }
}

// ============================================
// Hook: Pojedynczy temat z notatkami
// ============================================
export function useTopic(topicId: string) {
  const [topic, setTopic] = useState<any | null>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTopic = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: topicData, error: topicError } = await supabase
        .from('topics_with_stats')
        .select('*')
        .eq('id', topicId)
        .single()

      if (topicError) throw topicError
      setTopic(topicData)

      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`*, note_tags(tag_id, tags(*)), attachments(*)`)
        .eq('topic_id', topicId)
        .order('sort_order')
        .order('created_at')

      if (notesError) throw notesError

      const notesWithRelations = (notesData || []).map((note: any) => ({
        ...note,
        tags: note.note_tags?.map((nt: any) => nt.tags).filter(Boolean) || [],
        attachments: note.attachments || []
      }))

      setNotes(notesWithRelations)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('recent_views')
          .upsert({ user_id: user.id, topic_id: topicId, viewed_at: new Date().toISOString() })
      }
    } catch (e: any) {
      setError(e.message || 'Błąd pobierania tematu')
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    if (topicId) fetchTopic()
  }, [topicId, fetchTopic])

  return { topic, notes, loading, error, refetch: fetchTopic }
}

// ============================================
// Hook: Notatki
// ============================================
export function useNotes(topicId: string) {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('topic_id', topicId)
      .order('sort_order')
      .order('created_at')
    setNotes(data || [])
    setLoading(false)
  }, [topicId])

  useEffect(() => {
    if (topicId) fetchNotes()
  }, [topicId, fetchNotes])

  const createNote = async (note: any, tagIds?: string[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('notes')
      .insert({ ...note, topic_id: topicId, created_by: user?.id })
      .select()
      .single()
    if (error) throw error

    if (tagIds && tagIds.length > 0 && data) {
      await supabase
        .from('note_tags')
        .insert(tagIds.map(tag_id => ({ note_id: data.id, tag_id })))
    }

    await fetchNotes()
    return data
  }

  const updateNote = async (id: string, updates: any) => {
    const { error } = await supabase.from('notes').update(updates).eq('id', id)
    if (error) throw error
    await fetchNotes()
  }

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
    await fetchNotes()
  }

  return { notes, loading, fetchNotes, createNote, updateNote, deleteNote }
}

// ============================================
// Hook: Tagi
// ============================================
export function useTags() {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTags = useCallback(async () => {
    const { data } = await supabase.from('tags').select('*').order('name')
    setTags(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const createTag = async (tag: any) => {
    const { data, error } = await supabase.from('tags').insert(tag).select().single()
    if (error) throw error
    await fetchTags()
    return data
  }

  const getOrCreateTag = async (name: string, color?: string) => {
    const existing = tags.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing
    return createTag({ name, color })
  }

  return { tags, loading, fetchTags, createTag, getOrCreateTag }
}

// ============================================
// Hook: Wyszukiwanie
// ============================================
export function useSearch() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setQuery(searchQuery)

    try {
      const { data, error } = await supabase.rpc('search_notes', { search_query: searchQuery })
      if (error) throw error
      setResults(data || [])
    } catch (e) {
      console.error('Search error:', e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const searchByTag = useCallback(async (tagId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('note_tags')
        .select(`notes(id, topic_id, title, content, topics(title, category_id, categories(name)))`)
        .eq('tag_id', tagId)

      if (error) throw error
      
      const formattedResults = (data || [])
        .filter((item: any) => item.notes)
        .map((item: any) => ({
          note_id: item.notes.id,
          topic_id: item.notes.topic_id,
          title: item.notes.title,
          content_preview: item.notes.content?.substring(0, 200) || '',
          rank: 1,
          category_name: item.notes.topics?.categories?.name || null,
          topic_title: item.notes.topics?.title || ''
        }))

      setResults(formattedResults)
    } catch (e) {
      console.error('Tag search error:', e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, query, search, searchByTag }
}

// ============================================
// Hook: Załączniki
// ============================================
export function useAttachments(noteId: string) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const fetchAttachments = useCallback(async () => {
    const { data } = await supabase
      .from('attachments')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: false })
    setAttachments(data || [])
  }, [noteId])

  useEffect(() => {
    if (noteId) fetchAttachments()
  }, [noteId, fetchAttachments])

  const uploadFile = async (file: File) => {
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `attachments/${noteId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('knowledge-base')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data, error } = await supabase
        .from('attachments')
        .insert({
          note_id: noteId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user?.id
        })
        .select()
        .single()

      if (error) throw error
      await fetchAttachments()
      return data
    } finally {
      setUploading(false)
    }
  }

  const deleteAttachment = async (attachment: any) => {
    await supabase.storage.from('knowledge-base').remove([attachment.file_path])
    await supabase.from('attachments').delete().eq('id', attachment.id)
    await fetchAttachments()
  }

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from('knowledge-base').getPublicUrl(filePath)
    return data.publicUrl
  }

  return { attachments, uploading, uploadFile, deleteAttachment, getFileUrl }
}

// ============================================
// Hook: Ulubione
// ============================================
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase.from('favorites').select('topic_id').eq('user_id', user.id)
    setFavorites(data?.map((f: any) => f.topic_id) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const toggleFavorite = async (topicId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isFav = favorites.includes(topicId)

    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('topic_id', topicId)
      setFavorites(prev => prev.filter(id => id !== topicId))
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, topic_id: topicId })
      setFavorites(prev => [...prev, topicId])
    }
  }

  const isFavorite = (topicId: string) => favorites.includes(topicId)

  return { favorites, loading, toggleFavorite, isFavorite }
}

// ============================================
// Hook: Historia notatki
// ============================================
export function useNoteHistory(noteId: string) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('note_history')
        .select(`*, users(full_name, avatar_url)`)
        .eq('note_id', noteId)
        .order('created_at', { ascending: false })
      setHistory(data || [])
      setLoading(false)
    }
    if (noteId) fetchHistory()
  }, [noteId])

  const restoreVersion = async (historyId: string) => {
    const version = history.find((h: any) => h.id === historyId)
    if (!version) return
    await supabase.from('notes').update({ title: version.title, content: version.content }).eq('id', noteId)
  }

  return { history, loading, restoreVersion }
}

// ============================================
// Hook: Ostatnio przeglądane
// ============================================
export function useRecentViews(limit = 10) {
  const [recentTopics, setRecentTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: recentData } = await supabase
        .from('recent_views')
        .select('topic_id')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(limit)

      if (recentData && recentData.length > 0) {
        const topicIds = recentData.map((r: any) => r.topic_id)
        const { data: topics } = await supabase
          .from('topics_with_stats')
          .select('*')
          .in('id', topicIds)

        const orderedTopics = topicIds
          .map((id: string) => topics?.find((t: any) => t.id === id))
          .filter(Boolean)

        setRecentTopics(orderedTopics)
      }

      setLoading(false)
    }

    fetchRecent()
  }, [limit])

  return { recentTopics, loading }
}
