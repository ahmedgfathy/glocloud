'use client'

// Global error handler for chunk loading errors
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections (often chunk loading errors)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    
    // Check if it's a chunk loading error
    if (error && (
      error.message?.includes('Loading chunk') ||
      error.message?.includes('ChunkLoadError') ||
      error.name === 'ChunkLoadError' ||
      error.toString().includes('Loading CSS chunk')
    )) {
      console.warn('Chunk loading error detected, preventing error and reloading...', error)
      event.preventDefault() // Prevent the error from being logged
      
      // Show a brief loading message and reload
      const loadingDiv = document.createElement('div')
      loadingDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="text-align: center;">
            <div style="
              width: 40px;
              height: 40px;
              border: 3px solid #e5e7eb;
              border-top: 3px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
            "></div>
            <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 18px; font-weight: 600;">Updating...</h2>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Loading latest version</p>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `
      document.body.appendChild(loadingDiv)
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 800)
    }
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = event.error
    
    // Check if it's a chunk loading error
    if (error && (
      error.message?.includes('Loading chunk') ||
      error.message?.includes('ChunkLoadError') ||
      error.name === 'ChunkLoadError'
    )) {
      console.warn('Script error: chunk loading issue detected', error)
      event.preventDefault()
      
      // Reload the page
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  })
}

export {}
