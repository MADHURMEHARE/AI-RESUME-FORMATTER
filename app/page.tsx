'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentArrowUpIcon, 
  DocumentTextIcon, 
  EyeIcon, 
  PencilIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import FileUpload from '@/components/FileUpload'
import CVPreviewCard from '@/components/CVPreviewCard'
import CVEditor from '@/components/CVEditor'
import ProcessingStatus from '@/components/ProcessingStatus'
import { CVData, ProcessingState } from '@/types/cv'
import { downloadPDF, downloadDOCX } from '@/utils/downloadService'
import toast from 'react-hot-toast'
import HomeButton from '@/components/HomeButton'
import ApiStatus from '@/components/ApiStatus'

export default function Home() {
  const [cvData, setCvData] = useState<CVData | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [showEditor, setShowEditor] = useState(false)
  const [originalContent, setOriginalContent] = useState<string>('')

  const handleFileProcessed = (data: CVData, original: string) => {
    setCvData(data)
    setOriginalContent(original)
    setProcessingState('completed')
  }

  const handleProcessingStart = () => {
    setProcessingState('processing')
  }

  const handleEditToggle = () => {
    setShowEditor(!showEditor)
  }

  const handleCVUpdate = (updatedData: CVData) => {
    setCvData(updatedData)
  }

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!cvData) return

    try {
      if (format === 'pdf') {
        await downloadPDF(cvData)
      } else {
        await downloadDOCX(cvData)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Failed to download ${format.toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-2 rounded-lg">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI CV Transformer</h1>
                <p className="text-sm text-gray-600">Professional CV Enhancement with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ApiStatus className="mr-4" />
              <HomeButton variant="secondary" />
              <button
                onClick={handleEditToggle}
                disabled={!cvData}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PencilIcon className="h-4 w-4" />
                <span>{showEditor ? 'Preview' : 'Edit'}</span>
              </button>
              {cvData && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownload('docx')}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>DOCX</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {processingState === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* File Upload Section */}
            <div className="text-center">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  <div className="bg-gradient-to-r from-primary-100 to-indigo-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <DocumentArrowUpIcon className="h-10 w-10 text-primary-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Transform Your CV with AI
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Upload your CV in PDF, DOCX, or Excel format and let our AI transform it into a 
                    polished, professional document following EHS formatting standards.
                  </p>
                  <FileUpload
                    onFileProcessed={handleFileProcessed}
                    onProcessingStart={handleProcessingStart}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {processingState === 'processing' && (
          <ProcessingStatus />
        )}

        {processingState === 'completed' && cvData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {showEditor ? (
              <CVEditor
                cvData={cvData}
                onUpdate={handleCVUpdate}
                onBack={() => setShowEditor(false)}
              />
            ) : (
              <div className="space-y-8">
                {/* Main CV Preview Card */}
                <CVPreviewCard
                  cvData={cvData}
                  originalContent={originalContent}
                  onDownload={handleDownload}
                />

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                      <p className="text-sm text-gray-600">Edit your CV or download in different formats</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleEditToggle}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit CV</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload('pdf')}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleDownload('docx')}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          <span>DOCX</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transformation Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Transformation Complete!</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
                        <div>
                          <p className="font-medium">File Processed:</p>
                          <p>{cvData.metadata.originalFileName}</p>
                        </div>
                        <div>
                          <p className="font-medium">Processing Date:</p>
                          <p>{new Date(cvData.metadata.processedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">AI Version:</p>
                          <p>{cvData.metadata.version}</p>
                        </div>
                      </div>
                      <p className="text-green-700 mt-3">
                        Your CV has been successfully transformed using AI and now follows EHS professional formatting standards. 
                        You can edit, preview, and download your enhanced CV in multiple formats.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 AI CV Transformer. Built with Next.js and AI technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
