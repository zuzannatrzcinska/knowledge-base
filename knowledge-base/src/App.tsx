// src/App.tsx
// Główny komponent aplikacji z routingiem - ZAKTUALIZOWANY

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Header from './components/navigation/Header'
import Sidebar from './components/navigation/Sidebar'
import HomePage from './pages/HomePage'
import CategoryView from './pages/CategoryView'
import TopicView from './pages/TopicView'
import SearchResults from './pages/SearchResults'
import DeviceComparator from './pages/DeviceComparator'
import AuthPage from './pages/AuthPage'
import NotFound from './pages/NotFound'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

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
    return <AuthPage />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className={`
          pt-20 pb-8 px-4 md:px-8 min-h-screen
          transition-all duration-300
          ${sidebarOpen ? 'ml-64' : 'ml-0'}
        `}>
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:categoryId" element={<CategoryView />} />
              <Route path="/topic/:topicId" element={<TopicView />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/devices" element={<DeviceComparator />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
