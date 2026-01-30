// src/components/navigation/Header.tsx
// Nagłówek aplikacji z wyszukiwarką

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { 
  Menu, Search, Plus, LogOut, User, Bell, 
  ChevronDown, X 
} from 'lucide-react'
import { debounce } from '../../utils/helpers'
import NewTopicModal from '../modals/NewTopicModal'

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNewTopicModal, setShowNewTopicModal] = useState(false)

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`)
      }
    }, 300),
    [navigate]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KB</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">
                Baza Wiedzy
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Szukaj w bazie wiedzy..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
                         text-slate-100 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
                         transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* New Topic Button */}
            <button
              onClick={() => setShowNewTopicModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 
                       rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nowy temat</span>
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <ChevronDown className="w-4 h-4 hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-700 text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Wyloguj się
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <NewTopicModal 
          onClose={() => setShowNewTopicModal(false)}
          onSuccess={(topicId) => {
            setShowNewTopicModal(false)
            navigate(`/topic/${topicId}`)
          }}
        />
      )}
    </>
  )
}
