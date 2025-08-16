import { CvDraft } from '@/types/cv';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  success: boolean;
  uploadId: string;
  message: string;
}

export interface ProcessingResponse {
  success: boolean;
  uploadId: string;
  cvData: CvDraft;
  message: string;
}

export interface UploadStatus {
  uploadId: string;
  status: 'queued' | 'parsing' | 'ai_parsing' | 'done' | 'failed';
  progress: number;
  message?: string;
  error?: string;
}

export interface UploadInfo {
  uploadId: string;
  originalName: string;
  status: string;
  progress: number;
  createdAt: string;
}

export interface UploadsListResponse {
  uploads: UploadInfo[];
  total: number;
}

class ApiService {
  private baseUrl: string = 'http://localhost:5000/api/v1';
  private isConnected: boolean = false;

  constructor() {
    this.testConnection();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`);
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  async getApiStatus(): Promise<{ isConnected: boolean; message: string }> {
    const connected = await this.testConnection();
    return {
      isConnected: connected,
      message: connected ? "Connected to backend API" : "Backend API not available"
    };
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async processCV(uploadId: string): Promise<ProcessingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/process/${uploadId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CV processing failed:', error);
      throw error;
    }
  }

  async getUploadStatus(uploadId: string): Promise<UploadStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/upload/${uploadId}/status`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check failed:', error);
      throw error;
    }
  }

  async getUploads(): Promise<UploadsListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/uploads`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch uploads: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
      throw error;
    }
  }

  async getProcessedCV(uploadId: string): Promise<CvDraft> {
    try {
      const response = await fetch(`${this.baseUrl}/cv/${uploadId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CV: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Failed to fetch CV:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const apiService = new ApiService();
export default apiService;
