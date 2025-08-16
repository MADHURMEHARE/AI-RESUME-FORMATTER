# File Parsing Service

A comprehensive file parsing service that extracts text content from PDF, DOCX, and Excel files with intelligent fallback to OCR when needed.

## 🚀 Features

- **Multi-format Support**: PDF, DOCX, XLS, XLSX
- **Intelligent OCR Fallback**: Automatically falls back to OCR if PDF text extraction fails
- **Rich Metadata**: Page count, image detection, processing time, file size
- **Text Sanitization**: Clean, normalized output with proper formatting
- **Error Handling**: Comprehensive error handling with descriptive messages
- **Performance Logging**: Detailed logging for debugging and monitoring

## 📦 Installation

The service requires the following dependencies:

```bash
npm install pdf-parse mammoth xlsx tesseract.js
npm install --save-dev @types/pdf-parse
```

## 🔧 Usage

### Basic File Parsing

```typescript
import { parseFile } from './parseFile';

const result = await parseFile('./cv.pdf', 'application/pdf');
console.log('Extracted text:', result.rawText);
console.log('Pages:', result.metadata.pages);
```

### Advanced Parsing with Options

```typescript
import { parseFile, ParseOptions } from './parseFile';

const options: ParseOptions = {
  enableOCR: true,
  ocrLanguage: 'eng',
  maxPages: 10,
  extractImages: false,
};

const result = await parseFile('./cv.pdf', 'application/pdf', options);
```

### File Information (Without Parsing)

```typescript
import { getFileInfo } from './parseFile';

const info = await getFileInfo('./cv.pdf');
console.log('File type:', info.fileType);
console.log('File size:', info.fileSize);
console.log('Supported:', info.supported);
```

### File Type Validation

```typescript
import { isFileSupported, getSupportedFileTypes } from './parseFile';

// Check if a specific MIME type is supported
if (isFileSupported('application/pdf')) {
  console.log('PDF files are supported');
}

// Get all supported file types
const supportedTypes = getSupportedFileTypes();
console.log('Supported types:', supportedTypes);
```

## 📋 API Reference

### `parseFile(filePath: string, mime: string, options?: ParseOptions): Promise<ParseResult>`

Main function to parse file content.

**Parameters:**
- `filePath`: Path to the file to parse
- `mime`: MIME type of the file
- `options`: Optional parsing configuration

**Returns:**
```typescript
interface ParseResult {
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
```

### `ParseOptions`

```typescript
interface ParseOptions {
  enableOCR?: boolean;        // Enable OCR fallback (default: true)
  ocrLanguage?: string;       // OCR language code (default: 'eng')
  maxPages?: number;          // Maximum pages to process (default: 0 = no limit)
  extractImages?: boolean;    // Extract image information (default: false)
}
```

## 🔍 Supported File Types

| Format | MIME Type | Extension | Parser | OCR Support |
|--------|-----------|-----------|---------|-------------|
| PDF | `application/pdf` | `.pdf` | pdf-parse | ✅ Yes |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` | mammoth | ❌ No |
| XLS | `application/vnd.ms-excel` | `.xls` | xlsx | ❌ No |
| XLSX | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xlsx` | xlsx | ❌ No |

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The tests include:
- File type detection
- Error handling
- Text sanitization
- Integration tests (when test files are available)

## 📝 Examples

See `examples/parseFileExample.ts` for comprehensive usage examples including:
- Basic file parsing
- Multiple file type handling
- Error handling patterns
- Performance monitoring

## 🚨 Error Handling

The service provides detailed error messages for common issues:

- **Unsupported file format**: Clear indication of what formats are supported
- **File not found**: Descriptive file access errors
- **Parsing failures**: Specific error messages for each file type
- **OCR failures**: Graceful fallback when OCR is not available

## 🔧 Configuration

### OCR Configuration

OCR is automatically enabled for PDF files when text extraction yields insufficient content (< 50 characters). You can disable this behavior:

```typescript
const options: ParseOptions = {
  enableOCR: false,
};
```

### Language Support

OCR supports multiple languages. Set the language code:

```typescript
const options: ParseOptions = {
  ocrLanguage: 'fra', // French
};
```

Common language codes: `eng`, `fra`, `deu`, `spa`, `ita`, `por`, `rus`, `jpn`, `chi_sim`, `chi_tra`

## 📊 Performance

The service includes built-in performance monitoring:

- Processing time measurement
- File size tracking
- Page count estimation
- Memory usage optimization

## 🔒 Security

- File path validation
- MIME type verification
- Buffer size limits
- Safe file access patterns

## 🐛 Troubleshooting

### Common Issues

1. **OCR not working**: Tesseract.js requires browser environment. For Node.js, consider using `tesseract-ocr` or similar.
2. **Memory issues**: Large files are processed in chunks to minimize memory usage.
3. **Encoding problems**: Text is automatically normalized to UTF-8.

### Debug Mode

Enable detailed logging by setting environment variable:

```bash
DEBUG=parseFile npm start
```

## 🤝 Contributing

When adding new file format support:

1. Add the MIME type to `SUPPORTED_MIME_TYPES`
2. Add the file extension to `FILE_EXTENSIONS`
3. Implement the parsing function
4. Add comprehensive tests
5. Update this documentation

## 📄 License

MIT License - see LICENSE file for details.




