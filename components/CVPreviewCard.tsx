'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { CVData } from '@/types/cv'
import toast from 'react-hot-toast'

interface CVPreviewCardProps {
  cvData: CVData
  originalContent: string
  onDownload: (format: 'pdf' | 'docx') => void
}

const CVPreviewCard: React.FC<CVPreviewCardProps> = ({ cvData, originalContent, onDownload }) => {
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted')
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setIsDownloading(true)
    try {
      await onDownload(format)
      toast.success(`${format.toUpperCase()} downloaded successfully!`)
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const formatFileName = () => {
    const { firstName, lastName } = cvData.personalDetails
    const timestamp = new Date().toISOString().split('T')[0]
    return `${firstName}_${lastName}_CV_${timestamp}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">CV Transformation Result</h3>
              <p className="text-primary-100 text-sm">AI-enhanced professional format</p>
            </div>
          </div>
          
          {/* Download Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleDownload('docx')}
              disabled={isDownloading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>DOCX</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('formatted')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'formatted'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Formatted CV</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'raw'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Original Content</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'formatted' ? (
          <motion.div
            key="formatted"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* CV Header */}
            <div className="text-center border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between max-w-4xl mx-auto">
                {/* Personal Details - Left Side */}
                <div className="flex-1 text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 font-palatino">
                    {cvData.personalDetails.firstName} {cvData.personalDetails.lastName}
                  </h1>
                  <h2 className="text-xl text-primary-600 font-semibold mb-4 font-palatino">
                    {cvData.personalDetails.jobTitle}
                  </h2>
                  
                  {/* Personal Details Grid */}
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <p><span className="font-semibold">Nationality:</span> {cvData.personalDetails.nationality}</p>
                    <p><span className="font-semibold">Languages:</span> {cvData.personalDetails.languages.join(', ')}</p>
                    <p><span className="font-semibold">Date of Birth:</span> {cvData.personalDetails.dateOfBirth}</p>
                    <p><span className="font-semibold">Marital Status:</span> {cvData.personalDetails.maritalStatus}</p>
                    <p><span className="font-semibold">Email:</span> {cvData.personalDetails.email}</p>
                    <p><span className="font-semibold">Phone:</span> {cvData.personalDetails.phone}</p>
                    <p><span className="font-semibold">Address:</span> {cvData.personalDetails.address}</p>
                  </div>
                </div>

                {/* Professional Photo - Right Side */}
                <div className="ml-8 flex-shrink-0">
                  <div className="w-32 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                    {cvData.personalDetails.photo ? (
                      <img
                        src={cvData.personalDetails.photo}
                        alt={`${cvData.personalDetails.firstName} ${cvData.personalDetails.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-xs">Photo</p>
                        <p className="text-xs">4.7cm</p>
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500 font-medium">Professional Photo</p>
                    <p className="text-xs text-gray-400">4.7cm × 6.0cm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="cv-section">
              <h3 className="cv-section-title">Professional Profile</h3>
              <p className="text-gray-700 leading-relaxed text-balance font-palatino">
                {cvData.profile}
              </p>
            </div>

            {/* Experience */}
            <div className="cv-section">
              <h3 className="cv-section-title">Professional Experience</h3>
              <div className="space-y-6">
                {cvData.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-primary-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 font-palatino">{exp.position}</h4>
                      <span className="text-sm text-gray-500 font-medium">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <h5 className="text-primary-600 font-medium mb-3 font-palatino">{exp.company}</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <h6 className="font-semibold text-gray-800 mb-2">Key Responsibilities:</h6>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {exp.description.map((desc, i) => (
                            <li key={i} className="text-sm font-palatino">{desc}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {exp.achievements.length > 0 && (
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Key Achievements:</h6>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="text-sm font-palatino">{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="cv-section">
              <h3 className="cv-section-title">Education</h3>
              <div className="space-y-4">
                {cvData.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-green-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 font-palatino">{edu.degree}</h4>
                        <h5 className="text-primary-600 font-medium font-palatino">{edu.institution}</h5>
                        <p className="text-gray-600 font-palatino">{edu.field}</p>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>
                    {edu.grade && (
                      <p className="text-sm text-gray-600 font-medium">Grade: {edu.grade}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Skills */}
            <div className="cv-section">
              <h3 className="cv-section-title">Key Skills</h3>
              <div className="flex flex-wrap gap-2">
                {cvData.keySkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium font-palatino"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="cv-section">
              <h3 className="cv-section-title">Interests</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {cvData.interests.map((interest, index) => (
                  <li key={index} className="text-sm font-palatino">{interest}</li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
              <p>Transformed using AI CV Transformer • {new Date().toLocaleDateString()}</p>
              <p className="mt-1">Following EHS Professional Formatting Standards</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="raw"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <DocumentTextIcon className="h-5 w-5 text-gray-500" />
              <h4 className="text-lg font-semibold text-gray-900">Original Content</h4>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {originalContent}
              </pre>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>This is the raw content extracted from your uploaded file</p>
              <p className="mt-1">Use the "Formatted CV" tab to see the AI-enhanced version</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Download Info */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p><strong>File:</strong> {formatFileName()}</p>
            <p><strong>Processed:</strong> {new Date(cvData.metadata.processedAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span>Ready for download</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CVPreviewCard
