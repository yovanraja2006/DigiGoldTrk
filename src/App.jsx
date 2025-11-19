import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import EntryForm from './components/EntryForm'
import EntryList from './components/EntryList'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    const authTime = localStorage.getItem('authTime')
    
    // Session expires after 24 hours
    const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    if (authStatus === 'true' && authTime) {
      const elapsed = Date.now() - parseInt(authTime)
      if (elapsed < SESSION_DURATION) {
        setIsAuthenticated(true)
      } else {
        // Session expired
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('authTime')
      }
    }
    
    setLoading(false)
  }, [])

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('authTime')
    setIsAuthenticated(false)
  }

  const handleEntryAdded = () => {
    // Trigger refresh of entry list and dashboard
    setRefreshTrigger(prev => prev + 1)
    // Close the add form after successful addition
    setShowAddForm(false)
    // Scroll to top to see the new entry
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDataUpdate = () => {
    // Trigger dashboard refresh when data changes (delete, etc.)
    setRefreshTrigger(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
          <div className="flex justify-between items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800">
                  Gold Tracker
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Investment Management</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Dashboard Stats */}
        <Dashboard onAddClick={() => setShowAddForm(true)} refreshTrigger={refreshTrigger} />

        
        
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Investment History (Desktop) / First on Mobile */}
          <div className="lg:col-span-2 order-1">
            <EntryList 
              refreshTrigger={refreshTrigger} 
              onAddClick={() => setShowAddForm(true)} 
              onDataUpdate={handleDataUpdate}
            />
          </div>

          {/* Right Column - Add Investment (Desktop) / Second on Mobile */}
          <div className="lg:col-span-1 order-2">
            <div className="lg:sticky lg:top-24">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full group"
                >
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 sm:p-8 text-center transform hover:scale-105">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-white/30 transition-colors">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Add Investment</h3>
                    <p className="text-yellow-100 text-xs sm:text-sm">Record a new investment</p>
                  </div>
                </button>
              ) : (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-yellow-400 overflow-hidden animate-fadeIn">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Investment
                    </h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4 sm:p-6">
                    <EntryForm onEntryAdded={handleEntryAdded} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 lg:mt-16 py-4 sm:py-6 lg:py-8 text-center text-xs sm:text-sm text-gray-500 border-t border-gray-200 bg-white/50">
        <div className="container mx-auto px-3 sm:px-4">
          <p className="font-medium text-gray-700">Digital Gold Tracker</p>
          <p className="mt-1 text-xs">Secured with Supabase</p>
        </div>
      </footer>
    </div>
  )
}

export default App
