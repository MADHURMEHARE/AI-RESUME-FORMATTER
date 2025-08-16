import { parseFile, getFileInfo, isFileSupported } from '../parseFile';
import path from 'path';

/**
 * Example usage of the parseFile service
 */
export async function parseFileExample() {
  try {
    // Example file path (replace with actual file path)
    const filePath = './sample-cv.pdf';
    const mimeType = 'application/pdf';
    
    console.log('=== File Parsing Service Example ===\n');
    
    // 1. Check if file type is supported
    if (!isFileSupported(mimeType)) {
      console.log(`❌ File type ${mimeType} is not supported`);
      return;
    }
    
    console.log(`✅ File type ${mimeType} is supported`);
    
    // 2. Get file information without parsing
    try {
      const fileInfo = await getFileInfo(filePath);
      console.log('\n📁 File Information:');
      console.log(`   Type: ${fileInfo.fileType}`);
      console.log(`   Size: ${(fileInfo.fileSize / 1024).toFixed(2)} KB`);
      console.log(`   Last Modified: ${fileInfo.lastModified.toLocaleDateString()}`);
      console.log(`   Supported: ${fileInfo.supported ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log(`⚠️  Could not get file info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // 3. Parse the file with options
    console.log('\n🔄 Parsing file...');
    
    const parseOptions = {
      enableOCR: true,
      ocrLanguage: 'eng',
      maxPages: 10,
      extractImages: false,
    };
    
    const result = await parseFile(filePath, mimeType, parseOptions);
    
    // 4. Display results
    console.log('\n✅ File parsed successfully!');
    console.log('\n📊 Parsing Results:');
    console.log(`   Raw Text Length: ${result.rawText.length} characters`);
    console.log(`   Pages: ${result.metadata.pages}`);
    console.log(`   Has Images: ${result.metadata.hasImages ? 'Yes' : 'No'}`);
    console.log(`   File Type: ${result.metadata.fileType}`);
    console.log(`   File Size: ${(result.metadata.fileSize / 1024).toFixed(2)} KB`);
    console.log(`   Processing Time: ${result.metadata.processingTime}ms`);
    console.log(`   OCR Used: ${result.metadata.ocrUsed ? 'Yes' : 'No'}`);
    
    // 5. Show sample of extracted text
    console.log('\n📝 Sample Extracted Text:');
    const sampleText = result.rawText.substring(0, 200);
    console.log(`   "${sampleText}${result.rawText.length > 200 ? '...' : ''}"`);
    
  } catch (error) {
    console.error('\n❌ Error parsing file:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Example of parsing different file types
 */
export async function parseMultipleFileTypesExample() {
  const files = [
    { path: './cv.pdf', mime: 'application/pdf', name: 'PDF CV' },
    { path: './cv.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'DOCX CV' },
    { path: './cv.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Excel CV' },
  ];
  
  console.log('\n=== Multiple File Types Example ===\n');
  
  for (const file of files) {
    try {
      if (isFileSupported(file.mime)) {
        console.log(`🔄 Parsing ${file.name}...`);
        const result = await parseFile(file.path, file.mime);
        console.log(`✅ ${file.name}: ${result.rawText.length} characters, ${result.metadata.pages} pages`);
      } else {
        console.log(`❌ ${file.name}: Unsupported file type`);
      }
    } catch (error) {
      console.log(`⚠️  ${file.name}: ${error instanceof Error ? error.message : 'Parse failed'}`);
    }
  }
}

/**
 * Example of error handling
 */
export async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===\n');
  
  try {
    // Try to parse an unsupported file type
    await parseFile('./file.txt', 'text/plain');
  } catch (error) {
    console.log('✅ Caught unsupported file type error:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  try {
    // Try to parse a non-existent file
    await parseFile('./nonexistent.pdf', 'application/pdf');
  } catch (error) {
    console.log('✅ Caught file not found error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    await parseFileExample();
    await parseMultipleFileTypesExample();
    await errorHandlingExample();
  })();
}




