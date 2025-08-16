// Common API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Common error codes
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // File Operations
  FILE_MISSING = 'FILE_MISSING',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  
  // Upload Operations
  UPLOAD_NOT_FOUND = 'UPLOAD_NOT_FOUND',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  MISSING_UPLOAD_ID = 'MISSING_UPLOAD_ID',
  
  // Processing Operations
  PROCESSING_INCOMPLETE = 'PROCESSING_INCOMPLETE',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  CANCELLATION_NOT_ALLOWED = 'CANCELLATION_NOT_ALLOWED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // AI Processing
  AI_PROCESSING_FAILED = 'AI_PROCESSING_FAILED',
  AI_PROVIDER_UNAVAILABLE = 'AI_PROVIDER_UNAVAILABLE',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED'
}

// HTTP status codes mapping
export const HTTP_STATUS_CODES: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.ACCESS_DENIED]: 403,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.FILE_MISSING]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.UNSUPPORTED_FILE_TYPE]: 400,
  [ErrorCode.FILE_NOT_FOUND]: 404,
  [ErrorCode.UPLOAD_NOT_FOUND]: 404,
  [ErrorCode.UPLOAD_FAILED]: 500,
  [ErrorCode.MISSING_UPLOAD_ID]: 400,
  [ErrorCode.PROCESSING_INCOMPLETE]: 400,
  [ErrorCode.PROCESSING_FAILED]: 500,
  [ErrorCode.CANCELLATION_NOT_ALLOWED]: 400,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.AI_PROCESSING_FAILED]: 500,
  [ErrorCode.AI_PROVIDER_UNAVAILABLE]: 503,
  [ErrorCode.AI_QUOTA_EXCEEDED]: 429
};

// Helper function to create error response
export function createErrorResponse(
  errorCode: ErrorCode,
  message?: string,
  details?: any
): ApiResponse<null> {
  return {
    success: false,
    message: message || getDefaultErrorMessage(errorCode),
    error: errorCode,
    timestamp: new Date().toISOString()
  };
}

// Helper function to create success response
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Operation completed successfully'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

// Default error messages
function getDefaultErrorMessage(errorCode: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHORIZED]: 'Authentication required',
    [ErrorCode.ACCESS_DENIED]: 'Access denied to this resource',
    [ErrorCode.INVALID_TOKEN]: 'Invalid or expired authentication token',
    [ErrorCode.FILE_MISSING]: 'No file provided in request',
    [ErrorCode.FILE_TOO_LARGE]: 'File size exceeds maximum allowed limit',
    [ErrorCode.UNSUPPORTED_FILE_TYPE]: 'File type not supported',
    [ErrorCode.FILE_NOT_FOUND]: 'Requested file not found',
    [ErrorCode.UPLOAD_NOT_FOUND]: 'Upload record not found',
    [ErrorCode.UPLOAD_FAILED]: 'Failed to process file upload',
    [ErrorCode.MISSING_UPLOAD_ID]: 'Upload ID is required',
    [ErrorCode.PROCESSING_INCOMPLETE]: 'Processing not yet complete',
    [ErrorCode.PROCESSING_FAILED]: 'Failed to process CV file',
    [ErrorCode.CANCELLATION_NOT_ALLOWED]: 'Cannot cancel processing in current state',
    [ErrorCode.VALIDATION_ERROR]: 'Request validation failed',
    [ErrorCode.MISSING_REQUIRED_FIELD]: 'Required field is missing',
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error occurred',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
    [ErrorCode.DATABASE_ERROR]: 'Database operation failed',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded, please try again later',
    [ErrorCode.AI_PROCESSING_FAILED]: 'AI processing failed',
    [ErrorCode.AI_PROVIDER_UNAVAILABLE]: 'AI service temporarily unavailable',
    [ErrorCode.AI_QUOTA_EXCEEDED]: 'AI processing quota exceeded'
  };
  
  return messages[errorCode] || 'An unexpected error occurred';
}

// Request interfaces
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface FileUploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

// Response interfaces
export interface UploadResponse {
  uploadId: string;
  fileName: string;
  fileSize: number;
  status: string;
}

export interface ProcessingResponse {
  uploadId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  processingTime?: number;
}

export interface StatusResponse {
  id: string;
  status: string;
  progress: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
}




