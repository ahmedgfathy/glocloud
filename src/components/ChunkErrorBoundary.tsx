'use client'

import React from 'react'

interface ChunkErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ChunkErrorBoundaryProps {
  children: React.ReactNode
}

class ChunkErrorBoundary extends React.Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    // Check if it's a chunk loading error
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return { hasError: true, error }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log chunk loading errors
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.warn('Chunk loading error detected, attempting to reload...', error)
      
      // Automatically reload the page after a short delay for chunk errors
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      console.error('Component error:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.name === 'ChunkLoadError' || 
                          this.state.error?.message.includes('Loading chunk')

      if (isChunkError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center p-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
              <p className="text-gray-600 mb-6">
                Updating application resources. This will only take a moment.
              </p>
              <button
                onClick={this.handleReload}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Now
              </button>
            </div>
          </div>
        )
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              An error occurred while loading the application.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ChunkErrorBoundary
