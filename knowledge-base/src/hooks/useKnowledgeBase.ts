// src/hooks/useKnowledgeBase.ts
// Hooki do obsługi danych z bazy wiedzy

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Hook do kategorii
export function useCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
      
      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, refetch: fetchCategories }
}

// Hook do pojedynczej kategorii
export function useCategory(categoryId: string) {
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategory() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single()
        
        if (error) throw error
        setCategory(data)
      } catch (err) {
        console.error('Error fetching category:', err)
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId])

  return { category, loading }
}

// Hook do tematów
export function useTopics(categoryId?: string) {
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTopics = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('topics')
        .select(`
          *,
          categories(name, color),
          notes(count)
        `)
        .eq('is_archived', false)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      // Pobierz tagi dla każdego tematu
      const topicsWithTags = await Promise.all((data || []).map(async (topic: any) => {
        const { data: tagData } = await supabase
          .from('topic_tags')
          .select('tags(*)')
          .eq('topic_id', topic.id)
        
        return {
          ...topic,
          category_name: topic.categories?.name,
          category_color: topic.categories?.color,
          notes_count: topic.notes?.[0]?.count || 0,
          tags: tagData?.map((t: any) => t.tags) || []
        }
      }))
      
      setTopics(topicsWithTags)
    } catch (err) {
      console.error('Error fetching topics:', err)
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const createTopic = async (topicData: any, tagIds?: string[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('topics')
      .insert({
        ...topicData,
        created_by: user?.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Dodaj tagi
    if (tagIds && tagIds.length > 0 && data) {
      await supabase
        .from('topic_tags')
        .insert(tagIds.map(tagId => ({ topic_id: data.id, tag_id: tagId })))
    }
    
    fetchTopics()
    return data
  }

  const updateTopic = async (topicId: string, updates: any) => {
    const { error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', topicId)
    
    if (error) throw error
    fetchTopics()
  }

  const deleteTopic = async (topicId: string) => {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId)
    
    if (error) throw error
    fetchTopics()
  }

  return { topics, loading, createTopic, updateTopic, deleteTopic, refetch: fetchTopics }
}

// Hook do pojedynczego tematu
export function useTopic(topicId: string) {
  const [topic, setTopic] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTopic = useCallback(async () => {
    setLoading(true)
    try {
      // Pobierz temat
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select(`
          *,
          categories(name, color)
        `)
        .eq('id', topicId)
        .single()
      
      if (topicError) throw topicError
      
      // Pobierz tagi tematu
      const { data: tagData } = await supabase
        .from('topic_tags')
        .select('tags(*)')
        .eq('topic_id', topicId)
      
      // Pobierz notatki
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('topic_id', topicId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      
      if (notesError) throw notesError
      
      // Pobierz tagi i załączniki dla każdej notatki
      const notesWithDetails = await Promise.all((notesData || []).map(async (note: any) => {
        const { data: noteTagData } = await supabase
          .from('note_tags')
          .select('tags(*)')
          .eq('note_id', note.id)
        
        const { data: attachmentData } = await supabase
          .from('attachments')
          .select('*')
          .eq('note_id', note.id)
        
        return {
          ...note,
          tags: noteTagData?.map((t: any) => t.tags) || [],
          attachments: attachmentData || []
        }
      }))
      
      setTopic({
        ...topicData,
        category_name: topicData.categories?.name,
        category_color: topicData.categories?.color,
        tags: tagData?.map((t: any) => t.tags) || []
      })
      setNotes(notesWithDetails)
      
      // Zapisz ostatnie przeglądanie
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('recent_views')
          .upsert({
            user_id: user.id,
            topic_id: topicId,
            viewed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,topic_id'
          })
        
        // Zwiększ licznik wyświetleń
        await supabase
          .from('topics')
          .update({ view_count: (topicData.view_count || 0) + 1 })
          .eq('id', topicId)
      }
    } catch (err) {
      console.error('Error fetching topic:', err)
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    if (topicId) {
      fetchTopic()
    }
  }, [topicId, fetchTopic])

  return { topic, notes, loading, refetch: fetchTopic }
}

// Hook do notatek
export function useNotes(topicId: string) {
  const createNote = async (noteData: any, tagIds?: string[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...noteData,
        topic_id: topicId,
        created_by: user?.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Dodaj tagi
    if (tagIds && tagIds.length > 0 && data) {
      await supabase
        .from('note_tags')
        .insert(tagIds.map(tagId => ({ note_id: data.id, tag_id: tagId })))
    }
    
    return data
  }

  const updateNote = async (noteId: string, updates: any) => {
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
    
    if (error) throw error
  }

  const deleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    
    if (error) throw error
  }

  return { createNote, updateNote, deleteNote }
}

// Hook do tagów
export function useTags() {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTags = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      setTags(data || [])
    } catch (err) {
      console.error('Error fetching tags:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const createTag = async (name: string, color?: string) => {
    const { data, error } = await supabase
      .from('tags')
      .insert({ name, color: color || '#6B7280' })
      .select()
      .single()
    
    if (error) throw error
    fetchTags()
    return data
  }

  return { tags, loading, createTag, refetch: fetchTags }
}

// Hook do ulubionych
export function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setFavorites([])
        return
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          topics(id, title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setFavorites(data || [])
    } catch (err) {
      console.error('Error fetching favorites:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const toggleFavorite = async (topicId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const isFav = favorites.some(f => f.topic_id === topicId)
    
    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, topic_id: topicId })
      
      if (error) throw error
    }
    
    fetchFavorites()
  }

  const isFavorite = (topicId: string) => {
    return favorites.some(f => f.topic_id === topicId)
  }

  return { favorites, loading, toggleFavorite, isFavorite, refetch: fetchFavorites }
}

// Hook do ostatnio przeglądanych
export function useRecentViews(limit: number = 10) {
  const [recentTopics, setRecentTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentViews() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setRecentTopics([])
          return
        }

        const { data, error } = await supabase
          .from('recent_views')
          .select(`
            *,
            topics(id, title)
          `)
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(limit)
        
        if (error) throw error
        setRecentTopics(data?.map((rv: any) => rv.topics).filter(Boolean) || [])
      } catch (err) {
        console.error('Error fetching recent views:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentViews()
  }, [limit])

  return { recentTopics, loading }
}

// Hook do załączników
export function useAttachments(noteId: string) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchAttachments() {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching attachments:', error)
        return
      }
      setAttachments(data || [])
    }

    if (noteId) {
      fetchAttachments()
    }
  }, [noteId])

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `notes/${noteId}/${fileName}`
      
      // Upload pliku
      const { error: uploadError } = await supabase.storage
        .from('knowledge-base')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Zapisz w bazie
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
      setAttachments(prev => [...prev, data])
      return data
    } finally {
      setUploading(false)
    }
  }

  const deleteAttachment = async (attachment: any) => {
    // Usuń plik ze storage
    await supabase.storage
      .from('knowledge-base')
      .remove([attachment.file_path])
    
    // Usuń z bazy
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachment.id)
    
    if (error) throw error
    setAttachments(prev => prev.filter(a => a.id !== attachment.id))
  }

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('knowledge-base')
      .getPublicUrl(filePath)
    return data.publicUrl
  }

  return { attachments, uploading, uploadFile, deleteAttachment, getFileUrl }
}

// Hook do wyszukiwania
export function useSearch(query: string) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .rpc('search_notes', { search_query: query })
        
        if (error) throw error
        setResults(data || [])
      } catch (err) {
        console.error('Error searching:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  return { results, loading }
}
