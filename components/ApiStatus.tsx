import React, { useEffect, useState } from 'react'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import apiService from '@/utils/apiService'

interface ApiStatusProps {
  className?: string
}

const ApiStatus: React.FC<ApiStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<{
    connected: boolean
    baseUrl: string
    timestamp: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkApiStatus()
    
    // Check status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const checkApiStatus = async () => {
    try {
      setLoading(true)
      const apiStatus = await apiService.getApiStatus()
      setStatus(apiStatus)
    } catch (error) {
      console.error('Failed to check API status:', error)
      setStatus({
        connected: false,
        baseUrl: apiService['baseUrl'] || 'Unknown',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span>Checking API status...</span>
      </div>
    )
  }

  if (!status) {
    return null
  }

  const getStatusIcon = () => {
    if (status.connected) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />
    }
    return <XCircleIcon className="h-4 w-4 text-red-500" />
  }

  const getStatusText = () => {
    if (status.connected) {
      return 'Backend Connected'
    }
    return 'Backend Disconnected'
  }

  const getStatusColor = () => {
    if (status.connected) {
      return 'text-green-600'
    }
    return 'text-red-600'
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {getStatusIcon()}
      <span className={getStatusColor()}>{getStatusText()}</span>
      
      {!status.connected && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <ExclamationTriangleIcon className="h-3 w-3" />
          <span>Check if server is running on {status.baseUrl}</span>
        </div>
      )}
    </div>
  )
}

export default ApiStatus




