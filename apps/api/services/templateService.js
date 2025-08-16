const fs = require('fs');
const path = require('path');

class TemplateService {
  constructor() {
    this.templates = this.loadTemplates();
    this.industries = ['Technology', 'Finance', 'Healthcare', 'Creative', 'Education', 'Engineering', 'Marketing', 'Sales'];
  }

  loadTemplates() {
    return {
      technology: {
        name: 'Tech Professional',
        description: 'Modern, clean template for technology professionals',
        sections: ['header', 'profile', 'experience', 'education', 'skills', 'projects', 'certifications'],
        styling: {
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          fontFamily: 'Inter, system-ui, sans-serif',
          headerStyle: 'gradient',
          skillStyle: 'tags',
          projectStyle: 'cards'
        },
        rules: {
          emphasizeSkills: true,
          showProjects: true,
          includeGitHub: true,
          highlightTechnologies: true
        }
      },
      finance: {
        name: 'Finance Executive',
        description: 'Professional template for finance and business roles',
        sections: ['header', 'executive-summary', 'experience', 'education', 'skills', 'achievements', 'certifications'],
        styling: {
          primaryColor: '#059669',
          secondaryColor: '#374151',
          fontFamily: 'Georgia, serif',
          headerStyle: 'classic',
          skillStyle: 'categories',
          projectStyle: 'timeline'
        },
        rules: {
          emphasizeMetrics: true,
          showQuantifiableResults: true,
          includeFinancialTerms: true,
          professionalTone: true
        }
      },
      healthcare: {
        name: 'Healthcare Professional',
        description: 'Clean, trustworthy template for healthcare roles',
        sections: ['header', 'summary', 'experience', 'education', 'licenses', 'skills', 'certifications'],
        styling: {
          primaryColor: '#dc2626',
          secondaryColor: '#6b7280',
          fontFamily: 'Arial, sans-serif',
          headerStyle: 'medical',
          skillStyle: 'list',
          projectStyle: 'simple'
        },
        rules: {
          emphasizeLicenses: true,
          showContinuingEducation: true,
          includePatientCare: true,
          professionalCredentials: true
        }
      },
      creative: {
        name: 'Creative Portfolio',
        description: 'Visual, creative template for design and creative roles',
        sections: ['header', 'portfolio', 'experience', 'education', 'skills', 'interests', 'social'],
        styling: {
          primaryColor: '#7c3aed',
          secondaryColor: '#f59e0b',
          fontFamily: 'Poppins, sans-serif',
          headerStyle: 'creative',
          skillStyle: 'visual',
          projectStyle: 'gallery'
        },
        rules: {
          emphasizePortfolio: true,
          showVisualWork: true,
          includeSocialMedia: true,
          creativeLayout: true
        }
      },
      education: {
        name: 'Academic Professional',
        description: 'Scholarly template for education and research roles',
        sections: ['header', 'research-interests', 'experience', 'education', 'publications', 'grants', 'teaching'],
        styling: {
          primaryColor: '#1e40af',
          secondaryColor: '#475569',
          fontFamily: 'Times New Roman, serif',
          headerStyle: 'academic',
          skillStyle: 'research',
          projectStyle: 'publications'
        },
        rules: {
          emphasizeResearch: true,
          showPublications: true,
          includeGrants: true,
          academicCredentials: true
        }
      }
    };
  }

  getTemplate(industry) {
    const normalizedIndustry = industry.toLowerCase();
    return this.templates[normalizedIndustry] || this.templates.technology;
  }

  getAllTemplates() {
    return Object.keys(this.templates).map(key => ({
      id: key,
      ...this.templates[key]
    }));
  }

  getIndustries() {
    return this.industries;
  }

  // Generate CV content based on template
  generateCVContent(cvData, templateId) {
    const template = this.getTemplate(templateId);
    const content = {
      template: template,
      sections: {},
      metadata: {
        generatedAt: new Date().toISOString(),
        template: template.name,
        industry: templateId
      }
    };

    // Generate each section based on template rules
    template.sections.forEach(section => {
      content.sections[section] = this.generateSection(section, cvData, template);
    });

    return content;
  }

  generateSection(sectionName, cvData, template) {
    switch (sectionName) {
      case 'header':
        return this.generateHeader(cvData, template);
      case 'profile':
      case 'summary':
      case 'executive-summary':
        return this.generateProfile(cvData, template);
      case 'experience':
        return this.generateExperience(cvData, template);
      case 'education':
        return this.generateEducation(cvData, template);
      case 'skills':
        return this.generateSkills(cvData, template);
      case 'projects':
        return this.generateProjects(cvData, template);
      case 'certifications':
        return this.generateCertifications(cvData, template);
      case 'achievements':
        return this.generateAchievements(cvData, template);
      case 'licenses':
        return this.generateLicenses(cvData, template);
      case 'publications':
        return this.generatePublications(cvData, template);
      case 'grants':
        return this.generateGrants(cvData, template);
      case 'teaching':
        return this.generateTeaching(cvData, template);
      case 'interests':
        return this.generateInterests(cvData, template);
      case 'social':
        return this.generateSocial(cvData, template);
      case 'portfolio':
        return this.generatePortfolio(cvData, template);
      case 'research-interests':
        return this.generateResearchInterests(cvData, template);
      default:
        return null;
    }
  }

  generateHeader(cvData, template) {
    const { personalDetails } = cvData;
    return {
      name: `${personalDetails.firstName} ${personalDetails.lastName}`,
      title: personalDetails.jobTitle,
      contact: {
        email: personalDetails.email,
        phone: personalDetails.phone,
        address: personalDetails.address
      },
      photo: personalDetails.photo,
      style: template.styling.headerStyle
    };
  }

  generateProfile(cvData, template) {
    return {
      content: cvData.profile,
      style: template.styling.fontFamily,
      emphasis: template.rules.professionalTone || false
    };
  }

  generateExperience(cvData, template) {
    return cvData.experience.map(exp => ({
      ...exp,
      style: template.styling.projectStyle,
      emphasizeMetrics: template.rules.emphasizeMetrics || false,
      showQuantifiableResults: template.rules.showQuantifiableResults || false
    }));
  }

  generateEducation(cvData, template) {
    return cvData.education.map(edu => ({
      ...edu,
      style: 'academic',
      showContinuingEducation: template.rules.showContinuingEducation || false
    }));
  }

  generateSkills(cvData, template) {
    const skills = cvData.keySkills || [];
    return {
      skills: skills,
      style: template.styling.skillStyle,
      emphasizeSkills: template.rules.emphasizeSkills || false,
      highlightTechnologies: template.rules.highlightTechnologies || false
    };
  }

  generateProjects(cvData, template) {
    const projects = cvData.projects || [];
    return {
      projects: projects,
      style: template.styling.projectStyle,
      emphasizePortfolio: template.rules.emphasizePortfolio || false,
      showVisualWork: template.rules.showVisualWork || false
    };
  }

  generateCertifications(cvData, template) {
    // Extract certifications from CV data or generate based on skills
    const certifications = [];
    if (cvData.keySkills) {
      if (cvData.keySkills.includes('AWS')) certifications.push('AWS Certified Solutions Architect');
      if (cvData.keySkills.includes('React')) certifications.push('React Developer Certification');
      if (cvData.keySkills.includes('Python')) certifications.push('Python Programming Certification');
    }
    return certifications;
  }

  generateAchievements(cvData, template) {
    const achievements = [];
    cvData.experience?.forEach(exp => {
      if (exp.achievements) {
        achievements.push(...exp.achievements);
      }
    });
    return achievements;
  }

  generateLicenses(cvData, template) {
    // Generate licenses based on industry
    const licenses = [];
    if (template.rules.emphasizeLicenses) {
      licenses.push('Professional License', 'State Certification');
    }
    return licenses;
  }

  generatePublications(cvData, template) {
    // Generate sample publications for academic template
    if (template.rules.emphasizeResearch) {
      return [
        'Research Paper on AI in Healthcare',
        'Conference Presentation on Machine Learning',
        'Journal Article on Data Science'
      ];
    }
    return [];
  }

  generateGrants(cvData, template) {
    if (template.rules.includeGrants) {
      return [
        'Research Grant - $50,000',
        'Innovation Fund - $25,000'
      ];
    }
    return [];
  }

  generateTeaching(cvData, template) {
    if (template.rules.academicCredentials) {
      return [
        'Advanced Programming Course',
        'Data Structures and Algorithms',
        'Software Engineering Principles'
      ];
    }
    return [];
  }

  generateInterests(cvData, template) {
    return cvData.interests || ['Technology', 'Innovation', 'Problem Solving'];
  }

  generateSocial(cvData, template) {
    if (template.rules.includeSocialMedia) {
      return {
        linkedin: 'linkedin.com/in/profile',
        github: 'github.com/username',
        portfolio: 'portfolio.com'
      };
    }
    return {};
  }

  generatePortfolio(cvData, template) {
    if (template.rules.emphasizePortfolio) {
      return {
        projects: cvData.projects || [],
        style: 'gallery',
        showcase: true
      };
    }
    return null;
  }

  generateResearchInterests(cvData, template) {
    if (template.rules.emphasizeResearch) {
      return [
        'Artificial Intelligence',
        'Machine Learning',
        'Data Science',
        'Software Engineering'
      ];
    }
    return [];
  }

  // Get template preview data
  getTemplatePreview(templateId) {
    const template = this.getTemplate(templateId);
    const sampleData = this.getSampleData();
    
    return {
      template: template,
      preview: this.generateCVContent(sampleData, templateId)
    };
  }

  getSampleData() {
    return {
      personalDetails: {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        address: 'San Francisco, CA'
      },
      profile: 'Experienced software engineer with expertise in full-stack development and cloud technologies.',
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: 'Jan 2022',
          endDate: 'Present',
          description: ['Led development of scalable web applications'],
          achievements: ['Improved performance by 40%']
        }
      ],
      education: [
        {
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2018',
          endDate: '2022',
          grade: 'GPA: 3.8/4.0'
        }
      ],
      keySkills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
      interests: ['Technology', 'Innovation', 'Problem Solving'],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution',
          technologies: ['React', 'Node.js', 'MongoDB'],
          achievements: ['10,000+ users']
        }
      ]
    };
  }
}

module.exports = TemplateService;
