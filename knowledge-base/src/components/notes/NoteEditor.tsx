// src/components/notes/NoteEditor.tsx
// Edytor notatek z obsługą Markdown

import { useState, useRef } from 'react'
import { 
  Bold, Italic, List, ListOrdered, Code, 
  Link as LinkIcon, Image, Save, X, Hash, Eye, Edit
} from 'lucide-react'
import { useTags } from '../../hooks/useKnowledgeBase'
import type { Note, Tag } from '../../lib/database.types'
import ReactMarkdown from 'react-markdown'

interface NoteEditorProps {
  initialNote?: Partial<Note>
  onSave: (data: { title?: string; content: string; tagIds?: string[] }) => Promise<void>
  onCancel: () => void
}

export default function NoteEditor({ initialNote, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || '')
  const [content, setContent] = useState(initialNote?.content || '')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { tags } = useTags()

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end)
    
    setContent(newContent)
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleSave = async () => {
    if (!content.trim()) return
    
    setSaving(true)
    try {
      await onSave({ 
        title: title.trim() || undefined, 
        content: content.trim(),
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

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: 'Pogrubienie' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: 'Kursywa' },
    { icon: Code, action: () => insertMarkdown('`', '`'), title: 'Kod inline' },
    { icon: List, action: () => insertMarkdown('\n- '), title: 'Lista punktowana' },
    { icon: ListOrdered, action: () => insertMarkdown('\n1. '), title: 'Lista numerowana' },
    { icon: LinkIcon, action: () => insertMarkdown('[', '](url)'), title: 'Link' },
    { icon: Image, action: () => insertMarkdown('![alt](', ')'), title: 'Obrazek' },
  ]

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
      <div className="flex items-center justify-between px-2 py-2 border-b border-slate-700 bg-slate-800/30">
        <div className="flex items-center gap-1">
          {toolbarButtons.map(({ icon: Icon, action, title }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
          
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-xs rounded-full flex items-center justify-center">
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
                  {tags.map(tag => (
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
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview Toggle */}
        <button
          onClick={() => setIsPreview(!isPreview)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
            isPreview 
              ? 'bg-cyan-600/20 text-cyan-400' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          {isPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isPreview ? 'Edycja' : 'Podgląd'}
        </button>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[200px]">
        {isPreview ? (
          <div className="p-4 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{content || '*Brak treści*'}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Napisz notatkę... (obsługuje Markdown)"
            className="w-full min-h-[200px] p-4 bg-transparent text-slate-100 placeholder-slate-500 resize-y focus:outline-none font-mono text-sm"
          />
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-slate-700">
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId)
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
          disabled={!content.trim() || saving}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          <Save className="w-4 h-4 inline mr-2" />
          {saving ? 'Zapisywanie...' : 'Zapisz'}
        </button>
      </div>
    </div>
  )
}
