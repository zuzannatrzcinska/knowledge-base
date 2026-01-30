// src/App.tsx
// Główny komponent aplikacji

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'

// Layouts
import MainLayout from './components/layouts/MainLayout'

// Pages
import Dashboard from './pages/Dashboard'
import TopicView from './pages/TopicView'
import CategoryView from './pages/CategoryView'
import SearchResults from './pages/SearchResults'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pobierz aktualną sesję
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Nasłuchuj zmian sesji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="category/:categoryId" element={<CategoryView />} />
          <Route path="topic/:topicId" element={<TopicView />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
