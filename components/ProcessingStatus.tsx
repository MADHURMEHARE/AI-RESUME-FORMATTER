'use client'

import { motion } from 'framer-motion'
import { 
  DocumentMagnifyingGlassIcon, 
  CpuChipIcon, 
  DocumentTextIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import HomeButton from './HomeButton'

const ProcessingStatus: React.FC = () => {
  const processingSteps = [
    {
      id: 1,
      title: 'Analyzing Document',
      description: 'Extracting text and structure from your CV',
      icon: DocumentTextIcon,
      status: 'completed'
    },
    {
      id: 2,
      title: 'AI Processing',
      description: 'Applying intelligent formatting and enhancement',
      icon: CpuChipIcon,
      status: 'active'
    },
    {
      id: 3,
      title: 'Formatting',
      description: 'Applying EHS professional standards',
      icon: DocumentMagnifyingGlassIcon,
      status: 'pending'
    },
    {
      id: 4,
      title: 'Finalizing',
      description: 'Preparing your transformed CV',
      icon: CheckCircleIcon,
      status: 'pending'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="bg-gradient-to-r from-primary-100 to-indigo-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <CpuChipIcon className="h-12 w-12 text-primary-600 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI is Transforming Your CV
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Our advanced AI is analyzing your document and applying professional formatting standards. 
          This usually takes a few moments.
        </p>
      </motion.div>

      <div className="space-y-6">
        {processingSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="relative"
          >
            <div className="flex items-start space-x-4">
              {/* Step number and icon */}
              <div className="flex-shrink-0">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2
                  ${step.status === 'completed' 
                    ? 'bg-green-100 border-green-500 text-green-600' 
                    : step.status === 'active'
                    ? 'bg-primary-100 border-primary-500 text-primary-600 animate-pulse'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  {step.status === 'completed' ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`
                    text-lg font-semibold
                    ${step.status === 'completed' 
                      ? 'text-green-700' 
                      : step.status === 'active'
                      ? 'text-primary-700'
                      : 'text-gray-500'
                    }
                  `}>
                    {step.title}
                  </h3>
                  {step.status === 'active' && (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
                <p className={`
                  text-base
                  ${step.status === 'completed' 
                    ? 'text-green-600' 
                    : step.status === 'active'
                    ? 'text-primary-600'
                    : 'text-gray-500'
                  }
                `}>
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connecting line */}
            {index < processingSteps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200 transform -translate-x-px"></div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-12"
      >
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '60%' }}
            transition={{ duration: 2, delay: 1 }}
          />
        </div>
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Processing in progress...</span>
        </div>
      </motion.div>

      {/* AI insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
      >
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">AI Enhancement in Progress</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Applying Palatino Linotype font throughout</p>
              <p>• Converting dates to abbreviated format (Jan 2020)</p>
              <p>• Capitalizing job titles and professional terms</p>
              <p>• Removing redundant phrases and improving language</p>
              <p>• Structuring content with proper bullet points</p>
            </div>
          </div>
        </div>
              </motion.div>
        
        {/* Floating Home Button */}
        <HomeButton variant="floating" showText={false} />
      </div>
    )
  }
  
  export default ProcessingStatus
