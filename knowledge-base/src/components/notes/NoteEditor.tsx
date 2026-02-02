// src/components/notes/NoteEditor.tsx
// Edytor notatek WYSIWYG z obsługą obrazów i tabel

import { useState, useRef, useCallback } from 'react'
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Link as LinkIcon, Image, Save, X, Hash, Eye, Edit,
  Table, Code, Quote, Heading1, Heading2, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react'
import { useTags } from '../../hooks/useKnowledgeBase'
import { supabase } from '../../lib/supabase'

interface NoteEditorProps {
  initialNote?: any
  onSave: (data: { title?: string; content: string; tagIds?: string[] }) => Promise<void>
  onCancel: () => void
}

export default function NoteEditor({ initialNote, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialNote?.tags?.map((t: any) => t.id) || []
  )
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { tags } = useTags()

  // Wykonaj polecenie formatowania
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  // Wstaw link
  const insertLink = () => {
    const url = prompt('Podaj URL linku:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  // Wstaw tabelę
  const insertTable = () => {
    const rows = prompt('Liczba wierszy:', '3')
    const cols = prompt('Liczba kolumn:', '3')
    
    if (rows && cols) {
      const r = parseInt(rows)
      const c = parseInt(cols)
      
      let tableHtml = '<table class="w-full border-collapse my-4"><thead><tr>'
      for (let j = 0; j < c; j++) {
        tableHtml += '<th class="border border-slate-600 px-3 py-2 bg-slate-700 text-left">Nagłówek</th>'
      }
      tableHtml += '</tr></thead><tbody>'
      
      for (let i = 0; i < r - 1; i++) {
        tableHtml += '<tr>'
        for (let j = 0; j < c; j++) {
          tableHtml += '<td class="border border-slate-600 px-3 py-2">Komórka</td>'
        }
        tableHtml += '</tr>'
      }
      tableHtml += '</tbody></table><p></p>'
      
      execCommand('insertHTML', tableHtml)
    }
  }

  // Upload obrazu
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Proszę wybrać plik obrazu')
      return
    }

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `images/${user?.id}/${fileName}`
      
      // Upload do Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('knowledge-base')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Pobierz publiczny URL
      const { data } = supabase.storage
        .from('knowledge-base')
        .getPublicUrl(filePath)
      
      // Wstaw obraz do edytora
      const imgHtml = `<img src="${data.publicUrl}" alt="${file.name}" class="max-w-full h-auto rounded-lg my-2" />`
      execCommand('insertHTML', imgHtml)
    } catch (err: any) {
      console.error('Error uploading image:', err)
      alert('Błąd uploadu: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // Obsługa wklejania obrazów
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          await handleImageUpload(file)
        }
        return
      }
    }
  }, [])

  // Obsługa drag & drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer?.files
    if (!files) return

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        await handleImageUpload(file)
      }
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Wstaw blok kodu
  const insertCodeBlock = () => {
    const code = '<pre class="bg-slate-900 p-4 rounded-lg overflow-x-auto my-4"><code>// Kod tutaj</code></pre><p></p>'
    execCommand('insertHTML', code)
  }

  // Wstaw cytat
  const insertQuote = () => {
    const quote = '<blockquote class="border-l-4 border-cyan-500 pl-4 my-4 italic text-slate-400">Cytat tutaj</blockquote><p></p>'
    execCommand('insertHTML', quote)
  }

  const handleSave = async () => {
    const content = editorRef.current?.innerHTML || ''
    if (!content.trim() || content === '<br>') {
      alert('Treść notatki nie może być pusta')
      return
    }
    
    setSaving(true)
    try {
      await onSave({ 
        title: title.trim() || undefined, 
        content: content,
        tagIds: selectedTags 
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // Inicjalizacja zawartości edytora
  const initContent = initialNote?.content || ''

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tytuł notatki (opcjonalnie)"
        className="w-full px-4 py-3 bg-transparent border-b border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
      />

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-1 px-2 py-2 border-b border-slate-700 bg-slate-800/30">
        {/* Formatowanie tekstu */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => execCommand('bold')}
            title="Pogrubienie (Ctrl+B)"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('italic')}
            title="Kursywa (Ctrl+I)"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('underline')}
            title="Podkreślenie (Ctrl+U)"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Nagłówki */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => execCommand('formatBlock', 'h2')}
            title="Nagłówek 1"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('formatBlock', 'h3')}
            title="Nagłówek 2"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Heading2 className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Listy */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => execCommand('insertUnorderedList')}
            title="Lista punktowana"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('insertOrderedList')}
            title="Lista numerowana"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Wyrównanie */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => execCommand('justifyLeft')}
            title="Wyrównaj do lewej"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('justifyCenter')}
            title="Wyśrodkuj"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('justifyRight')}
            title="Wyrównaj do prawej"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Wstawianie */}
        <div className="flex items-center gap-1">
          <button
            onClick={insertLink}
            title="Wstaw link"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Wstaw obraz"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            disabled={uploading}
          >
            <Image className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
              e.target.value = ''
            }}
          />
          <button
            onClick={insertTable}
            title="Wstaw tabelę"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={insertCodeBlock}
            title="Blok kodu"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={insertQuote}
            title="Cytat"
            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />
        
        {/* Tag Picker */}
        <div className="relative">
          <button
            onClick={() => setShowTagPicker(!showTagPicker)}
            className={`p-2 rounded hover:bg-slate-700 transition-colors ${
              selectedTags.length > 0 ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dodaj tagi"
          >
            <Hash className="w-4 h-4" />
            {selectedTags.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-xs rounded-full flex items-center justify-center text-white">
                {selectedTags.length}
              </span>
            )}
          </button>
          
          {showTagPicker && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowTagPicker(false)} 
              />
              <div className="absolute left-0 top-full mt-1 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                {tags.length === 0 ? (
                  <p className="px-3 py-2 text-slate-400 text-sm">Brak tagów</p>
                ) : (
                  tags.map((tag: any) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-600 ${
                        selectedTags.includes(tag.id) ? 'bg-slate-600/50' : ''
                      }`}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-slate-200">{tag.name}</span>
                      {selectedTags.includes(tag.id) && (
                        <span className="ml-auto text-cyan-400">✓</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Upload indicator */}
        {uploading && (
          <span className="text-xs text-cyan-400 ml-2">Uploading...</span>
        )}
      </div>

      {/* Editor Area */}
      <div 
        ref={editorRef}
        contentEditable
        className="min-h-[250px] p-4 text-slate-100 focus:outline-none prose prose-invert prose-sm max-w-none
                   [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-200 [&_h2]:mt-4 [&_h2]:mb-2
                   [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-300 [&_h3]:mt-3 [&_h3]:mb-1
                   [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6
                   [&_a]:text-cyan-400 [&_a]:underline
                   [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-500 [&_blockquote]:pl-4 [&_blockquote]:italic
                   [&_table]:w-full [&_table]:border-collapse
                   [&_th]:border [&_th]:border-slate-600 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-slate-700 [&_th]:text-left
                   [&_td]:border [&_td]:border-slate-600 [&_td]:px-3 [&_td]:py-2
                   [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
                   [&_code]:bg-slate-700 [&_code]:px-1 [&_code]:rounded [&_code]:text-cyan-300
                   [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
        dangerouslySetInnerHTML={{ __html: initContent }}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        suppressContentEditableWarning
      />

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-slate-700">
          {selectedTags.map(tagId => {
            const tag = tags.find((t: any) => t.id === tagId)
            if (!tag) return null
            return (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                style={{ 
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  border: `1px solid ${tag.color}40`
                }}
              >
                {tag.name}
                <button 
                  onClick={() => toggleTag(tag.id)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Hint */}
      <div className="px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        💡 Możesz wklejać obrazy bezpośrednio (Ctrl+V) lub przeciągać pliki
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-700 bg-slate-800/30">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 inline mr-2" />
          Anuluj
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          <Save className="w-4 h-4 inline mr-2" />
          {saving ? 'Zapisywanie...' : 'Zapisz'}
        </button>
      </div>
    </div>
  )
}
