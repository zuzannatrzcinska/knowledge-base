// src/components/attachments/AttachmentsList.tsx
// Lista załączników z możliwością uploadu

import { useRef } from 'react'
import { Upload, Paperclip, Trash2, Download, Image, File } from 'lucide-react'
import { useAttachments } from '../../hooks/useKnowledgeBase'
import { formatFileSize, getFileIcon } from '../../utils/helpers'

interface AttachmentsListProps {
  noteId: string
}

export default function AttachmentsList({ noteId }: AttachmentsListProps) {
  const { attachments, uploading, uploadFile, deleteAttachment, getFileUrl } = useAttachments(noteId)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      await uploadFile(file)
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const isImage = (mimeType: string) => mimeType?.startsWith('image/')

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className={`
          flex items-center justify-center gap-2 px-4 py-3
          border-2 border-dashed border-slate-600 rounded-lg
          text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50
          transition-colors cursor-pointer
          ${uploading ? 'opacity-50 cursor-wait' : ''}
        `}>
          <Upload className="w-5 h-5" />
          <span>{uploading ? 'Wgrywanie...' : 'Przeciągnij pliki lub kliknij aby wybrać'}</span>
        </div>
      </div>

      {/* Attachments Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {attachments.map(attachment => {
            const url = getFileUrl(attachment.file_path)
            
            return (
              <div
                key={attachment.id}
                className="group relative bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600 hover:border-slate-500 transition-colors"
              >
                {/* Preview */}
                {isImage(attachment.mime_type || '') ? (
                  <div className="aspect-square bg-slate-800">
                    <img 
                      src={url} 
                      alt={attachment.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-slate-800 flex items-center justify-center">
                    <span className="text-4xl">{getFileIcon(attachment.mime_type || '')}</span>
                  </div>
                )}

                {/* Info */}
                <div className="p-2">
                  <p className="text-sm text-slate-200 truncate" title={attachment.file_name}>
                    {attachment.file_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.file_size || 0)}
                  </p>
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
                    title="Otwórz"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm('Czy na pewno chcesz usunąć ten załącznik?')) {
                        deleteAttachment(attachment)
                      }
                    }}
                    className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                    title="Usuń"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
