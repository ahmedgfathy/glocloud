'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, FolderIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  parentId?: string | null
  onUploadSuccess?: () => void
}

interface FileWithPath extends File {
  webkitRelativePath: string
}

// Extend HTMLInputElement to support webkitdirectory
declare global {
  namespace React {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
      webkitdirectory?: string
    }
  }
}

export default function FileUpload({ parentId, onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadMode, setUploadMode] = useState<'files' | 'folder'>('files')

  const uploadFiles = async (files: FileWithPath[]) => {
    setUploading(true)
    
    // Group files by their folder structure
    const folderStructure = new Map<string, FileWithPath[]>()
    const rootFiles: FileWithPath[] = []
    
    files.forEach(file => {
      if (file.webkitRelativePath) {
        const pathParts = file.webkitRelativePath.split('/')
        if (pathParts.length > 1) {
          const folderPath = pathParts.slice(0, -1).join('/')
          if (!folderStructure.has(folderPath)) {
            folderStructure.set(folderPath, [])
          }
          folderStructure.get(folderPath)!.push(file)
        } else {
          rootFiles.push(file)
        }
      } else {
        rootFiles.push(file)
      }
    })

    try {
      // Upload folder structure if exists
      if (folderStructure.size > 0) {
        const formData = new FormData()
        
        // Add all files with their paths
        files.forEach((file, index) => {
          formData.append(`files`, file)
          if (file.webkitRelativePath) {
            formData.append(`paths`, file.webkitRelativePath)
          }
        })
        
        if (parentId) {
          formData.append('parentId', parentId)
        }

        setUploadProgress(prev => ({ ...prev, 'Folder Structure': 0 }))

        const response = await fetch('/api/files/upload-folder', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          setUploadProgress(prev => ({ ...prev, 'Folder Structure': 100 }))
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev }
              delete newProgress['Folder Structure']
              return newProgress
            })
          }, 2000)
        }
      } else {
        // Upload individual files
        for (const file of rootFiles) {
          const formData = new FormData()
          formData.append('file', file)
          if (parentId) {
            formData.append('parentId', parentId)
          }

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
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
    
    setUploading(false)
    onUploadSuccess?.()
  }

  const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
    await uploadFiles(acceptedFiles)
  }, [parentId, onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024 // 100MB per file
  })

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as FileWithPath[]
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Mode Selector */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setUploadMode('files')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === 'files' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upload Files
        </button>
        <button
          onClick={() => setUploadMode('folder')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === 'folder' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upload Folder
        </button>
      </div>

      {uploadMode === 'files' ? (
        /* File Upload Area */
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
                Maximum file size: 100MB per file
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Folder Upload Area */
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div>
            <p className="text-gray-600 mb-2">
              Select a folder to upload with all its contents
            </p>
            <input
              type="file"
              webkitdirectory=""
              multiple
              onChange={handleFolderUpload}
              className="hidden"
              id="folder-upload"
            />
            <label
              htmlFor="folder-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Choose Folder
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Folder structure will be preserved
            </p>
          </div>
        </div>
      )}

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
