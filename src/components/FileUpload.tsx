'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  parentId?: string | null
  onUploadSuccess?: () => void
}

export default function FileUpload({ parentId, onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    
    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('file', file)
      if (parentId) {
        formData.append('parentId', parentId)
      }

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev }
              delete newProgress[file.name]
              return newProgress
            })
          }, 2000)
        } else {
          console.error('Upload failed for', file.name)
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }
    
    setUploading(false)
    onUploadSuccess?.()
  }, [parentId, onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024 // 100MB
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: 100MB
            </p>
          </div>
        )}
      </div>

      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploading Files</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="truncate">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
