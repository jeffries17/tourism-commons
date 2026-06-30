'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UnlockPageProps {
  params: { country: string }
}

export default function UnlockPage({ params }: UnlockPageProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: params.country,
          password,
        }),
      })

      if (!response.ok) {
        throw new Error('Invalid password')
      }

      // Redirect back to project page
      router.push(`/projects/${params.country}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 sm:px-8">
      <div className="rounded-lg border border-neutral-200 bg-white p-8">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Access Required</h1>
        <p className="mb-6 text-neutral-600">
          This project content is password-protected. Enter the password provided by Tourism Commons.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full rounded-lg bg-accent-600 py-2 font-semibold text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
          >
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
