import { CVData } from '@/types/cv'
import apiService from './apiService'

export class DownloadService {
  static async downloadPDF(cvData: CVData): Promise<void> {
    // Use text-based generation since backend doesn't support PDF export yet
    console.log('Generating text-based PDF content')
    const content = this.generateCVContent(cvData)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = this.formatFileName(cvData, 'pdf')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  static async downloadDOCX(cvData: CVData): Promise<void> {
    // Use text-based generation since backend doesn't support DOCX export yet
    console.log('Generating text-based DOCX content')
    const content = this.generateCVContent(cvData)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = this.formatFileName(cvData, 'docx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  private static generateCVContent(cvData: CVData): string {
    const { personalDetails, profile, experience, education, keySkills, interests } = cvData
    
    let content = ''
    
    // Header
    content += `${personalDetails.firstName} ${personalDetails.lastName}\n`
    content += `${personalDetails.jobTitle}\n`
    content += '='.repeat(50) + '\n\n'
    
    // Personal Details
    content += 'PERSONAL DETAILS\n'
    content += '-'.repeat(20) + '\n'
    content += `Nationality: ${personalDetails.nationality}\n`
    content += `Languages: ${personalDetails.languages.join(', ')}\n`
    content += `Date of Birth: ${personalDetails.dateOfBirth}\n`
    content += `Marital Status: ${personalDetails.maritalStatus}\n`
    content += `Email: ${personalDetails.email}\n`
    content += `Phone: ${personalDetails.phone}\n`
    content += `Address: ${personalDetails.address}\n\n`
    
    // Profile
    content += 'PROFESSIONAL PROFILE\n'
    content += '-'.repeat(20) + '\n'
    content += `${profile}\n\n`
    
    // Experience
    content += 'PROFESSIONAL EXPERIENCE\n'
    content += '-'.repeat(20) + '\n'
    experience.forEach((exp, index) => {
      content += `${index + 1}. ${exp.position}\n`
      content += `   Company: ${exp.company}\n`
      content += `   Period: ${exp.startDate} - ${exp.endDate}\n`
      content += `   Key Responsibilities:\n`
      exp.description.forEach(desc => {
        content += `     • ${desc}\n`
      })
      if (exp.achievements.length > 0) {
        content += `   Key Achievements:\n`
        exp.achievements.forEach(achievement => {
          content += `     • ${achievement}\n`
        })
      }
      content += '\n'
    })
    
    // Education
    content += 'EDUCATION\n'
    content += '-'.repeat(20) + '\n'
    education.forEach((edu, index) => {
      content += `${index + 1}. ${edu.degree}\n`
      content += `   Institution: ${edu.institution}\n`
      content += `   Field: ${edu.field}\n`
      content += `   Period: ${edu.startDate} - ${edu.endDate}\n`
      if (edu.grade) {
        content += `   Grade: ${edu.grade}\n`
      }
      content += '\n'
    })
    
    // Skills
    content += 'KEY SKILLS\n'
    content += '-'.repeat(20) + '\n'
    keySkills.forEach(skill => {
      content += `• ${skill}\n`
    })
    content += '\n'
    
    // Interests
    content += 'INTERESTS\n'
    content += '-'.repeat(20) + '\n'
    interests.forEach(interest => {
      content += `• ${interest}\n`
    })
    content += '\n'
    
    // Footer
    content += '='.repeat(50) + '\n'
    content += 'Generated using AI CV Transformer\n'
    content += `Date: ${new Date().toLocaleDateString()}\n`
    content += 'Following EHS Professional Formatting Standards\n'
    
    return content
  }

  private static formatFileName(cvData: CVData, extension: string): string {
    const { firstName, lastName } = cvData.personalDetails
    const timestamp = new Date().toISOString().split('T')[0]
    return `${firstName}_${lastName}_CV_${timestamp}.${extension}`
  }
}

// Export individual functions for easier use
export const downloadPDF = (cvData: CVData) => DownloadService.downloadPDF(cvData)
export const downloadDOCX = (cvData: CVData) => DownloadService.downloadDOCX(cvData)
