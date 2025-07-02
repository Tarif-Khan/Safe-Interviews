import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  role: UserRole
}

export default function AuthModal({ isOpen, onClose, mode, role }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roleDisplayName = role === UserRole.INTERVIEWER ? 'Interviewer' : 'Candidate'
  const modeDisplayName = mode === 'signin' ? 'Sign In' : 'Sign Up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (mode === 'signin') {
        result = await signIn(email, password)
      } else {
        result = await signUp(email, password, role, fullName)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        // Success - close modal and reset form
        onClose()
        resetForm()
        if (mode === 'signup') {
          alert('Please check your email for a confirmation link!')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {modeDisplayName} as {roleDisplayName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? 'Please wait...' : modeDisplayName}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <p>Don't have an account? Click "Sign Up" from the home page.</p>
          ) : (
            <p>Already have an account? Click "Sign In" from the home page.</p>
          )}
        </div>
      </div>
    </div>
  )
} 