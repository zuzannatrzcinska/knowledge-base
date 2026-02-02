// src/components/notes/NoteCard.tsx
// Karta pojedynczej notatki z wyświetlaniem HTML

import { useState } from 'react'
import { 
  Edit, Trash2, MoreVertical, ChevronDown, ChevronUp, Paperclip
} from 'lucide-react'
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

      {/* Content - wyświetlanie HTML */}
      {isExpanded && (
        <div className="px-4 py-3">
          <div 
            className="prose prose-invert prose-sm max-w-none
                       [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-200 [&_h2]:mt-4 [&_h2]:mb-2
                       [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-300 [&_h3]:mt-3 [&_h3]:mb-1
                       [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6
                       [&_li]:text-slate-300
                       [&_a]:text-cyan-400 [&_a]:underline
                       [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400
                       [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                       [&_th]:border [&_th]:border-slate-600 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-slate-700 [&_th]:text-left [&_th]:text-slate-200
                       [&_td]:border [&_td]:border-slate-600 [&_td]:px-3 [&_td]:py-2 [&_td]:text-slate-300
                       [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
                       [&_code]:bg-slate-700 [&_code]:px-1 [&_code]:rounded [&_code]:text-cyan-300
                       [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2
                       [&_p]:text-slate-300 [&_p]:mb-2
                       [&_strong]:font-bold [&_strong]:text-slate-100
                       [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />

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
