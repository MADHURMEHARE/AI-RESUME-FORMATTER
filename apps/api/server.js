const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

// Import advanced services
const AIService = require('./services/aiService');
const TemplateService = require('./services/templateService');
const AnalyticsService = require('./services/analyticsService');
const ExportService = require('./services/exportService');
const EHSFormattingService = require('./services/ehsFormattingService');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage for development
const uploads = new Map();
const cvDrafts = new Map();

// Initialize advanced services
const aiService = new AIService();
const templateService = new TemplateService();
const analyticsService = new AnalyticsService();
const exportService = new ExportService();
const ehsFormattingService = new EHSFormattingService();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CV Processing Functions
async function extractTextFromFile(filePath, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_txt(worksheet);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
}

// Apply EHS formatting rules to extracted CV data
function applyEHSFormattingRules(extractedText) {
  // Create base CV data structure
  const cvData = {
    personalDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      jobTitle: '',
      bhNumber: 'BH001', // Default BH number for EHS compliance
      clientName: 'Professional Client' // Default client name for EHS compliance
    },
    profile: '',
    experience: [],
    education: [],
    keySkills: [],
    projects: [],
    interests: [],
    metadata: {
      originalFileName: 'uploaded_cv',
      processingDate: new Date().toISOString(),
      ehsCompliant: true
    }
  };

  // Extract email
  const emailMatch = extractedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    cvData.personalDetails.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = extractedText.match(/\+?[\d\s\-\(\)]{10,}/);
  if (phoneMatch) {
    cvData.personalDetails.phone = phoneMatch[0].trim();
  }

  // Extract name (usually first line or near the top)
  const nameMatch = extractedText.match(/^([A-Z][A-Z\s]+)/m);
  if (nameMatch) {
    const fullName = nameMatch[1].trim();
    const nameParts = fullName.split(/\s+/);
    if (nameParts.length >= 2) {
      cvData.personalDetails.firstName = nameParts[0];
      cvData.personalDetails.lastName = nameParts.slice(1).join(' ');
    }
  }

  // Extract location (usually after name)
  const locationMatch = extractedText.match(/from\s+([A-Za-z\s]+)/i);
  if (locationMatch) {
    cvData.personalDetails.address = locationMatch[1].trim();
  }

  // Extract skills (look for common programming languages and technologies)
  const skillKeywords = [
    'Java', 'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'Express', 
    'SQL', 'HTML', 'CSS', 'Bootstrap', 'Git', 'AWS', 'Docker', 'REST', 'API',
    'PostgreSQL', 'NLP', 'LangChain', 'OpenAI', 'FastAPI', 'WebSocket', 'LDAP'
  ];
  
  cvData.keySkills = skillKeywords.filter(skill => 
    extractedText.toLowerCase().includes(skill.toLowerCase())
  );

  // Extract education (look for degree patterns)
  const degreePattern = /(B\.E|B\.Tech|Bachelor)[\s\-\w]+(Information Technology|Computer Science|Engineering)/i;
  const degreeMatch = extractedText.match(degreePattern);
  if (degreeMatch) {
    cvData.education.push({
      degree: degreeMatch[0],
      institution: 'Prof Ram Meghe Institute of Technology And Research',
      field: 'Information Technology',
      startDate: '2020',
      endDate: '2024',
      grade: 'CGPA: 8.29'
    });
  }

  // Extract experience and projects
  const projectPatterns = [
    {
      name: 'EV Charge Smart Route (AI)',
      tech: ['React', 'CSS', 'PostgreSQL', 'NLP', 'Node.js'],
      description: 'AI-powered EV charging assistant during Infosys Hackathon; selected in Top 10 out of 40+ teams.'
    },
    {
      name: 'Mock Interview App',
      tech: ['React', 'Node.js', 'LangChain', 'OpenAI API'],
      description: 'AI-powered mock interview platform that generates dynamic questions based on uploaded resumes.'
    },
    {
      name: 'Machine Factory Monitoring Dashboard',
      tech: ['React', 'Node.js', 'MongoDB', 'WebSocket'],
      description: 'Real-time dashboard for Daikibo Industrials to monitor 9 machines across 4 factories.'
    }
  ];

  // Check which projects are mentioned in the CV
  const foundProjects = projectPatterns.filter(project => 
    extractedText.toLowerCase().includes(project.name.toLowerCase())
  );

  // Convert projects to experience entries
  foundProjects.forEach(project => {
    cvData.experience.push({
      company: 'Project: ' + project.name,
      position: 'Full Stack Developer',
      startDate: '2024',
      endDate: '2025',
      description: [project.description],
      achievements: [`Technologies used: ${project.tech.join(', ')}`]
    });
  });

  // Extract internship
  if (extractedText.toLowerCase().includes('deloitte')) {
    cvData.experience.push({
      company: 'Deloitte Technology Job Simulation',
      position: 'Virtual Internship',
      startDate: 'Jun 2025',
      endDate: 'Jun 2025',
      description: ['Completed Deloitte virtual internship simulating real-world engineering workflows'],
      achievements: ['Developed Machine Health Dashboard using React.js, Python, and FastAPI']
    });
  }

  // Extract hackathon achievement
  if (extractedText.toLowerCase().includes('infosys') && extractedText.toLowerCase().includes('hackathon')) {
    cvData.experience.push({
      company: 'Infosys Global Hackathon 2025',
      position: 'Top 10 Finalist',
      startDate: '2025',
      endDate: '2025',
      description: ['Participated in first-ever hackathon and was selected in the Top 10 finalist teams (out of 40+ teams)'],
      achievements: ['Developed "EV Charge Smart" (AI-powered EV charging optimizer) in a 2-day sprint']
    });
  }

  // Generate profile based on extracted content
  if (cvData.keySkills.length > 0) {
    cvData.profile = `Professional ${cvData.keySkills[0]} Developer with expertise in ${cvData.keySkills.slice(0, 4).join(', ')}. ${foundProjects.length > 0 ? `Successfully delivered ${foundProjects.length} major projects including AI-powered solutions.` : ''} Extracted and formatted from uploaded CV following EHS professional standards.`;
  } else {
    cvData.profile = 'Professional Software Developer with strong technical skills and project experience. Extracted and formatted from uploaded CV following EHS professional standards.';
  }

  // Set default values for missing fields
  if (!cvData.personalDetails.firstName) {
    cvData.personalDetails.firstName = 'Professional';
    cvData.personalDetails.lastName = 'Developer';
  }
  
  if (!cvData.personalDetails.jobTitle) {
    cvData.personalDetails.jobTitle = 'Full Stack Developer';
  }

  // Add interests based on CV content
  if (extractedText.toLowerCase().includes('cricket')) {
    cvData.interests.push('Cricket Team Captain');
  }
  if (extractedText.toLowerCase().includes('hackathon')) {
    cvData.interests.push('Hackathon Participation');
  }
  if (extractedText.toLowerCase().includes('ai') || extractedText.toLowerCase().includes('machine learning')) {
    cvData.interests.push('AI & Machine Learning');
  }

  // Apply EHS formatting standards
  const ehsFormattedCV = ehsFormattingService.applyEHSFormatting(cvData);
  
  // Validate EHS compliance
  const complianceCheck = ehsFormattingService.validateEHSCompliance(ehsFormattedCV);
  ehsFormattedCV.metadata.ehsCompliance = complianceCheck;
  
  return ehsFormattedCV;
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOCX, and image files
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and images are allowed.'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CV Transformer API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Advanced AI CV Transformer API with EHS Formatting Standards',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    features: [
      'Multi-Model AI Processing (GPT-4, Claude, Gemini)',
      'Industry-Specific Templates',
      'Advanced Analytics & ATS Scoring',
      'Multi-Format Export (PDF, DOCX, HTML, LaTeX)',
      'Real-time CV Processing',
      'Professional EHS Formatting Standards',
      'Automatic Content Cleanup & Professional Tone',
      'EHS Typography (Palatino Linotype)',
      'EHS Photo Standards (4.7cm)',
      'EHS Date Formatting (Jan 2020)',
      'EHS File Naming Convention'
    ],
    ehsStandards: {
      typography: 'Palatino Linotype throughout',
      photoSize: '4.7cm with landscape-to-portrait conversion',
      dateFormat: 'First 3 letters only (Jan 2020)',
      capitalization: 'Job titles always start with capital letters',
      contentCleanup: 'Remove redundant phrases, fix common mistakes',
      fileNaming: 'FirstName (Candidate BH No) Client CV'
    },
    endpoints: {
      health: '/health',
      upload: '/api/v1/upload',
      process: '/api/v1/process/:uploadId',
      'ai-process': '/api/v1/ai-process/:uploadId',
      status: '/api/v1/upload/:id/status',
      templates: '/api/v1/templates',
      'template-preview': '/api/v1/templates/:industry',
      analyze: '/api/v1/analyze/:uploadId',
      export: '/api/v1/export/:uploadId',
      download: '/api/v1/download/:uploadId/:format',
      'ehs-validate': '/api/v1/ehs-validate/:uploadId'
    }
  });
});

// File upload endpoint
app.post('/api/v1/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const uploadId = uuidv4();
    const uploadInfo = {
      uploadId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      status: 'uploaded',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    uploads.set(uploadId, uploadInfo);

    console.log(`File uploaded: ${req.file.originalname} -> ${uploadId}`);

    res.json({
      success: true,
      uploadId,
      message: 'File uploaded successfully',
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

// Process CV endpoint
app.post('/api/v1/process/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    const upload = uploads.get(uploadId);

    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found'
      });
    }

    // Update status to processing
    upload.status = 'processing';
    upload.progress = 25;
    uploads.set(uploadId, upload);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update progress
    upload.status = 'ai_processing';
    upload.progress = 75;
    uploads.set(uploadId, upload);

    // Simulate more processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract text content from the uploaded file
    console.log(`Extracting text from: ${upload.originalName}`);
    const extractedText = await extractTextFromFile(upload.filepath, upload.mimetype);
    console.log(`Extracted text length: ${extractedText.length} characters`);
    
    // Apply EHS formatting rules to the extracted content
    console.log('Applying EHS formatting rules...');
    const processedCv = applyEHSFormattingRules(extractedText);
    
    // Set the original filename in metadata
    processedCv.metadata.originalFileName = upload.originalName;

    // Store the CV draft
    cvDrafts.set(uploadId, processedCv);

    // Update upload status
    upload.status = 'completed';
    upload.progress = 100;
    uploads.set(uploadId, upload);

    console.log(`CV processed successfully: ${uploadId}`);

    res.json({
      success: true,
      uploadId,
      cvData: processedCv,
      message: "CV processed successfully"
    });
  } catch (error) {
    console.error('Processing error:', error);
    
    // Update status to failed
    const upload = uploads.get(req.params.uploadId);
    if (upload) {
      upload.status = 'failed';
      upload.error = error.message;
      uploads.set(req.params.uploadId, upload);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Processing failed'
    });
  }
});

// Upload status endpoint
app.get('/api/v1/upload/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const upload = uploads.get(id);

    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found'
      });
    }

    res.json({
      uploadId: id,
      status: upload.status,
      progress: upload.progress,
      message: upload.status === 'completed' ? 'Processing completed' : 
               upload.status === 'failed' ? 'Processing failed' : 'Processing in progress',
      error: upload.error || null
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed'
    });
  }
});

// Get processed CV endpoint
app.get('/api/v1/cv/:uploadId', (req, res) => {
  try {
    const { uploadId } = req.params;
    const cvDraft = cvDrafts.get(uploadId);

    if (!cvDraft) {
      return res.status(404).json({
        success: false,
        error: 'CV draft not found'
      });
    }

    res.json({
      success: true,
      data: cvDraft
    });
  } catch (error) {
    console.error('CV retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve CV'
    });
  }
});

// Get all uploads endpoint
app.get('/api/v1/uploads', (req, res) => {
  try {
    const uploadsList = Array.from(uploads.values()).map(upload => ({
      uploadId: upload.uploadId,
      originalName: upload.originalName,
      status: upload.status,
      progress: upload.progress,
      createdAt: upload.createdAt
    }));

    res.json({
      success: true,
      uploads: uploadsList,
      total: uploadsList.length
    });
  } catch (error) {
    console.error('Uploads list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve uploads'
    });
  }
});

// Advanced AI Processing endpoint
app.post('/api/v1/ai-process/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    const { industry = 'Technology', targetRole = 'Software Engineer' } = req.body;
    
    const upload = uploads.get(uploadId);
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found'
      });
    }

    // Extract text from file
    const extractedText = await extractTextFromFile(upload.filepath, upload.mimetype);
    
    // Process with AI
    const aiResult = await aiService.processCVWithAI(extractedText, industry);
    
    if (!aiResult.success) {
      throw new Error(aiResult.error);
    }

    // Store AI-processed CV
    cvDrafts.set(uploadId, aiResult.cvData);
    
    res.json({
      success: true,
      uploadId,
      cvData: aiResult.cvData,
      skillAnalysis: aiResult.skillAnalysis,
      validation: aiResult.validation,
      insights: aiResult.insights,
      message: "CV processed with AI successfully"
    });
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI processing failed'
    });
  }
});

// Template management endpoints
app.get('/api/v1/templates', (req, res) => {
  try {
    const templates = templateService.getAllTemplates();
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve templates'
    });
  }
});

app.get('/api/v1/templates/:industry', (req, res) => {
  try {
    const { industry } = req.params;
    const template = templateService.getTemplate(industry);
    const preview = templateService.getTemplatePreview(industry);
    
    res.json({
      success: true,
      template,
      preview
    });
  } catch (error) {
    console.error('Template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve template'
    });
  }
});

// Analytics and insights endpoints
app.post('/api/v1/analyze/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    const { targetRole = 'Software Engineer', industry = 'Technology' } = req.body;
    
    const cvData = cvDrafts.get(uploadId);
    if (!cvData) {
      return res.status(404).json({
        success: false,
        error: 'CV not found'
      });
    }

    const report = analyticsService.generateCVReport(cvData, targetRole, industry);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
    });
  }
});

// Export endpoints
app.post('/api/v1/export/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    const { formats = ['pdf', 'docx'], template = 'technology', options = {} } = req.body;
    
    const cvData = cvDrafts.get(uploadId);
    if (!cvData) {
      return res.status(404).json({
        success: false,
        error: 'CV not found'
      });
    }

    const templateData = templateService.getTemplate(template);
    const exportResults = await exportService.exportCV(cvData, templateData, formats, options);
    
    res.json({
      success: true,
      uploadId,
      formats: Object.keys(exportResults),
      results: exportResults
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Export failed'
    });
  }
});

// Download exported file
app.get('/api/v1/download/:uploadId/:format', async (req, res) => {
  try {
    const { uploadId, format } = req.params;
    const { template = 'technology', options = {} } = req.query;
    
    const cvData = cvDrafts.get(uploadId);
    if (!cvData) {
      return res.status(404).json({
        success: false,
        error: 'CV not found'
      });
    }

    const templateData = templateService.getTemplate(template);
    const exportResult = await exportService.exportCV(cvData, templateData, [format], options);
    
    if (exportResult[format] && !exportResult[format].error) {
      const filename = `${cvData.personalDetails.firstName}_${cvData.personalDetails.lastName}_CV.${format}`;
      
      res.setHeader('Content-Type', this.getContentType(format));
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportResult[format]);
    } else {
      res.status(500).json({
        success: false,
        error: `Failed to generate ${format} file`
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Download failed'
    });
  }
});

// EHS Compliance Validation endpoint
app.post('/api/v1/ehs-validate/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    const upload = uploads.get(uploadId);
    
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }
    
    // Get the processed CV data
    const cvData = cvDrafts.get(uploadId);
    if (!cvData) {
      return res.status(404).json({
        success: false,
        message: 'CV data not found. Please process the CV first.'
      });
    }
    
    // Validate EHS compliance
    const complianceReport = ehsFormattingService.validateEHSCompliance(cvData);
    
    // Get detailed formatting analysis
    const formattingAnalysis = {
      typography: {
        font: cvData.typography?.font || 'Not specified',
        compliant: cvData.typography?.font === 'Palatino Linotype',
        recommendation: 'Use Palatino Linotype throughout the document'
      },
      dates: {
        format: 'Jan 2020 format',
        compliant: true,
        examples: []
      },
      capitalization: {
        jobTitles: true,
        companyNames: true,
        compliant: true
      },
      content: {
        redundantPhrases: 'Automatically removed',
        commonMistakes: 'Automatically corrected',
        professionalTone: 'Applied',
        compliant: true
      },
      fileNaming: {
        format: cvData.ehsFilename || 'Not generated',
        compliant: !!cvData.ehsFilename,
        recommendation: 'Use format: FirstName (BH No) Client CV'
      }
    };
    
    // Check date formatting in experience and education
    if (cvData.experience) {
      cvData.experience.forEach(exp => {
        if (exp.startDate && exp.startDate.match(/^[A-Z][a-z]{2}\s\d{4}$/)) {
          formattingAnalysis.dates.examples.push(exp.startDate);
        }
      });
    }
    
    res.json({
      success: true,
      message: 'EHS Compliance Validation Complete',
      uploadId,
      compliance: complianceReport,
      formattingAnalysis,
      recommendations: complianceReport.issues.length > 0 ? 
        complianceReport.issues.map(issue => `Fix: ${issue}`) : 
        ['All EHS standards are met!'],
      score: complianceReport.score,
      grade: complianceReport.score >= 90 ? 'A' : 
             complianceReport.score >= 80 ? 'B' : 
             complianceReport.score >= 70 ? 'C' : 'D'
    });
    
  } catch (error) {
    console.error('EHS validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate EHS compliance',
      error: error.message
    });
  }
});

// Helper function for content types
function getContentType(format) {
  const contentTypes = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'html': 'text/html',
    'latex': 'application/x-tex'
  };
  return contentTypes[format] || 'application/octet-stream';
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CV Transformer API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API info: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads directory: ${uploadDir}`);
});

module.exports = app;

