import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { 
  ApiResponse, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  FileUploadRequest 
} from '../types/api';

// Types
interface UploadStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  fileSize: number;
  userId: string;
}

// Multer configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
});

// BullMQ queue for processing jobs
const processingQueue = new Queue('cv-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});

// Mock database - replace with your actual database implementation
const uploads = new Map<string, UploadStatus>();

const router = Router();

// POST /v1/upload - Upload CV file
router.post('/', upload.single('cvFile'), async (req: FileUploadRequest, res: Response<ApiResponse<{ uploadId: string }>>) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse(ErrorCode.FILE_MISSING));
    }

    if (!req.userId) {
      return res.status(401).json(createErrorResponse(ErrorCode.UNAUTHORIZED));
    }

    const uploadId = uuidv4();
    const now = new Date().toISOString();

    // Create upload record
    const uploadRecord: UploadStatus = {
      id: uploadId,
      status: 'queued',
      progress: 0,
      message: 'File uploaded successfully, queued for processing',
      createdAt: now,
      updatedAt: now,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      userId: req.userId
    };

    // Save to database (mock implementation)
    uploads.set(uploadId, uploadRecord);

    // Enqueue processing job
    await processingQueue.add('process-cv', {
      uploadId,
      filePath: req.file.path,
      userId: req.userId,
      fileName: req.file.originalname
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    console.log(`📁 File uploaded: ${req.file.originalname} -> ${uploadId}`);

    res.status(201).json(createSuccessResponse({ uploadId }, 'File uploaded successfully'));

  } catch (error) {
    console.error('Upload error:', error);
    
    res.status(500).json(createErrorResponse(ErrorCode.UPLOAD_FAILED, 'Failed to upload file'));
  }
});

// GET /v1/upload/:id/status - Get upload status
router.get('/:id/status', async (req: Request<{ id: string }>, res: Response<ApiResponse<UploadStatus>>) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(createErrorResponse(ErrorCode.MISSING_UPLOAD_ID));
    }

    // Get from database (mock implementation)
    const uploadRecord = uploads.get(id);

    if (!uploadRecord) {
      return res.status(404).json(createErrorResponse(ErrorCode.UPLOAD_NOT_FOUND));
    }

    res.json(createSuccessResponse(uploadRecord, 'Upload status retrieved successfully'));

  } catch (error) {
    console.error('Status check error:', error);
    
    res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to retrieve upload status'));
  }
});

// GET /v1/upload - List user's uploads (optional)
router.get('/', async (req: UploadRequest, res: Response<ApiResponse<UploadStatus[]>>) => {
  try {
    if (!req.userId) {
      return res.status(401).json(createErrorResponse(ErrorCode.UNAUTHORIZED));
    }

    // Get user's uploads from database (mock implementation)
    const userUploads = Array.from(uploads.values())
      .filter(upload => upload.userId === req.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(createSuccessResponse(userUploads, 'User uploads retrieved successfully'));

  } catch (error) {
    console.error('List uploads error:', error);
    
    res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to retrieve user uploads'));
  }
});

export default router;
