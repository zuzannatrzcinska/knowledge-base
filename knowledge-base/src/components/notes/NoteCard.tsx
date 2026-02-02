// src/components/notes/NoteCard.tsx
// Karta pojedynczej notatki

import { useState } from 'react'
import { 
  Edit, Trash2, MoreVertical, ChevronDown, ChevronUp, Paperclip
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import NoteEditor from './NoteEditor'
import { formatDate, formatRelativeDate } from '../../utils/helpers'

interface NoteCardProps {
  note: any
  isEditing: boolean
  onEdit: () => void
  onSave: (data: { title?: string; content: string; tagIds?: string[] }) => Promise<void>
  onCancel: () => void
  onDelete: () => void
}

export default function NoteCard({ 
  note, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete 
}: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  if (isEditing) {
    return (
      <NoteEditor
        initialNote={note}
        onSave={onSave}
        onCancel={onCancel}
      />
    )
  }

  return (
    <article className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {note.title ? (
            <h3 className="font-medium text-slate-200 truncate">{note.title}</h3>
          ) : (
            <span className="text-slate-400 italic">Bez tytułu</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {note.tags.slice(0, 2).map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ 
                    backgroundColor: `${tag.color}20`,
                    color: tag.color
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-xs text-slate-500">+{note.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Attachments indicator */}
          {note.attachments && note.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Paperclip className="w-3 h-3" />
              {note.attachments.length}
            </span>
          )}

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-20 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onEdit()
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edytuj
                  </button>
                  <hr className="my-1 border-slate-600" />
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDelete()
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Usuń
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                a: ({ children, href, ...props }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-cyan-400 hover:underline"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                code: ({ children, className, ...props }) => {
                  const isInline = !className
                  return isInline 
                    ? <code className="bg-slate-700 px-1 py-0.5 rounded text-cyan-300" {...props}>{children}</code>
                    : <code className="block bg-slate-900 p-3 rounded-lg overflow-x-auto" {...props}>{children}</code>
                },
                pre: ({ children, ...props }) => (
                  <pre className="bg-slate-900 rounded-lg overflow-hidden" {...props}>{children}</pre>
                )
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>

          {/* Attachments */}
          {note.attachments && note.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Załączniki ({note.attachments.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {note.attachments.map((attachment: any) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
                  >
                    <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                    <span className="text-sm text-slate-300 truncate">
                      {attachment.file_name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>Zaktualizowano {formatRelativeDate(note.updated_at)}</span>
        <span>{formatDate(note.created_at)}</span>
      </footer>
    </article>
  )
}
