import { useState, useEffect, memo } from 'react'
import { supabase } from '../lib/supabaseClient'

function Dashboard({ onAddClick, refreshTrigger }) {
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalEntries: 0,
    goldCount: 0,
    silverCount: 0,
    goldAmount: 0,
    silverAmount: 0,
    avgInvestment: 0,
    lastInvestment: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const fetchStats = async () => {
    try {
      // Only show loading skeleton on initial load
      if (stats.totalEntries === 0 && !stats.totalInvested) {
        setLoading(true)
      }
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const totalInvested = data.reduce((sum, entry) => sum + parseFloat(entry.amount), 0)
      const goldEntries = data.filter(e => e.currency === 'Gold')
      const silverEntries = data.filter(e => e.currency === 'Silver')
      const goldAmount = goldEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      const silverAmount = silverEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0)

      setStats({
        totalInvested,
        totalEntries: data.length,
        goldCount: goldEntries.length,
        silverCount: silverEntries.length,
        goldAmount,
        silverAmount,
        avgInvestment: data.length > 0 ? totalInvested / data.length : 0,
        lastInvestment: data[0] || null
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-8">
      {/* Page Title */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600">Overview of your portfolio</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
        {/* Total Invested - Mobile: col 1, Desktop: col 1 */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl p-4 sm:p-6 text-white transition-all">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-yellow-100 text-xs sm:text-sm font-semibold uppercase tracking-wide">Total</div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1">
            ₹{stats.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-yellow-100 text-xs sm:text-sm flex items-center gap-1">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {stats.totalEntries} {stats.totalEntries === 1 ? 'entry' : 'entries'}
          </div>
        </div>

        {/* Average Investment - Mobile: col 2, Desktop: col 4 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl hover:border-blue-300 transition-all lg:order-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Average</div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">
            ₹{stats.avgInvestment.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">
            per investment
          </div>
        </div>

        {/* Gold Investments - Mobile: row 2 col 1, Desktop: col 2 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl hover:border-yellow-300 transition-all lg:order-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Gold</div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">
            ₹{stats.goldAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
            <span>{stats.goldCount}</span>
          </div>
        </div>

        {/* Silver Investments - Mobile: row 2 col 2, Desktop: col 3 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl hover:border-gray-300 transition-all lg:order-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">Silver</div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">
            ₹{stats.silverAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
            <span>{stats.silverCount}</span>
          </div>
        </div>

      </div>


    </div>
  )
}

export default memo(Dashboard)
