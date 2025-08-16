import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { CvDraftSchema, CvDraft } from '../../shared/schemas/cv.schema'

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

// Provider configuration
interface ProviderConfig {
  name: string
  model: string
  temperature: number
  maxTokens?: number
}

const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    model: 'gpt-4o-mini',
    temperature: 0,
    maxTokens: 4000
  },
  anthropic: {
    name: 'Anthropic',
    model: 'claude-3-haiku-20240307',
    temperature: 0,
    maxTokens: 4000
  },
  gemini: {
    name: 'Google Gemini',
    model: 'gemini-1.5-flash',
    temperature: 0,
    maxTokens: 4000
  }
}

// EHS Formatting Rules System Prompt
const EHS_SYSTEM_PROMPT = `You are an expert CV formatting specialist who follows EHS (Executive Headhunting Services) professional standards.

CRITICAL FORMATTING RULES - You MUST follow these exactly:

1. DATE FORMAT: All dates must be in "Mon YYYY" format (e.g., "Jan 2020", "Mar 2017", "Sep 2013")
   - Convert any other date formats to this standard
   - Use 3-letter month abbreviations only

2. JOB TITLE CAPITALIZATION: All job titles must start with capital letters
   - "senior software engineer" → "Senior Software Engineer"
   - "project manager" → "Project Manager"

3. CONTENT CLEANUP:
   - Remove "I am responsible for" → Replace with "Responsible for"
   - Remove "I am" from sentences where possible
   - Fix "Principle" → "Principal" (for people in charge)
   - Fix "Discrete" → "Discreet" (for being careful/secretive)
   - Remove Age and Dependants fields completely
   - Convert long paragraphs to bullet points

4. STRUCTURE REQUIREMENTS:
   - Header: name, title, photoUrl (optional)
   - Personal Details: nationality, languages[], dob, maritalStatus
   - Profile: professional summary (2-3 sentences max)
   - Experience: reverse chronological order, bullet points for achievements
   - Education: degree, institution, dates, details as bullet points
   - Skills: technical and soft skills as bullet points
   - Interests: professional and personal interests as bullet points

5. AUDIT TRAIL: Include rulesApplied[] with the specific rules you applied, and issues[] for any problems found.

You must output EXACTLY the JSON structure specified in the schema. Do not add extra fields or modify the structure.`

// Main processing function
export async function formatCvWithLangChain(
  rawText: string,
  opts?: { providers?: string[] }
): Promise<CvDraft> {
  const providers = opts?.providers || ['openai', 'anthropic', 'gemini']
  
  // Check if text needs chunking (approximately 12k tokens = ~48k characters)
  const needsChunking = rawText.length > 48000
  
  if (needsChunking) {
    return await processWithChunking(rawText, providers)
  } else {
    return await processSingleChunk(rawText, providers)
  }
}

// Process single chunk of text
async function processSingleChunk(
  rawText: string,
  providers: string[]
): Promise<CvDraft> {
  let lastError: Error | null = null
  
  for (const providerName of providers) {
    try {
      const result = await processWithProvider(rawText, providerName)
      console.log(`✅ Successfully processed CV with ${providerName}`)
      return result
    } catch (error) {
      console.warn(`⚠️ ${providerName} failed:`, error instanceof Error ? error.message : 'Unknown error')
      lastError = error instanceof Error ? error : new Error('Unknown error')
      continue
    }
  }
  
  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`)
}

// Process with chunking for large texts
async function processWithChunking(
  rawText: string,
  providers: string[]
): Promise<CvDraft> {
  console.log('📄 Large text detected, using chunking strategy...')
  
  // Split text into logical chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 8000,
    chunkOverlap: 1000,
    separators: ['\n\n', '\n', '. ', ' ', '']
  })
  
  const chunks = await textSplitter.splitText(rawText)
  console.log(`📝 Split text into ${chunks.length} chunks`)
  
  // Process each chunk
  const chunkResults = await Promise.all(
    chunks.map((chunk, index) => 
      processSingleChunk(chunk, providers).catch(error => {
        console.warn(`⚠️ Chunk ${index + 1} failed:`, error.message)
        return null
      })
    )
  )
  
  // Merge results
  return mergeChunkResults(chunkResults.filter(Boolean) as CvDraft[])
}

// Merge multiple chunk results into a single CV
function mergeChunkResults(chunkResults: CvDraft[]): CvDraft {
  if (chunkResults.length === 0) {
    throw new Error('No chunks were processed successfully')
  }
  
  if (chunkResults.length === 1) {
    return chunkResults[0]
  }
  
  // Merge strategy: take the most complete result and merge arrays
  const baseResult = chunkResults[0]
  const mergedResult: CvDraft = { ...baseResult }
  
  // Merge experience arrays
  const allExperience = chunkResults.flatMap(result => result.experience)
  mergedResult.experience = deduplicateAndMergeExperience(allExperience)
  
  // Merge education arrays
  const allEducation = chunkResults.flatMap(result => result.education)
  mergedResult.education = deduplicateAndMergeEducation(allEducation)
  
     // Merge skills arrays
   const allSkills = chunkResults.flatMap(result => result.skills)
   mergedResult.skills = Array.from(new Set(allSkills))
   
   // Merge interests arrays
   const allInterests = chunkResults.flatMap(result => result.interests)
   mergedResult.interests = Array.from(new Set(allInterests))
   
   // Merge audit trails
   const allRules = chunkResults.flatMap(result => result.audit.rulesApplied)
   const allIssues = chunkResults.flatMap(result => result.audit.issues)
   mergedResult.audit = {
     rulesApplied: Array.from(new Set(allRules)),
     issues: Array.from(new Set(allIssues))
   }
  
  return mergedResult
}

// Deduplicate and merge experience entries
function deduplicateAndMergeExperience(experiences: any[]): any[] {
  const seen = new Set<string>()
  const unique: any[] = []
  
  for (const exp of experiences) {
    const key = `${exp.company}-${exp.role}-${exp.startDate}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(exp)
    }
  }
  
  // Sort by start date (reverse chronological)
  return unique.sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    return dateB.getTime() - dateA.getTime()
  })
}

// Deduplicate and merge education entries
function deduplicateAndMergeEducation(education: any[]): any[] {
  const seen = new Set<string>()
  const unique: any[] = []
  
  for (const edu of education) {
    const key = `${edu.institution}-${edu.degree}-${edu.startDate}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(edu)
    }
  }
  
  // Sort by start date (reverse chronological)
  return unique.sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    return dateB.getTime() - dateA.getTime()
  })
}

// Process with specific provider
async function processWithProvider(rawText: string, providerName: string): Promise<CvDraft> {
  const provider = PROVIDERS[providerName]
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}`)
  }
  
  // Create LLM instance
  const llm = await createLLMInstance(providerName, provider)
  
  // Create output parser
  const parser = StructuredOutputParser.fromZodSchema(CvDraftSchema)
  
  // Create prompt template
  const promptTemplate = PromptTemplate.fromTemplate(`
${EHS_SYSTEM_PROMPT}

{format_instructions}

CV TEXT TO PROCESS:
{rawText}

Please analyze this CV text and output a properly formatted CV following the EHS standards above. Output ONLY the JSON object matching the schema, no additional text or explanations.`)

  // Create processing chain
  const chain = RunnableSequence.from([
    promptTemplate,
    llm,
    parser
  ])
  
  // Process the text
  const result = await chain.invoke({
    rawText,
    format_instructions: parser.getFormatInstructions()
  })
  
  // Validate the result
  return CvDraftSchema.parse(result)
}

// Create LLM instance based on provider
async function createLLMInstance(providerName: string, config: ProviderConfig) {
  switch (providerName) {
    case 'openai':
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }
      return new ChatOpenAI({
        modelName: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        openAIApiKey: OPENAI_API_KEY
      })
      
    case 'anthropic':
      if (!ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured')
      }
      return new ChatAnthropic({
        modelName: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        anthropicApiKey: ANTHROPIC_API_KEY
      })
      
    case 'gemini':
      if (!GOOGLE_API_KEY) {
        throw new Error('Google API key not configured')
      }
             return new ChatGoogleGenerativeAI({
         model: config.model,
         temperature: config.temperature,
         apiKey: GOOGLE_API_KEY
       })
      
    default:
      throw new Error(`Unsupported provider: ${providerName}`)
  }
}

// Helper function to parse and normalize CV
export async function parseAndNormalize(rawText: string): Promise<CvDraft> {
  // First, process with AI
  const aiResult = await formatCvWithLangChain(rawText)
  
  // Then, perform programmatic normalization
  return normalizeCvData(aiResult)
}

// Programmatic normalization to enforce EHS rules
function normalizeCvData(cvData: CvDraft): CvDraft {
  const normalized = { ...cvData }
  
  // Normalize dates to "Mon YYYY" format
  if (normalized.experience) {
    normalized.experience = normalized.experience.map(exp => ({
      ...exp,
      startDate: normalizeDate(exp.startDate),
      endDate: normalizeDate(exp.endDate)
    }))
  }
  
  if (normalized.education) {
    normalized.education = normalized.education.map(edu => ({
      ...edu,
      startDate: normalizeDate(edu.startDate),
      endDate: normalizeDate(edu.endDate)
    }))
  }
  
  // Normalize job titles (capitalize first letter of each word)
  if (normalized.header.title) {
    normalized.header.title = normalizeJobTitle(normalized.header.title)
  }
  
  // Normalize profile text
  if (normalized.profile) {
    normalized.profile = normalizeProfileText(normalized.profile)
  }
  
  // Normalize experience descriptions
  if (normalized.experience) {
    normalized.experience = normalized.experience.map(exp => ({
      ...exp,
      bullets: exp.bullets.map(bullet => normalizeBulletPoint(bullet))
    }))
  }
  
  // Normalize education details
  if (normalized.education) {
    normalized.education = normalized.education.map(edu => ({
      ...edu,
      details: edu.details.map(detail => normalizeBulletPoint(detail))
    }))
  }
  
  return normalized
}

// Normalize date to "Mon YYYY" format
function normalizeDate(dateStr: string): string {
  if (!dateStr) return dateStr
  
  // Check if already in correct format
  if (/^[A-Za-z]{3} \d{4}$/.test(dateStr)) {
    return dateStr
  }
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      // Try to parse common formats
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      // Handle various date formats
      if (dateStr.includes('-')) {
        const [year, month] = dateStr.split('-')
        if (month && year) {
          const monthIndex = parseInt(month) - 1
          if (monthIndex >= 0 && monthIndex < 12) {
            return `${months[monthIndex]} ${year}`
          }
        }
      }
      
      // Handle "Month Year" format
      const monthYearMatch = dateStr.match(/(\w+)\s+(\d{4})/i)
      if (monthYearMatch) {
        const month = monthYearMatch[1]
        const year = monthYearMatch[2]
        const monthIndex = months.findIndex(m => 
          m.toLowerCase() === month.toLowerCase()
        )
        if (monthIndex >= 0) {
          return `${months[monthIndex]} ${year}`
        }
      }
      
      return dateStr // Return as-is if can't parse
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  } catch {
    return dateStr
  }
}

// Normalize job title (capitalize first letter of each word)
function normalizeJobTitle(title: string): string {
  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Normalize profile text
function normalizeProfileText(text: string): string {
  return text
    .replace(/I am responsible for/gi, 'Responsible for')
    .replace(/I am /gi, '')
    .replace(/Principle /gi, 'Principal ')
    .replace(/Discrete /gi, 'Discreet ')
    .trim()
}

// Normalize bullet points
function normalizeBulletPoint(text: string): string {
  return text
    .replace(/I am responsible for/gi, 'Responsible for')
    .replace(/I am /gi, '')
    .replace(/Principle /gi, 'Principal ')
    .replace(/Discrete /gi, 'Discreet ')
    .trim()
}

// Export provider information for debugging
export function getAvailableProviders(): string[] {
  const available: string[] = []
  
  if (OPENAI_API_KEY) available.push('openai')
  if (ANTHROPIC_API_KEY) available.push('anthropic')
  if (GOOGLE_API_KEY) available.push('gemini')
  
  return available
}

// Export provider configuration
export function getProviderConfig(providerName: string): ProviderConfig | null {
  return PROVIDERS[providerName] || null
}
