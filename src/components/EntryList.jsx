import { useState, useEffect } from 'react'
import { supabase, STORAGE_BUCKET } from '../lib/supabaseClient'

export default function EntryList({ refreshTrigger, onAddClick, onDataUpdate }) {
  const [entries, setEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Sorting
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Searching
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCurrency, setFilterCurrency] = useState('all')

  useEffect(() => {
    fetchEntries()
  }, [refreshTrigger])

  useEffect(() => {
    applyFiltersAndSort()
  }, [entries, searchTerm, filterCurrency, sortBy, sortOrder])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch all investments (single-user app)
      const { data, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setEntries(data || [])

      // Calculate total
      const sum = (data || []).reduce((acc, entry) => acc + parseFloat(entry.amount), 0)
      setTotal(sum)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...entries]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.amount.toString().includes(searchTerm) ||
        entry.currency.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply currency filter
    if (filterCurrency !== 'all') {
      filtered = filtered.filter(entry => entry.currency === filterCurrency)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at) - new Date(b.created_at)
          break
        case 'amount':
          comparison = parseFloat(a.amount) - parseFloat(b.amount)
          break
        case 'currency':
          comparison = a.currency.localeCompare(b.currency)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredEntries(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getSignedUrl = async (path) => {
    if (!path) return null

    try {
      // Generate signed URL valid for 1 hour (3600 seconds)
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, 3600)

      if (error) throw error
      return data.signedUrl
    } catch (err) {
      console.error('Error generating signed URL:', err)
      return null
    }
  }

  const handleViewScreenshot = async (path) => {
    const url = await getSignedUrl(path)
    if (url) {
      window.open(url, '_blank')
    } else {
      alert('Unable to load screenshot')
    }
  }

  const handleDelete = async (id, screenshotPath) => {
    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Delete screenshot from storage if exists
      if (screenshotPath) {
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([screenshotPath])
      }

      // Refresh list
      fetchEntries()
      setDeleteConfirm(null)

      // Notify parent component about data change
      if (onDataUpdate) {
        onDataUpdate()
      }
    } catch (err) {
      alert('Error deleting entry: ' + err.message)
    }
  }

  const exportToCSV = () => {
    if (entries.length === 0) return

    const headers = ['Date & Time', 'Amount', 'Currency', 'Receipt URL', 'Notes']
    const rows = entries.map(entry => [
      new Date(entry.created_at).toLocaleString(),
      entry.amount,
      entry.currency,
      entry.receipt_url || '',
      entry.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `investments_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading investments...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold">Error loading investments</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Investment History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {entries.length} {entries.length === 1 ? 'investment' : 'investments'} recorded
            </p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      {entries.length > 0 && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by amount, currency, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Currency */}
            <div className="w-full lg:w-48">
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              >
                <option value="all">All Currencies</option>
                <option value="Gold">Gold Only</option>
                <option value="Silver">Silver Only</option>
              </select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="currency-asc">Currency A-Z</option>
                <option value="currency-desc">Currency Z-A</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {currentEntries.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredEntries.length)} of {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
              {searchTerm && ` (filtered from ${entries.length} total)`}
            </div>
            {(searchTerm || filterCurrency !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterCurrency('all')
                }}
                className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {filteredEntries.length === 0 && entries.length > 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterCurrency('all')
            }}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No investments yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your gold and silver investments</p>
          <button
            onClick={onAddClick}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Investment
          </button>
        </div>
      ) : (
        <div className="p-6">
          {/* Desktop Table View */}
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">S. No</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gold (g/p)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Silver</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Screenshot</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Receipt</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Notes</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((entry, index) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{indexOfFirstItem + index + 1}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                      ₹{parseFloat(entry.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {entry.currency === 'Gold' ? (
                        <span className="text-yellow-700 font-medium">
                          ₹{parseFloat(entry.amount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {entry.currency === 'Silver' ? (
                        <span className="text-gray-700 font-medium">
                          ₹{parseFloat(entry.amount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {entry.screenshot_path ? (
                        <button
                          onClick={() => handleViewScreenshot(entry.screenshot_path)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {entry.receipt_url ? (
                        <a
                          href={entry.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                      {entry.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {deleteConfirm === entry.id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleDelete(entry.id, entry.screenshot_path)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(entry.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {currentEntries.map((entry, index) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-gray-500">#{indexOfFirstItem + index + 1}</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.currency === 'Gold' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.currency}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{parseFloat(entry.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Gold (g/p)</p>
                    <p className="text-lg font-bold text-yellow-700">
                      {entry.currency === 'Gold' ? `₹${parseFloat(entry.amount).toFixed(2)}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Silver</p>
                    <p className="text-lg font-bold text-gray-700">
                      {entry.currency === 'Silver' ? `₹${parseFloat(entry.amount).toFixed(2)}` : '—'}
                    </p>
                  </div>
                </div>
                {entry.notes && (
                  <p className="text-sm text-gray-600 mb-3">{entry.notes}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {entry.screenshot_path && (
                    <button
                      onClick={() => handleViewScreenshot(entry.screenshot_path)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100"
                    >
                      View Screenshot
                    </button>
                  )}
                  {entry.receipt_url && (
                    <a
                      href={entry.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100"
                    >
                      Receipt Link
                    </a>
                  )}
                  {deleteConfirm === entry.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(entry.id, entry.screenshot_path)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-sm font-medium hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(entry.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-yellow-500 text-white font-semibold'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-2 py-2">...</span>
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Invested</div>
                  <div className="text-4xl font-bold text-yellow-700">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Entries</div>
                    <div className="text-2xl font-bold text-gray-800">{entries.length}</div>
                  </div>
                  <div className="w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-gray-600">Gold</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {entries.filter(e => e.currency === 'Gold').length}
                    </div>
                  </div>
                  <div className="w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-gray-600">Silver</div>
                    <div className="text-2xl font-bold text-gray-500">
                      {entries.filter(e => e.currency === 'Silver').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
