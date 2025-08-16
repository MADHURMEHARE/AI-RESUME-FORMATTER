const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    // Initialize different AI clients
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-key'
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'your-anthropic-key'
    });
    
    this.googleAI = new GoogleGenerativeAI(
      process.env.GOOGLE_AI_API_KEY || 'your-google-ai-key'
    );
    
    this.models = {
      contentExtraction: 'gpt-4',
      skillAnalysis: 'claude-3-sonnet-20240229',
      formatting: 'gemini-pro',
      validation: 'gpt-3.5-turbo'
    };
  }

  // Extract and structure CV content using GPT-4
  async extractCVContent(text) {
    try {
      const prompt = `
        Analyze this CV text and extract structured information. Return a JSON object with:
        {
          "personalDetails": {
            "firstName": "string",
            "lastName": "string", 
            "jobTitle": "string",
            "email": "string",
            "phone": "string",
            "address": "string",
            "nationality": "string",
            "languages": ["string"],
            "dateOfBirth": "string",
            "maritalStatus": "string"
          },
          "profile": "string",
          "experience": [
            {
              "company": "string",
              "position": "string", 
              "startDate": "string",
              "endDate": "string",
              "description": ["string"],
              "achievements": ["string"]
            }
          ],
          "education": [
            {
              "institution": "string",
              "degree": "string",
              "field": "string",
              "startDate": "string", 
              "endDate": "string",
              "grade": "string"
            }
          ],
          "keySkills": ["string"],
          "interests": ["string"],
          "projects": [
            {
              "name": "string",
              "description": "string",
              "technologies": ["string"],
              "achievements": ["string"]
            }
          ]
        }
        
        CV Text: ${text}
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.contentExtraction,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000
      });

      const extractedData = JSON.parse(response.choices[0].message.content);
      return { success: true, data: extractedData };
    } catch (error) {
      console.error('Content extraction error:', error);
      return { success: false, error: error.message };
    }
  }

  // Analyze skills and provide insights using Claude
  async analyzeSkills(skills, jobTitle) {
    try {
      const prompt = `
        Analyze these technical skills: ${skills.join(', ')}
        For job title: ${jobTitle}
        
        Provide:
        1. Skill categorization (Frontend, Backend, DevOps, etc.)
        2. Missing skills for this role
        3. Skill level assessment (Beginner, Intermediate, Advanced)
        4. Market demand analysis
        5. Learning recommendations
        
        Return as JSON:
        {
          "categories": {"Frontend": ["skill1", "skill2"], "Backend": ["skill3"]},
          "missingSkills": ["skill1", "skill2"],
          "skillLevels": {"skill1": "Advanced", "skill2": "Intermediate"},
          "marketDemand": {"skill1": "High", "skill2": "Medium"},
          "recommendations": ["Learn skill1", "Improve skill2"]
        }
      `;

      const response = await this.anthropic.messages.create({
        model: this.models.skillAnalysis,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });

      const analysis = JSON.parse(response.content[0].text);
      return { success: true, data: analysis };
    } catch (error) {
      console.error('Skill analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  // Enhance and format content using Gemini
  async enhanceContent(content, industry) {
    try {
      const prompt = `
        Enhance this CV content for ${industry} industry following EHS professional standards:
        
        Rules:
        - Remove redundant phrases like "I am responsible for" → "Responsible for"
        - Fix common mistakes: "Principle" → "Principal", "Discrete" → "Discreet"
        - Convert paragraphs to bullet points
        - Ensure professional tone throughout
        - Use action verbs and quantifiable achievements
        - Follow date format: "Jan 2020" (3 letters only)
        - Capitalize job titles
        
        Content: ${JSON.stringify(content)}
        
        Return enhanced content in the same JSON structure.
      `;

      const model = this.googleAI.getGenerativeModel({ model: this.models.formatting });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const enhancedContent = JSON.parse(response.text());
      return { success: true, data: enhancedContent };
    } catch (error) {
      console.error('Content enhancement error:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate CV quality using GPT-3.5
  async validateCV(cvData) {
    try {
      const prompt = `
        Validate this CV for quality and completeness:
        ${JSON.stringify(cvData)}
        
        Check for:
        1. Missing critical information
        2. Inconsistent formatting
        3. Grammar and spelling issues
        4. Professional tone
        5. ATS compatibility
        
        Return JSON:
        {
          "score": 85,
          "issues": ["Missing phone number", "Inconsistent date format"],
          "suggestions": ["Add contact information", "Standardize dates"],
          "atsCompatibility": "Good",
          "overallQuality": "Professional"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.validation,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000
      });

      const validation = JSON.parse(response.choices[0].message.content);
      return { success: true, data: validation };
    } catch (error) {
      console.error('CV validation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate industry-specific insights
  async generateIndustryInsights(industry, role) {
    try {
      const prompt = `
        Provide insights for ${role} position in ${industry} industry:
        
        1. Current market trends
        2. Required skills and certifications
        3. Salary ranges
        4. Career growth opportunities
        5. Industry-specific CV tips
        
        Return as JSON with detailed insights.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.models.contentExtraction,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      });

      const insights = JSON.parse(response.choices[0].message.content);
      return { success: true, data: insights };
    } catch (error) {
      console.error('Industry insights error:', error);
      return { success: false, error: error.message };
    }
  }

  // Process CV with all AI models
  async processCVWithAI(text, industry = 'Technology') {
    try {
      console.log('Starting AI-powered CV processing...');
      
      // Step 1: Extract content
      const extraction = await this.extractCVContent(text);
      if (!extraction.success) throw new Error(extraction.error);
      
      // Step 2: Analyze skills
      const skillAnalysis = await this.analyzeSkills(
        extraction.data.keySkills || [], 
        extraction.data.personalDetails?.jobTitle || 'Software Developer'
      );
      
      // Step 3: Enhance content
      const enhancedContent = await this.enhanceContent(extraction.data, industry);
      if (!enhancedContent.success) throw new Error(enhancedContent.error);
      
      // Step 4: Validate final CV
      const validation = await this.validateCV(enhancedContent.data);
      
      // Step 5: Generate industry insights
      const insights = await this.generateIndustryInsights(
        industry, 
        enhancedContent.data.personalDetails?.jobTitle || 'Software Developer'
      );

      return {
        success: true,
        cvData: enhancedContent.data,
        skillAnalysis: skillAnalysis.success ? skillAnalysis.data : null,
        validation: validation.success ? validation.data : null,
        insights: insights.success ? insights.data : null,
        processingSteps: ['extraction', 'skill-analysis', 'enhancement', 'validation', 'insights']
      };
    } catch (error) {
      console.error('AI processing error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AIService;
