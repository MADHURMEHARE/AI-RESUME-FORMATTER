import { createReadStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { createWorker } from 'tesseract.js';

// Types for the parsing service
export interface ParseResult {
  rawText: string;
  metadata: {
    pages: number;
    hasImages: boolean;
    fileType: string;
    fileSize: number;
    processingTime: number;
    ocrUsed: boolean;
  };
}

export interface ParseOptions {
  enableOCR?: boolean;
  ocrLanguage?: string;
  maxPages?: number;
  extractImages?: boolean;
}

// Supported MIME types
const SUPPORTED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
} as const;

// File extensions mapping
const FILE_EXTENSIONS = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.doc': 'doc',
  '.xls': 'xls',
  '.xlsx': 'xlsx',
} as const;

/**
 * Parse file content based on MIME type and file extension
 * @param filePath - Path to the file to parse
 * @param mime - MIME type of the file
 * @param options - Optional parsing configuration
 * @returns Promise<ParseResult> - Parsed text and metadata
 */
export async function parseFile(
  filePath: string,
  mime: string,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const startTime = Date.now();
  
  try {
    // Validate file exists
    await fs.access(filePath);
    
    // Get file stats
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    
    // Determine file type
    const fileType = getFileType(filePath, mime);
    if (!fileType) {
      throw new Error(`Unsupported file format. MIME: ${mime}, Path: ${filePath}`);
    }
    
    console.log(`[parseFile] Starting to parse ${fileType} file: ${path.basename(filePath)}`);
    
    let rawText = '';
    let pages = 0;
    let hasImages = false;
    let ocrUsed = false;
    
    // Parse based on file type
    switch (fileType) {
      case 'pdf':
        const pdfResult = await parsePDF(filePath, options);
        rawText = pdfResult.text;
        pages = pdfResult.pages;
        hasImages = pdfResult.hasImages;
        ocrUsed = pdfResult.ocrUsed;
        break;
        
      case 'docx':
        const docxResult = await parseDOCX(filePath, options);
        rawText = docxResult.text;
        pages = docxResult.pages;
        hasImages = docxResult.hasImages;
        break;
        
      case 'xls':
      case 'xlsx':
        const excelResult = await parseExcel(filePath, options);
        rawText = excelResult.text;
        pages = excelResult.pages;
        hasImages = false; // Excel files don't have images in the same way
        break;
        
      default:
        throw new Error(`File type ${fileType} is not supported for parsing`);
    }
    
    // Sanitize output
    rawText = sanitizeText(rawText);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`[parseFile] Successfully parsed ${fileType} file in ${processingTime}ms`);
    console.log(`[parseFile] Extracted ${rawText.length} characters, ${pages} pages`);
    
    return {
      rawText,
      metadata: {
        pages,
        hasImages,
        fileType,
        fileSize,
        processingTime,
        ocrUsed,
      },
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[parseFile] Failed to parse file ${filePath} after ${processingTime}ms:`, error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to parse file: ${error.message}`);
    } else {
      throw new Error('Failed to parse file: Unknown error occurred');
    }
  }
}

/**
 * Parse PDF files with fallback to OCR if no text is extracted
 */
async function parsePDF(filePath: string, options: ParseOptions = {}): Promise<{
  text: string;
  pages: number;
  hasImages: boolean;
  ocrUsed: boolean;
}> {
  try {
    console.log(`[parsePDF] Attempting to extract text from PDF: ${path.basename(filePath)}`);
    
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer, {
      max: options.maxPages || 0, // 0 means no limit
    });
    
    let text = pdfData.text || '';
    const pages = pdfData.numpages || 0;
    const hasImages = pdfData.info?.Images || false;
    
    // Check if text extraction was successful
    if (!text || text.trim().length < 50) {
      console.log(`[parsePDF] Text extraction yielded insufficient content (${text.length} chars), attempting OCR fallback`);
      
      if (options.enableOCR !== false) {
        const ocrText = await performOCR(filePath, options.ocrLanguage);
        if (ocrText && ocrText.trim().length > text.trim().length) {
          text = ocrText;
          console.log(`[parsePDF] OCR fallback successful, extracted ${text.length} characters`);
          return { text, pages, hasImages, ocrUsed: true };
        }
      }
      
      console.warn(`[parsePDF] Warning: PDF text extraction yielded minimal content. Consider enabling OCR.`);
    }
    
    return { text, pages, hasImages, ocrUsed: false };
    
  } catch (error) {
    console.error(`[parsePDF] Error parsing PDF: ${error}`);
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse DOCX files using mammoth
 */
async function parseDOCX(filePath: string, options: ParseOptions = {}): Promise<{
  text: string;
  pages: number;
  hasImages: boolean;
}> {
  try {
    console.log(`[parseDOCX] Extracting text from DOCX: ${path.basename(filePath)}`);
    
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value || '';
    
    // Estimate pages (rough calculation: ~500 words per page)
    const wordCount = text.split(/\s+/).length;
    const pages = Math.ceil(wordCount / 500);
    
    // Check for images in the document
    const hasImages = result.messages.some(msg => 
      msg.type === 'warning' && msg.message.includes('image')
    );
    
    console.log(`[parseDOCX] Successfully extracted ${text.length} characters, estimated ${pages} pages`);
    
    return { text, pages, hasImages };
    
  } catch (error) {
    console.error(`[parseDOCX] Error parsing DOCX: ${error}`);
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse Excel files using xlsx
 */
async function parseExcel(filePath: string, options: ParseOptions = {}): Promise<{
  text: string;
  pages: number;
}> {
  try {
    console.log(`[parseExcel] Extracting text from Excel file: ${path.basename(filePath)}`);
    
    const workbook = XLSX.readFile(filePath, { 
      cellText: false,
      cellDates: true,
      cellNF: false,
      cellStyles: false,
    });
    
    let allText = '';
    const sheetNames = workbook.SheetNames;
    
    // Process each sheet
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert sheet data to text
      for (const row of jsonData) {
        if (Array.isArray(row)) {
          const rowText = row
            .map(cell => cell?.toString() || '')
            .filter(cell => cell.trim().length > 0)
            .join(' | ');
          
          if (rowText.trim()) {
            allText += rowText + '\n';
          }
        }
      }
      
      // Add sheet separator
      if (allText.trim()) {
        allText += '\n---\n';
      }
    }
    
    // Estimate pages (rough calculation: ~40 rows per page)
    const totalRows = sheetNames.reduce((acc, sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      return acc + (worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']).e.r + 1 : 0);
    }, 0);
    const pages = Math.ceil(totalRows / 40);
    
    console.log(`[parseExcel] Successfully extracted text from ${sheetNames.length} sheets, ${totalRows} rows, estimated ${pages} pages`);
    
    return { text: allText, pages };
    
  } catch (error) {
    console.error(`[parseExcel] Error parsing Excel file: ${error}`);
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Perform OCR on PDF files using Tesseract.js
 */
async function performOCR(filePath: string, language: string = 'eng'): Promise<string> {
  try {
    console.log(`[performOCR] Starting OCR processing with language: ${language}`);
    
    const worker = await createWorker(language);
    
    // For now, we'll return a placeholder since Tesseract.js requires browser environment
    // In a real implementation, you'd use a different OCR library for Node.js
    console.warn(`[performOCR] OCR not fully implemented for Node.js environment`);
    
    await worker.terminate();
    return '';
    
  } catch (error) {
    console.error(`[performOCR] OCR processing failed: ${error}`);
    return '';
  }
}

/**
 * Determine file type from MIME type and file extension
 */
function getFileType(filePath: string, mime: string): string | null {
  // Try MIME type first
  if (SUPPORTED_MIME_TYPES[mime as keyof typeof SUPPORTED_MIME_TYPES]) {
    return SUPPORTED_MIME_TYPES[mime as keyof typeof SUPPORTED_MIME_TYPES];
  }
  
  // Fallback to file extension
  const ext = path.extname(filePath).toLowerCase();
  if (FILE_EXTENSIONS[ext as keyof typeof FILE_EXTENSIONS]) {
    return FILE_EXTENSIONS[ext as keyof typeof FILE_EXTENSIONS];
  }
  
  return null;
}

/**
 * Sanitize extracted text
 */
function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .trim()
    // Replace multiple whitespace with single space
    .replace(/\s+/g, ' ')
    // Replace multiple newlines with double newline
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove excessive spacing around punctuation
    .replace(/\s*([.,;:!?])\s*/g, '$1 ')
    // Clean up bullet points
    .replace(/\s*•\s*/g, '\n• ')
    // Final trim
    .trim();
}

/**
 * Get file information without parsing content
 */
export async function getFileInfo(filePath: string): Promise<{
  fileType: string | null;
  fileSize: number;
  lastModified: Date;
  supported: boolean;
}> {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const fileType = FILE_EXTENSIONS[ext as keyof typeof FILE_EXTENSIONS] || null;
    
    return {
      fileType,
      fileSize: stats.size,
      lastModified: stats.mtime,
      supported: fileType !== null,
    };
  } catch (error) {
    throw new Error(`Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate if a file can be parsed
 */
export function isFileSupported(mime: string, filePath?: string): boolean {
  // Check MIME type
  if (SUPPORTED_MIME_TYPES[mime as keyof typeof SUPPORTED_MIME_TYPES]) {
    return true;
  }
  
  // Check file extension if path provided
  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return FILE_EXTENSIONS[ext as keyof typeof FILE_EXTENSIONS] !== undefined;
  }
  
  return false;
}

/**
 * Get list of supported file types
 */
export function getSupportedFileTypes(): string[] {
  return Object.values(FILE_EXTENSIONS);
}

/**
 * Get supported MIME types
 */
export function getSupportedMimeTypes(): string[] {
  return Object.keys(SUPPORTED_MIME_TYPES);
}




