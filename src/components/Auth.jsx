import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth({ onAuthenticated }) {
  const [loading, setLoading] = useState(false)
  const [securityCode, setSecurityCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Fetch the security code from database
      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'security_code')
        .single()

      if (fetchError) {
        throw new Error('Failed to verify security code. Please check your database setup.')
      }

      // Verify the entered code matches
      if (securityCode === data.setting_value) {
        // Store authentication in localStorage
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('authTime', Date.now().toString())
        onAuthenticated()
      } else {
        setError('Invalid security code. Please try again.')
        setSecurityCode('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Digital Gold Tracker
          </h1>
          <p className="text-gray-600">Saving Proof</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="security-code" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Security Code
            </label>
            <input
              id="security-code"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="••••"
              value={securityCode}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/[^0-9]/g, '')
                setSecurityCode(value)
              }}
              required
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> The default security code is <code className="bg-blue-100 px-2 py-1 rounded">1234</code>. 
            Change it in your Supabase database for security.
          </p>
        </div>

        <p className="mt-6 text-xs text-center text-gray-500">
          Personal use only • Secured with Supabase
        </p>
      </div>
    </div>
  )
}
