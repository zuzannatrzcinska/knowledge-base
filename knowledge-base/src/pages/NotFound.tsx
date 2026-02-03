// src/pages/NotFound.tsx
// Strona 404

import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-2">Strona nie znaleziona</h2>
        <p className="text-slate-400 mb-8">
          Przepraszamy, nie możemy znaleźć strony której szukasz.
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
