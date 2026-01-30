// src/pages/NotFound.tsx
// Strona 404

import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-bold text-slate-700 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Strona nie znaleziona
        </h1>
        <p className="text-slate-400 mb-8">
          Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Strona główna
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Szukaj
          </Link>
        </div>
      </div>
    </div>
  )
}
