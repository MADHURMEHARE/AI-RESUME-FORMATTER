const fs = require('fs');
const path = require('path');

class AnalyticsService {
  constructor() {
    this.atsKeywords = this.loadATSKeywords();
    this.industryStandards = this.loadIndustryStandards();
    this.salaryData = this.loadSalaryData();
  }

  loadATSKeywords() {
    return {
      'Software Engineer': [
        'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB',
        'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL', 'Microservices',
        'Agile', 'Scrum', 'CI/CD', 'DevOps', 'Machine Learning', 'AI', 'Cloud Computing'
      ],
      'Data Scientist': [
        'Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch',
        'Machine Learning', 'Deep Learning', 'Statistical Analysis', 'Data Visualization',
        'Big Data', 'Hadoop', 'Spark', 'Tableau', 'Power BI', 'Jupyter', 'Git'
      ],
      'Product Manager': [
        'Product Strategy', 'User Research', 'Market Analysis', 'Agile', 'Scrum', 'JIRA',
        'User Stories', 'Product Roadmap', 'A/B Testing', 'Analytics', 'Customer Development',
        'Go-to-Market', 'Competitive Analysis', 'Stakeholder Management', 'Data-Driven'
      ],
      'UX Designer': [
        'User Research', 'Wireframing', 'Prototyping', 'Figma', 'Sketch', 'Adobe XD',
        'User Testing', 'Information Architecture', 'Interaction Design', 'Visual Design',
        'Design Systems', 'Accessibility', 'Usability', 'User Journey', 'Personas'
      ]
    };
  }

  loadIndustryStandards() {
    return {
      'Technology': {
        requiredSections: ['header', 'profile', 'experience', 'education', 'skills', 'projects'],
        preferredSkills: ['Programming', 'Problem Solving', 'Team Collaboration'],
        formatPreference: 'Modern, Clean',
        emphasisAreas: ['Technical Skills', 'Project Experience', 'Problem Solving']
      },
      'Finance': {
        requiredSections: ['header', 'executive-summary', 'experience', 'education', 'skills', 'achievements'],
        preferredSkills: ['Financial Analysis', 'Risk Management', 'Strategic Planning'],
        formatPreference: 'Professional, Traditional',
        emphasisAreas: ['Quantifiable Results', 'Financial Metrics', 'Leadership']
      },
      'Healthcare': {
        requiredSections: ['header', 'summary', 'experience', 'education', 'licenses', 'certifications'],
        preferredSkills: ['Patient Care', 'Medical Knowledge', 'Communication'],
        formatPreference: 'Clean, Trustworthy',
        emphasisAreas: ['Licenses', 'Certifications', 'Patient Experience']
      },
      'Creative': {
        requiredSections: ['header', 'portfolio', 'experience', 'education', 'skills', 'interests'],
        preferredSkills: ['Creativity', 'Design', 'Innovation'],
        formatPreference: 'Visual, Creative',
        emphasisAreas: ['Portfolio', 'Creative Work', 'Visual Skills']
      }
    };
  }

  loadSalaryData() {
    return {
      'Software Engineer': {
        'entry': { min: 60000, max: 80000, avg: 70000 },
        'mid': { min: 80000, max: 120000, avg: 100000 },
        'senior': { min: 120000, max: 180000, avg: 150000 }
      },
      'Data Scientist': {
        'entry': { min: 70000, max: 90000, avg: 80000 },
        'mid': { min: 90000, max: 140000, avg: 115000 },
        'senior': { min: 140000, max: 200000, avg: 170000 }
      },
      'Product Manager': {
        'entry': { min: 70000, max: 90000, avg: 80000 },
        'mid': { min: 90000, max: 140000, avg: 115000 },
        'senior': { min: 140000, max: 200000, avg: 170000 }
      }
    };
  }

  // Calculate ATS compatibility score
  calculateATSScore(cvData, targetRole) {
    let score = 0;
    const maxScore = 100;
    const feedback = [];

    // Check required sections
    const requiredSections = ['header', 'profile', 'experience', 'education', 'skills'];
    const missingSections = requiredSections.filter(section => !cvData[section]);
    
    if (missingSections.length > 0) {
      feedback.push(`Missing sections: ${missingSections.join(', ')}`);
      score -= missingSections.length * 10;
    } else {
      score += 20;
    }

    // Check keyword matching
    const targetKeywords = this.atsKeywords[targetRole] || this.atsKeywords['Software Engineer'];
    const cvSkills = cvData.keySkills || [];
    const matchedKeywords = targetKeywords.filter(keyword => 
      cvSkills.some(skill => 
        skill.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const keywordScore = (matchedKeywords.length / targetKeywords.length) * 40;
    score += keywordScore;

    if (matchedKeywords.length < targetKeywords.length * 0.5) {
      feedback.push(`Low keyword match. Consider adding: ${targetKeywords.slice(0, 5).join(', ')}`);
    }

    // Check content length and structure
    if (cvData.profile && cvData.profile.length > 50) score += 10;
    if (cvData.experience && cvData.experience.length > 0) score += 10;
    if (cvData.education && cvData.education.length > 0) score += 10;

    // Check for quantifiable achievements
    const hasQuantifiableResults = this.checkQuantifiableResults(cvData);
    if (hasQuantifiableResults) {
      score += 10;
      feedback.push('Good: Includes quantifiable achievements');
    } else {
      feedback.push('Consider adding quantifiable achievements (e.g., "Improved performance by 40%")');
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(maxScore, score));

    return {
      score: Math.round(score),
      maxScore,
      feedback,
      matchedKeywords: matchedKeywords.length,
      totalKeywords: targetKeywords.length,
      keywordMatchPercentage: Math.round((matchedKeywords.length / targetKeywords.length) * 100)
    };
  }

  // Check for quantifiable results in experience
  checkQuantifiableResults(cvData) {
    if (!cvData.experience) return false;
    
    const quantifiablePatterns = [
      /\d+%/, /\d+x/, /\$\d+/, /\d+ users/, /\d+ customers/,
      /\d+ projects/, /\d+ team members/, /\d+ languages/
    ];

    return cvData.experience.some(exp => {
      const text = [...(exp.description || []), ...(exp.achievements || [])].join(' ');
      return quantifiablePatterns.some(pattern => pattern.test(text));
    });
  }

  // Analyze CV quality and provide recommendations
  analyzeCVQuality(cvData, industry) {
    const analysis = {
      overallScore: 0,
      sections: {},
      recommendations: [],
      industryAlignment: 0,
      strengths: [],
      weaknesses: []
    };

    // Analyze each section
    analysis.sections = this.analyzeSections(cvData);
    
    // Calculate overall score
    const sectionScores = Object.values(analysis.sections).map(s => s.score);
    analysis.overallScore = Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length);

    // Check industry alignment
    const industryStandards = this.industryStandards[industry] || this.industryStandards['Technology'];
    analysis.industryAlignment = this.checkIndustryAlignment(cvData, industryStandards);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(cvData, analysis.sections, industryStandards);

    // Identify strengths and weaknesses
    analysis.strengths = this.identifyStrengths(analysis.sections);
    analysis.weaknesses = this.identifyWeaknesses(analysis.sections);

    return analysis;
  }

  analyzeSections(cvData) {
    const sections = {};

    // Header analysis
    sections.header = {
      score: 0,
      feedback: []
    };
    
    if (cvData.personalDetails) {
      const { firstName, lastName, email, phone } = cvData.personalDetails;
      if (firstName && lastName) sections.header.score += 30;
      if (email) sections.header.score += 30;
      if (phone) sections.header.score += 20;
      if (cvData.personalDetails.jobTitle) sections.header.score += 20;
      
      if (!firstName || !lastName) sections.header.feedback.push('Missing full name');
      if (!email) sections.header.feedback.push('Missing email address');
      if (!phone) sections.header.feedback.push('Missing phone number');
    }

    // Profile analysis
    sections.profile = {
      score: 0,
      feedback: []
    };
    
    if (cvData.profile) {
      const profileLength = cvData.profile.length;
      if (profileLength > 100 && profileLength < 300) sections.profile.score += 50;
      else if (profileLength > 50) sections.profile.score += 30;
      
      if (profileLength < 50) sections.profile.feedback.push('Profile too short - add more details');
      if (profileLength > 300) sections.profile.feedback.push('Profile too long - keep it concise');
    } else {
      sections.profile.feedback.push('Missing professional profile');
    }

    // Experience analysis
    sections.experience = {
      score: 0,
      feedback: []
    };
    
    if (cvData.experience && cvData.experience.length > 0) {
      sections.experience.score += 30;
      
      cvData.experience.forEach((exp, index) => {
        if (exp.company && exp.position) sections.experience.score += 20;
        if (exp.description && exp.description.length > 0) sections.experience.score += 20;
        if (exp.achievements && exp.achievements.length > 0) sections.experience.score += 20;
        
        if (!exp.company) sections.experience.feedback.push(`Experience ${index + 1}: Missing company name`);
        if (!exp.position) sections.experience.feedback.push(`Experience ${index + 1}: Missing job title`);
        if (!exp.description || exp.description.length === 0) {
          sections.experience.feedback.push(`Experience ${index + 1}: Add job responsibilities`);
        }
      });
    } else {
      sections.experience.feedback.push('No work experience listed');
    }

    // Skills analysis
    sections.skills = {
      score: 0,
      feedback: []
    };
    
    if (cvData.keySkills && cvData.keySkills.length > 0) {
      sections.skills.score += 50;
      if (cvData.keySkills.length >= 5) sections.skills.score += 30;
      if (cvData.keySkills.length >= 10) sections.skills.score += 20;
      
      if (cvData.keySkills.length < 5) sections.skills.feedback.push('Consider adding more skills');
    } else {
      sections.skills.feedback.push('No skills listed');
    }

    // Education analysis
    sections.education = {
      score: 0,
      feedback: []
    };
    
    if (cvData.education && cvData.education.length > 0) {
      sections.education.score += 50;
      
      cvData.education.forEach((edu, index) => {
        if (edu.institution && edu.degree) sections.education.score += 30;
        if (edu.startDate && edu.endDate) sections.education.score += 20;
        
        if (!edu.institution) sections.education.feedback.push(`Education ${index + 1}: Missing institution`);
        if (!edu.degree) sections.education.feedback.push(`Education ${index + 1}: Missing degree`);
      });
    } else {
      sections.education.feedback.push('No education listed');
    }

    return sections;
  }

  checkIndustryAlignment(cvData, industryStandards) {
    let alignment = 0;
    const requiredSections = industryStandards.requiredSections || [];
    
    requiredSections.forEach(section => {
      if (cvData[section]) alignment += 100 / requiredSections.length;
    });

    return Math.round(alignment);
  }

  generateRecommendations(cvData, sectionAnalysis, industryStandards) {
    const recommendations = [];

    // Section-specific recommendations
    Object.entries(sectionAnalysis).forEach(([section, analysis]) => {
      if (analysis.score < 70) {
        recommendations.push(...analysis.feedback);
      }
    });

    // Industry-specific recommendations
    if (industryStandards.emphasisAreas) {
      industryStandards.emphasisAreas.forEach(area => {
        if (!this.hasEmphasisArea(cvData, area)) {
          recommendations.push(`Consider emphasizing ${area.toLowerCase()}`);
        }
      });
    }

    // General recommendations
    if (!this.checkQuantifiableResults(cvData)) {
      recommendations.push('Add quantifiable achievements to make your experience more impactful');
    }

    if (cvData.keySkills && cvData.keySkills.length < 8) {
      recommendations.push('Expand your skills section to show more technical capabilities');
    }

    return recommendations;
  }

  hasEmphasisArea(cvData, area) {
    const areaLower = area.toLowerCase();
    
    if (areaLower.includes('technical') || areaLower.includes('skills')) {
      return cvData.keySkills && cvData.keySkills.length >= 8;
    }
    
    if (areaLower.includes('project')) {
      return cvData.projects && cvData.projects.length > 0;
    }
    
    if (areaLower.includes('leadership')) {
      return cvData.experience && cvData.experience.some(exp => 
        exp.position.toLowerCase().includes('lead') || 
        exp.position.toLowerCase().includes('senior') ||
        exp.position.toLowerCase().includes('manager')
      );
    }

    return true;
  }

  identifyStrengths(sectionAnalysis) {
    const strengths = [];
    
    Object.entries(sectionAnalysis).forEach(([section, analysis]) => {
      if (analysis.score >= 80) {
        strengths.push(`${section.charAt(0).toUpperCase() + section.slice(1)} section is well-developed`);
      }
    });

    return strengths;
  }

  identifyWeaknesses(sectionAnalysis) {
    const weaknesses = [];
    
    Object.entries(sectionAnalysis).forEach(([section, analysis]) => {
      if (analysis.score < 60) {
        weaknesses.push(`${section.charAt(0).toUpperCase() + section.slice(1)} section needs improvement`);
      }
    });

    return weaknesses;
  }

  // Get salary insights
  getSalaryInsights(role, experienceLevel = 'mid') {
    const roleData = this.salaryData[role];
    if (!roleData) return null;

    const levelData = roleData[experienceLevel] || roleData.mid;
    return {
      role,
      experienceLevel,
      salaryRange: `${levelData.min.toLocaleString()} - ${levelData.max.toLocaleString()}`,
      averageSalary: levelData.avg.toLocaleString(),
      currency: 'USD',
      marketPosition: this.getMarketPosition(levelData.avg, roleData)
    };
  }

  getMarketPosition(avgSalary, roleData) {
    const allAverages = Object.values(roleData).map(level => level.avg);
    const overallAvg = allAverages.reduce((a, b) => a + b, 0) / allAverages.length;
    
    if (avgSalary >= overallAvg * 1.1) return 'Above Market';
    if (avgSalary >= overallAvg * 0.9) return 'Market Rate';
    return 'Below Market';
  }

  // Generate comprehensive CV report
  generateCVReport(cvData, targetRole, industry) {
    const atsScore = this.calculateATSScore(cvData, targetRole);
    const qualityAnalysis = this.analyzeCVQuality(cvData, industry);
    const salaryInsights = this.getSalaryInsights(targetRole);

    return {
      summary: {
        overallScore: Math.round((atsScore.score + qualityAnalysis.overallScore) / 2),
        atsScore: atsScore.score,
        qualityScore: qualityAnalysis.overallScore,
        industryAlignment: qualityAnalysis.industryAlignment
      },
      atsAnalysis: atsScore,
      qualityAnalysis: qualityAnalysis,
      salaryInsights: salaryInsights,
      recommendations: [...atsScore.feedback, ...qualityAnalysis.recommendations],
      strengths: qualityAnalysis.strengths,
      weaknesses: qualityAnalysis.weaknesses,
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = AnalyticsService;
