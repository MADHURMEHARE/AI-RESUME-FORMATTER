import { CVData } from '@/types/cv'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// API endpoints
const API_ENDPOINTS = {
  CV_UPLOAD: '/api/v1/upload',
  CV_PROCESS: '/api/v1/process',
  CV_STATUS: '/api/v1/upload',
  CV_GET: '/api/v1/cv',
  HEALTH: '/health',
} as const



interface CVProcessingResponse {
  cvData: CVData
  originalContent: string
  processingTime: number
  fileName: string
}



// Error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API service class
class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Helper method to make HTTP requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, defaultOptions)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Failed to connect to the server. Please check your internet connection and try again.',
          0,
          'NETWORK_ERROR'
        )
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        0,
        'UNKNOWN_ERROR'
      )
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
  }

  // Process CV file
  async processCV(file: File): Promise<CVProcessingResponse> {
    // Step 1: Upload the file
    const formData = new FormData()
    formData.append('file', file) // Changed from 'cvFile' to 'file' to match backend

    const uploadResponse = await this.request<{
      success: boolean
      uploadId: string
      message: string
      filename: string
    }>(
      API_ENDPOINTS.CV_UPLOAD,
      {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      }
    )

    const { uploadId } = uploadResponse

    // Step 2: Process the uploaded file
    const processResponse = await this.request<{
      success: boolean
      uploadId: string
      cvData: CVData
      message: string
    }>(
      `${API_ENDPOINTS.CV_PROCESS}/${uploadId}`,
      {
        method: 'POST',
      }
    )

    // Return the processed CV data
    return {
      cvData: processResponse.cvData,
      originalContent: '', // Backend doesn't provide this, so we'll leave it empty
      processingTime: 0, // Backend doesn't provide this
      fileName: uploadResponse.filename
    }
  }

  // Get CV status
  async getCVStatus(uploadId: string): Promise<{
    uploadId: string
    status: string
    progress: number
    message: string
    error?: string
  }> {
    const response = await this.request<{
      uploadId: string
      status: string
      progress: number
      message: string
      error?: string
    }>(
      `${API_ENDPOINTS.CV_STATUS}/${uploadId}/status`,
      {
        method: 'GET',
      }
    )

    return response
  }

  // Get processed CV
  async getProcessedCV(uploadId: string): Promise<{
    data: CVData
  }> {
    const response = await this.request<{
      success: boolean
      data: CVData
    }>(
      `${API_ENDPOINTS.CV_GET}/${uploadId}`,
      {
        method: 'GET',
      }
    )

    return response
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck()
      return true
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }

  // Get API status
  async getApiStatus(): Promise<{
    connected: boolean
    baseUrl: string
    timestamp: string
  }> {
    const connected = await this.testConnection()
    return {
      connected,
      baseUrl: this.baseUrl,
      timestamp: new Date().toISOString(),
    }
  }
}

// Create and export default instance
const apiService = new ApiService()

// Export both the instance and the class
export default apiService
export { ApiService, ApiError }

// Export types for external use
export type {
  CVProcessingResponse,
}




