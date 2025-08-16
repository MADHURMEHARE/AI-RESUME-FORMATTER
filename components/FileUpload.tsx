'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { 
  DocumentArrowUpIcon, 
  DocumentTextIcon, 
  DocumentIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { CVData, FileUploadProps } from '@/types/cv'
import toast from 'react-hot-toast'
import apiService from '@/utils/apiService'

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, onProcessingStart }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const processFile = async (file: File): Promise<{ data: CVData; original: string }> => {
    setIsProcessing(true)
    onProcessingStart()

    try {
      // Test API connection first
      const isConnected = await apiService.testConnection()
      if (!isConnected) {
        throw new Error('Cannot connect to the backend server. Please ensure the server is running.')
      }

      // Process the CV file using the backend API
      const result = await apiService.processCV(file)
      
      return { 
        data: result.cvData, 
        original: result.originalContent 
      }
    } catch (error) {
      console.error('Error processing file:', error)
      
      if (error instanceof Error) {
        throw new Error(`Failed to process file: ${error.message}`)
      }
      
      throw new Error('Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOCX, or Excel file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    try {
      toast.success('Processing your CV...')
      const result = await processFile(file)
      onFileProcessed(result.data, result.original)
      toast.success('CV processed successfully!')
    } catch (error) {
      toast.error('Failed to process CV. Please try again.')
      console.error('Processing error:', error)
    }
  }, [onFileProcessed])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    disabled: isProcessing
  })

  const getFileIcon = () => {
    if (isProcessing) {
      return <DocumentIcon className="h-12 w-12 text-primary-600 animate-pulse" />
    }
    return <DocumentArrowUpIcon className="h-12 w-12 text-primary-600" />
  }

  const getDragText = () => {
    if (isProcessing) {
      return 'Processing your CV...'
    }
    if (isDragActive) {
      return 'Drop your CV here'
    }
    return 'Drag & drop your CV here, or click to browse'
  }

  const getAcceptedFormats = () => {
    return 'PDF, DOCX, XLS, XLSX (Max 10MB)'
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${isProcessing ? 'cursor-not-allowed opacity-75' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {getFileIcon()}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {getDragText()}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {getAcceptedFormats()}
            </p>
          </div>

          {!isProcessing && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Supports multiple formats</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 text-sm text-primary-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span>AI is analyzing your CV...</span>
            </div>
          )}
        </motion.div>

        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-primary-500 bg-opacity-10 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <DocumentArrowUpIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-primary-700">Drop to upload</p>
            </div>
          </div>
        )}
      </div>

      {/* Processing tips */}
      {!isProcessing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Processing Tips:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Ensure your CV is clearly formatted and readable</li>
                <li>• Include all relevant experience and education details</li>
                <li>• Our AI will automatically apply professional formatting standards</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
