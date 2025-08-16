import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { parseFile } from '../services/parseFile';
import { formatCvWithLangChain } from '../ai/aiProcessor';
import { CvDraftSchema, CvDraft } from '../../shared/schemas/cv.schema';
import { 
  ApiResponse, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  AuthenticatedRequest 
} from '../types/api';

// Types
interface ProcessRequest extends AuthenticatedRequest<{ uploadId: string }> {}

interface ProcessResponse {
  uploadId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  cvDraft?: CvDraft;
  originalContent?: string;
  processingTime?: number;
  error?: string;
}

// Mock database - replace with your actual database implementation
const uploads = new Map<string, any>();

const router = Router();

// POST /v1/process/:uploadId - Trigger immediate processing (for dev)
router.post('/:uploadId', async (req: ProcessRequest, res: Response<ApiResponse<ProcessResponse>>) => {
  const startTime = Date.now();
  
  try {
    const { uploadId } = req.params;

    if (!uploadId) {
      return res.status(400).json(createErrorResponse(ErrorCode.MISSING_UPLOAD_ID));
    }

    if (!req.userId) {
      return res.status(401).json(createErrorResponse(ErrorCode.UNAUTHORIZED));
    }

    // Get upload record from database
    const uploadRecord = uploads.get(uploadId);
    if (!uploadRecord) {
      return res.status(404).json(createErrorResponse(ErrorCode.UPLOAD_NOT_FOUND));
    }

    // Check if user owns this upload
    if (uploadRecord.userId !== req.userId) {
      return res.status(403).json(createErrorResponse(ErrorCode.ACCESS_DENIED));
    }

    // Update status to processing
    uploadRecord.status = 'processing';
    uploadRecord.progress = 10;
    uploadRecord.message = 'Starting file processing...';
    uploadRecord.updatedAt = new Date().toISOString();

    console.log(`🔄 Starting immediate processing for upload: ${uploadId}`);

    // Step 1: Parse file
    uploadRecord.progress = 30;
    uploadRecord.message = 'Parsing file content...';
    
    const parseResult = await parseFile(uploadRecord.filePath, uploadRecord.mimeType || 'application/pdf');
    
    uploadRecord.progress = 60;
    uploadRecord.message = 'File parsed successfully, processing with AI...';

    // Step 2: Process with AI
    const cvDraft = await formatCvWithLangChain(parseResult.rawText);
    
    uploadRecord.progress = 90;
    uploadRecord.message = 'AI processing completed, validating results...';

    // Step 3: Validate with schema
    const validatedCvDraft = CvDraftSchema.parse(cvDraft);
    
    uploadRecord.progress = 100;
    uploadRecord.status = 'completed';
    uploadRecord.message = 'Processing completed successfully';
    uploadRecord.updatedAt = new Date().toISOString();

    const processingTime = Date.now() - startTime;

    console.log(`✅ Processing completed for upload: ${uploadId} in ${processingTime}ms`);

    // Prepare response
    const response: ProcessResponse = {
      uploadId,
      status: 'completed',
      progress: 100,
      message: 'CV processed successfully',
      cvDraft: validatedCvDraft,
      originalContent: parseResult.rawText,
      processingTime
    };

    res.json(createSuccessResponse(response, 'CV processed successfully'));

  } catch (error) {
    console.error('Processing error:', error);
    
    // Update upload status to failed
    const { uploadId } = req.params;
    if (uploadId && uploads.has(uploadId)) {
      const uploadRecord = uploads.get(uploadId);
      uploadRecord.status = 'failed';
      uploadRecord.progress = 0;
      uploadRecord.message = error instanceof Error ? error.message : 'Processing failed';
      uploadRecord.updatedAt = new Date().toISOString();
    }

    const processingTime = Date.now() - startTime;
    
    res.status(500).json(createErrorResponse(ErrorCode.PROCESSING_FAILED, 'Failed to process CV'));
  }
});

// GET /v1/process/:uploadId/result - Get processing result
router.get('/:uploadId/result', async (req: Request<{ uploadId: string }>, res: Response<ApiResponse<ProcessResponse>>) => {
  try {
    const { uploadId } = req.params;

    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: 'Upload ID is required',
        error: 'MISSING_UPLOAD_ID',
        timestamp: new Date().toISOString()
      });
    }

    // Get upload record from database
    const uploadRecord = uploads.get(uploadId);
    if (!uploadRecord) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found',
        error: 'UPLOAD_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Check if processing is complete
    if (uploadRecord.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Processing not yet complete',
        error: 'PROCESSING_INCOMPLETE',
        timestamp: new Date().toISOString()
      });
    }

    // Return the result
    res.json(createSuccessResponse({
      uploadId,
      status: uploadRecord.status,
      progress: uploadRecord.progress,
      message: uploadRecord.message,
      cvDraft: uploadRecord.cvDraft,
      originalContent: uploadRecord.originalContent,
      processingTime: uploadRecord.processingTime
    }, 'Processing result retrieved successfully'));

  } catch (error) {
    console.error('Result retrieval error:', error);
    
    res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to retrieve processing result'));
  }
});

// DELETE /v1/process/:uploadId - Cancel processing (if possible)
router.delete('/:uploadId', async (req: ProcessRequest, res: Response<ApiResponse<{ cancelled: boolean }>>) => {
  try {
    const { uploadId } = req.params;

    if (!uploadId) {
      return res.status(400).json(createErrorResponse(ErrorCode.MISSING_UPLOAD_ID));
    }

    if (!req.userId) {
      return res.status(401).json(createErrorResponse(ErrorCode.UNAUTHORIZED));
    }

    // Get upload record from database
    const uploadRecord = uploads.get(uploadId);
    if (!uploadRecord) {
      return res.status(404).json(createErrorResponse(ErrorCode.UPLOAD_NOT_FOUND));
    }

    // Check if user owns this upload
    if (uploadRecord.userId !== req.userId) {
      return res.status(403).json(createErrorResponse(ErrorCode.ACCESS_DENIED));
    }

    // Check if processing can be cancelled
    if (uploadRecord.status === 'completed' || uploadRecord.status === 'failed') {
      return res.status(400).json(createErrorResponse(ErrorCode.CANCELLATION_NOT_ALLOWED, 'Cannot cancel completed or failed processing'));
    }

    // Cancel processing (update status)
    uploadRecord.status = 'failed';
    uploadRecord.progress = 0;
    uploadRecord.message = 'Processing cancelled by user';
    uploadRecord.updatedAt = new Date().toISOString();

    console.log(`❌ Processing cancelled for upload: ${uploadId}`);

    res.json(createSuccessResponse({ cancelled: true }, 'Processing cancelled successfully'));

  } catch (error) {
    console.error('Cancellation error:', error);
    
    res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to cancel processing'));
  }
});

export default router;
