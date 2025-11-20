import { useState } from 'react'
import { supabase, STORAGE_BUCKET } from '../lib/supabaseClient'

export default function EntryForm({ onEntryAdded }) {
  const [amount, setAmount] = useState('')
  const [grams, setGrams] = useState('')
  const [currency, setCurrency] = useState('Gold')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        e.target.value = ''
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        e.target.value = ''
        return
      }
      setScreenshot(file)
      setError('')
    }
  }

  const uploadScreenshot = async (file) => {
    // Generate unique filename with timestamp
    const fileExt = file.name.split('.').pop()
    const fileName = `screenshots/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error
    return data.path
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate amount
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Amount must be a positive number')
      }

      // Validate grams (optional)
      let gramsNum = null
      if (grams) {
        gramsNum = parseFloat(grams)
        if (isNaN(gramsNum) || gramsNum <= 0) {
          throw new Error('Grams must be a positive number')
        }
      }

      let screenshotPath = null

      // Upload screenshot if provided
      if (screenshot) {
        screenshotPath = await uploadScreenshot(screenshot)
      }

      // Insert investment record
      const { data: insertData, error: insertError } = await supabase
        .from('investments')
        .insert([
          {
            amount: amountNum,
            grams: gramsNum,
            currency,
            screenshot_path: screenshotPath,
            receipt_url: receiptUrl || null,
            notes: notes || null,
          },
        ])
        .select()

      if (insertError) {
        console.error('Insert error details:', insertError)
        throw new Error(`Failed to save investment: ${insertError.message}`)
      }

      // Reset form
      setAmount('')
      setGrams('')
      setCurrency('Gold')
      setReceiptUrl('')
      setNotes('')
      setScreenshot(null)
      document.getElementById('screenshot-input').value = ''
      
      setSuccess('Investment entry added successfully!')
      
      // Notify parent to refresh list
      if (onEntryAdded) onEntryAdded()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="1000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency *
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
            >
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
            </select>
          </div>
        </div>

        {/* Grams/Weight */}
        <div>
          <label htmlFor="grams" className="block text-sm font-medium text-gray-700 mb-1">
            Weight in Grams {currency === 'Gold' ? '(or Pavan)' : ''} (optional)
          </label>
          <input
            id="grams"
            type="number"
            step="0.0001"
            min="0.0001"
            placeholder={currency === 'Gold' ? '1.5 grams or 0.1875 pavan' : '10.5 grams'}
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {currency === 'Gold' ? 'Enter weight in grams or pavan (1 pavan = 8 grams)' : 'Enter weight in grams'}
          </p>
        </div>

        {/* Screenshot Upload */}
        <div>
          <label htmlFor="screenshot-input" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Screenshot
          </label>
          <input
            id="screenshot-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
          />
          <p className="mt-1 text-xs text-gray-500">Max 5MB, image files only</p>
        </div>

        {/* Receipt URL */}
        <div>
          <label htmlFor="receipt-url" className="block text-sm font-medium text-gray-700 mb-1">
            Receipt URL (optional)
          </label>
          <input
            id="receipt-url"
            type="url"
            placeholder="https://example.com/receipt"
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows="3"
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Investment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
