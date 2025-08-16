const fs = require('fs');
const path = require('path');

class EHSFormattingService {
  constructor() {
    this.ehsStandards = {
      typography: {
        font: 'Palatino Linotype',
        photoSize: '4.7cm',
        dateFormat: 'short', // Jan, Feb, Mar
        titleCapitalization: true
      },
      contentRules: {
        removeRedundantPhrases: true,
        fixCommonMistakes: true,
        removeInappropriateFields: true,
        convertToBulletPoints: true,
        professionalTone: true
      },
      fileNaming: {
        format: 'FirstName (Candidate BH No) Client CV',
        includeBHNumber: true,
        includeClientName: true
      }
    };
    
    this.commonMistakes = {
      'Principle': 'Principal',
      'Discrete': 'Discreet',
      'Affect': 'Effect',
      'Compliment': 'Complement',
      'Stationary': 'Stationery',
      'Loose': 'Lose',
      'Advice': 'Advise',
      'Practice': 'Practise'
    };
    
    this.redundantPhrases = [
      'I am responsible for',
      'I am in charge of',
      'I am accountable for',
      'My role involves',
      'My responsibilities include',
      'I have experience in',
      'I am experienced in',
      'I am skilled in',
      'I am proficient in'
    ];
    
    this.inappropriateFields = [
      'age', 'dob', 'dateOfBirth', 'birthDate', 'birthday',
      'dependants', 'children', 'maritalStatus', 'marriage',
      'religion', 'ethnicity', 'nationality', 'race',
      'politicalAffiliation', 'politicalParty'
    ];
  }

  // Apply all EHS formatting standards to CV data
  applyEHSFormatting(cvData, options = {}) {
    const formattedCV = { ...cvData };
    
    // Apply typography standards
    formattedCV.typography = this.ehsStandards.typography;
    
    // Apply content cleanup rules
    formattedCV.personalDetails = this.cleanupPersonalDetails(formattedCV.personalDetails);
    formattedCV.profile = this.cleanupProfile(formattedCV.profile);
    formattedCV.experience = this.cleanupExperience(formattedCV.experience);
    formattedCV.education = this.cleanupEducation(formattedCV.education);
    formattedCV.keySkills = this.cleanupSkills(formattedCV.keySkills);
    formattedCV.interests = this.cleanupInterests(formattedCV.interests);
    
    // Apply professional formatting
    formattedCV = this.applyProfessionalFormatting(formattedCV);
    
    // Generate EHS-compliant filename
    formattedCV.ehsFilename = this.generateEHSFilename(formattedCV);
    
    return formattedCV;
  }

  // Clean up personal details according to EHS standards
  cleanupPersonalDetails(personalDetails) {
    const cleaned = { ...personalDetails };
    
    // Remove inappropriate fields
    Object.keys(cleaned).forEach(key => {
      if (this.inappropriateFields.includes(key.toLowerCase())) {
        delete cleaned[key];
      }
    });
    
    // Ensure job title capitalization
    if (cleaned.jobTitle) {
      cleaned.jobTitle = this.capitalizeJobTitle(cleaned.jobTitle);
    }
    
    // Format dates to 3-letter format
    if (cleaned.startDate) {
      cleaned.startDate = this.formatDateToEHS(cleaned.startDate);
    }
    if (cleaned.endDate) {
      cleaned.endDate = this.formatDateToEHS(cleaned.endDate);
    }
    
    return cleaned;
  }

  // Clean up profile text
  cleanupProfile(profile) {
    if (!profile) return profile;
    
    let cleaned = profile;
    
    // Remove redundant phrases
    this.redundantPhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // Fix common mistakes
    Object.entries(this.commonMistakes).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      cleaned = cleaned.replace(regex, correct);
    });
    
    // Convert to professional tone
    cleaned = this.convertToProfessionalTone(cleaned);
    
    return cleaned.trim();
  }

  // Clean up experience entries
  cleanupExperience(experience) {
    if (!Array.isArray(experience)) return experience;
    
    return experience.map(exp => {
      const cleaned = { ...exp };
      
      // Format dates
      if (cleaned.startDate) {
        cleaned.startDate = this.formatDateToEHS(cleaned.startDate);
      }
      if (cleaned.endDate) {
        cleaned.endDate = this.formatDateToEHS(cleaned.endDate);
      }
      
      // Clean up descriptions and achievements
      if (cleaned.description) {
        cleaned.description = cleaned.description.map(desc => 
          this.cleanupProfile(desc)
        );
      }
      
      if (cleaned.achievements) {
        cleaned.achievements = cleaned.achievements.map(achievement => 
          this.cleanupProfile(achievement)
        );
      }
      
      // Ensure company and position are properly capitalized
      if (cleaned.company) {
        cleaned.company = this.capitalizeCompanyName(cleaned.company);
      }
      if (cleaned.position) {
        cleaned.position = this.capitalizeJobTitle(cleaned.position);
      }
      
      return cleaned;
    });
  }

  // Clean up education entries
  cleanupEducation(education) {
    if (!Array.isArray(education)) return education;
    
    return education.map(edu => {
      const cleaned = { ...edu };
      
      // Format dates
      if (cleaned.startDate) {
        cleaned.startDate = this.formatDateToEHS(cleaned.startDate);
      }
      if (cleaned.endDate) {
        cleaned.endDate = this.formatDateToEHS(cleaned.endDate);
      }
      
      // Ensure proper capitalization
      if (cleaned.degree) {
        cleaned.degree = this.capitalizeDegree(cleaned.degree);
      }
      if (cleaned.institution) {
        cleaned.institution = this.capitalizeInstitutionName(cleaned.institution);
      }
      
      return cleaned;
    });
  }

  // Clean up skills
  cleanupSkills(skills) {
    if (!Array.isArray(skills)) return skills;
    
    return skills.map(skill => {
      // Remove redundant phrases
      let cleaned = skill;
      this.redundantPhrases.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        cleaned = cleaned.replace(regex, '');
      });
      
      // Ensure proper capitalization
      cleaned = this.capitalizeSkill(cleaned);
      
      return cleaned.trim();
    }).filter(skill => skill.length > 0);
  }

  // Clean up interests
  cleanupInterests(interests) {
    if (!Array.isArray(interests)) return interests;
    
    return interests.map(interest => {
      // Remove redundant phrases
      let cleaned = interest;
      this.redundantPhrases.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        cleaned = cleaned.replace(regex, '');
      });
      
      // Ensure proper capitalization
      cleaned = this.capitalizeInterest(cleaned);
      
      return cleaned.trim();
    }).filter(interest => interest.length > 0);
  }

  // Apply professional formatting
  applyProfessionalFormatting(cvData) {
    const formatted = { ...cvData };
    
    // Ensure all text follows professional standards
    if (formatted.profile) {
      formatted.profile = this.convertToProfessionalTone(formatted.profile);
    }
    
    // Convert long descriptions to bullet points
    if (formatted.experience) {
      formatted.experience = formatted.experience.map(exp => {
        if (exp.description && Array.isArray(exp.description)) {
          exp.description = exp.description.map(desc => 
            this.convertToBulletPoints(desc)
          );
        }
        return exp;
      });
    }
    
    return formatted;
  }

  // Convert date to EHS format (Jan, Feb, Mar)
  formatDateToEHS(dateString) {
    if (!dateString) return dateString;
    
    const monthMap = {
      'january': 'Jan', 'february': 'Feb', 'march': 'Mar', 'april': 'Apr',
      'may': 'May', 'june': 'Jun', 'july': 'Jul', 'august': 'Aug',
      'september': 'Sep', 'october': 'Oct', 'november': 'Nov', 'december': 'Dec',
      'jan': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'apr': 'Apr',
      'jun': 'Jun', 'jul': 'Jul', 'aug': 'Aug', 'sep': 'Sep',
      'oct': 'Oct', 'nov': 'Nov', 'dec': 'Dec'
    };
    
    // Extract month and year
    const match = dateString.match(/(\w+)\s*(\d{4})/i);
    if (match) {
      const month = monthMap[match[1].toLowerCase()] || match[1];
      const year = match[2];
      return `${month} ${year}`;
    }
    
    return dateString;
  }

  // Capitalize job titles properly
  capitalizeJobTitle(title) {
    if (!title) return title;
    
    const titleWords = title.toLowerCase().split(' ');
    const capitalized = titleWords.map((word, index) => {
      // Always capitalize first word
      if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);
      
      // Capitalize important words, lowercase prepositions/articles
      const prepositions = ['of', 'in', 'at', 'on', 'by', 'for', 'to', 'with', 'a', 'an', 'the'];
      if (prepositions.includes(word)) {
        return word;
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    return capitalized.join(' ');
  }

  // Capitalize company names
  capitalizeCompanyName(company) {
    if (!company) return company;
    
    // Handle special cases
    const specialCases = {
      'ibm': 'IBM',
      'microsoft': 'Microsoft',
      'google': 'Google',
      'amazon': 'Amazon',
      'apple': 'Apple',
      'facebook': 'Facebook',
      'netflix': 'Netflix',
      'deloitte': 'Deloitte',
      'pwc': 'PwC',
      'ey': 'EY',
      'kpmg': 'KPMG'
    };
    
    const lowerCompany = company.toLowerCase();
    if (specialCases[lowerCompany]) {
      return specialCases[lowerCompany];
    }
    
    // Standard capitalization
    return company.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Capitalize degree names
  capitalizeDegree(degree) {
    if (!degree) return degree;
    
    const degreeMap = {
      'b.e': 'B.E.',
      'b.tech': 'B.Tech',
      'bachelor': 'Bachelor',
      'm.e': 'M.E.',
      'm.tech': 'M.Tech',
      'master': 'Master',
      'phd': 'PhD',
      'doctorate': 'Doctorate'
    };
    
    const lowerDegree = degree.toLowerCase();
    if (degreeMap[lowerDegree]) {
      return degreeMap[lowerDegree];
    }
    
    return degree;
  }

  // Capitalize institution names
  capitalizeInstitutionName(institution) {
    if (!institution) return institution;
    
    return institution.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Capitalize skills
  capitalizeSkill(skill) {
    if (!skill) return skill;
    
    // Handle technology names
    const techMap = {
      'javascript': 'JavaScript',
      'node.js': 'Node.js',
      'react': 'React',
      'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL',
      'aws': 'AWS',
      'docker': 'Docker',
      'git': 'Git',
      'html': 'HTML',
      'css': 'CSS',
      'api': 'API',
      'rest': 'REST',
      'websocket': 'WebSocket',
      'ldap': 'LDAP',
      'nlp': 'NLP',
      'ai': 'AI',
      'machine learning': 'Machine Learning'
    };
    
    const lowerSkill = skill.toLowerCase();
    if (techMap[lowerSkill]) {
      return techMap[lowerSkill];
    }
    
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  }

  // Capitalize interests
  capitalizeInterest(interest) {
    if (!interest) return interest;
    
    return interest.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Convert to professional tone
  convertToProfessionalTone(text) {
    if (!text) return text;
    
    let professional = text;
    
    // Remove personal pronouns
    professional = professional.replace(/\bI\b/gi, '');
    professional = professional.replace(/\bmy\b/gi, '');
    professional = professional.replace(/\bme\b/gi, '');
    
    // Start sentences with action verbs
    professional = professional.replace(/^[a-z]/, (match) => match.toUpperCase());
    
    // Ensure proper sentence structure
    if (!professional.endsWith('.') && !professional.endsWith('!') && !professional.endsWith('?')) {
      professional += '.';
    }
    
    return professional.trim();
  }

  // Convert paragraphs to bullet points
  convertToBulletPoints(text) {
    if (!text) return text;
    
    // If text is already short, return as is
    if (text.length < 100) return text;
    
    // Split into sentences and convert to bullet points
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length <= 1) return text;
    
    return sentences.map(sentence => sentence.trim()).filter(sentence => sentence.length > 0);
  }

  // Generate EHS-compliant filename
  generateEHSFilename(cvData) {
    const { personalDetails } = cvData;
    const firstName = personalDetails.firstName || 'Candidate';
    const bhNumber = personalDetails.bhNumber || 'BH001';
    const clientName = personalDetails.clientName || 'Client';
    
    return `${firstName} (${bhNumber}) ${clientName} CV`;
  }

  // Validate EHS compliance
  validateEHSCompliance(cvData) {
    const issues = [];
    
    // Check typography
    if (cvData.typography?.font !== 'Palatino Linotype') {
      issues.push('Font should be Palatino Linotype');
    }
    
    // Check date format
    const dateRegex = /^[A-Z][a-z]{2}\s\d{4}$/;
    if (cvData.experience) {
      cvData.experience.forEach(exp => {
        if (exp.startDate && !dateRegex.test(exp.startDate)) {
          issues.push(`Date format should be 'Jan 2020' not '${exp.startDate}'`);
        }
      });
    }
    
    // Check for inappropriate fields
    const personalFields = Object.keys(cvData.personalDetails || {});
    personalFields.forEach(field => {
      if (this.inappropriateFields.includes(field.toLowerCase())) {
        issues.push(`Remove inappropriate field: ${field}`);
      }
    });
    
    // Check job title capitalization
    if (cvData.personalDetails?.jobTitle) {
      const title = cvData.personalDetails.jobTitle;
      if (title !== this.capitalizeJobTitle(title)) {
        issues.push('Job title should be properly capitalized');
      }
    }
    
    return {
      compliant: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 10))
    };
  }
}

module.exports = EHSFormattingService;
