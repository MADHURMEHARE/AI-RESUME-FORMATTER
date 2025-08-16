const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;

class ExportService {
  constructor() {
    // EHS Typography Standards
    this.ehsFonts = {
      primary: 'Palatino Linotype',
      secondary: 'Palatino Linotype',
      modern: 'Palatino Linotype'
    };
    
    // EHS Photo Standards
    this.ehsPhotoSize = {
      width: '4.7cm',
      height: '4.7cm',
      maxWidth: 133, // 4.7cm in points (72 points = 1 inch, 1 inch = 2.54 cm)
      maxHeight: 133
    };
    
    // Fallback fonts if Palatino Linotype is not available
    this.fallbackFonts = {
      primary: 'Helvetica',
      secondary: 'Times-Roman',
      modern: 'Arial'
    };
  }

  // Generate PDF with EHS professional styling
  async generatePDF(cvData, template, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        this.renderPDFContent(doc, cvData, template, options);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  renderPDFContent(doc, cvData, template, options) {
    const { styling } = template;
    
    // Header with EHS standards
    this.renderPDFHeader(doc, cvData, styling, options);
    
    // Profile
    if (cvData.profile) {
      this.renderPDFProfile(doc, cvData.profile, styling);
    }
    
    // Experience
    if (cvData.experience && cvData.experience.length > 0) {
      this.renderPDFExperience(doc, cvData.experience, styling);
    }
    
    // Education
    if (cvData.education && cvData.education.length > 0) {
      this.renderPDFEducation(doc, cvData.education, styling);
    }
    
    // Skills
    if (cvData.keySkills && cvData.keySkills.length > 0) {
      this.renderPDFSkills(doc, cvData.keySkills, styling);
    }
    
    // Projects
    if (cvData.projects && cvData.projects.length > 0) {
      this.renderPDFProjects(doc, cvData.projects, styling);
    }
    
    // Interests
    if (cvData.interests && cvData.interests.length > 0) {
      this.renderPDFInterests(doc, cvData.interests, styling);
    }
  }

  renderPDFHeader(doc, cvData, styling, options = {}) {
    const { personalDetails } = cvData;
    
    // Check if we have a photo to display
    const hasPhoto = options.includePhoto && personalDetails.photo;
    
    if (hasPhoto) {
      // EHS Photo Layout: 4.7cm x 4.7cm, right-aligned
      this.renderEHSPhoto(doc, personalDetails.photo, options);
      
      // Text content on the left side
      const textStartX = 50;
      const textEndX = 400; // Leave space for photo on right
      
      // Name with EHS typography
      doc.font(this.getEHSFont('primary'))
         .fontSize(24)
         .fillColor(styling.primaryColor || '#2563eb')
         .text(`${personalDetails.firstName} ${personalDetails.lastName}`, textStartX, 50, { width: textEndX - textStartX });
      
      // Job Title with proper capitalization
      doc.fontSize(16)
         .fillColor(styling.secondaryColor || '#64748b')
         .text(personalDetails.jobTitle || 'Professional Developer', textStartX, 80, { width: textEndX - textStartX });
      
      // Contact Info
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${personalDetails.email || ''} | ${personalDetails.phone || ''}`, textStartX, 110, { width: textEndX - textStartX });
      
      if (personalDetails.address) {
        doc.text(personalDetails.address, textStartX, 130, { width: textEndX - textStartX });
      }
    } else {
      // No photo - centered layout
      // Name with EHS typography
      doc.font(this.getEHSFont('primary'))
         .fontSize(24)
         .fillColor(styling.primaryColor || '#2563eb')
         .text(`${personalDetails.firstName} ${personalDetails.lastName}`, { align: 'center' });
      
      // Job Title with proper capitalization
      doc.fontSize(16)
         .fillColor(styling.secondaryColor || '#64748b')
         .text(personalDetails.jobTitle || 'Professional Developer', { align: 'center' });
      
      // Contact Info
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${personalDetails.email || ''} | ${personalDetails.phone || ''}`, { align: 'center' });
      
      if (personalDetails.address) {
        doc.text(personalDetails.address, { align: 'center' });
      }
    }
  }

  // Render EHS-compliant photo with 4.7cm sizing and landscape-to-portrait conversion
  renderEHSPhoto(doc, photoData, options = {}) {
    try {
      // EHS Photo positioning: Right side, 4.7cm x 4.7cm
      const photoX = 450; // Right side of header
      const photoY = 50;
      const photoWidth = this.ehsPhotoSize.maxWidth;
      const photoHeight = this.ehsPhotoSize.maxHeight;
      
      // Handle different photo formats
      if (photoData.buffer) {
        // Convert landscape to portrait if needed
        const image = doc.openImage(photoData.buffer);
        const { width: imgWidth, height: imgHeight } = image;
        
        // Calculate aspect ratio and fit within 4.7cm x 4.7cm
        const aspectRatio = imgWidth / imgHeight;
        let finalWidth = photoWidth;
        let finalHeight = photoHeight;
        
        if (aspectRatio > 1) {
          // Landscape image - fit height and center horizontally
          finalHeight = photoHeight;
          finalWidth = photoHeight * aspectRatio;
          if (finalWidth > photoWidth) {
            finalWidth = photoWidth;
            finalHeight = photoWidth / aspectRatio;
          }
        } else {
          // Portrait image - fit width and center vertically
          finalWidth = photoWidth;
          finalHeight = photoWidth / aspectRatio;
          if (finalHeight > photoHeight) {
            finalHeight = photoHeight;
            finalWidth = photoHeight * aspectRatio;
          }
        }
        
        // Center the photo within the 4.7cm x 4.7cm area
        const offsetX = photoX + (photoWidth - finalWidth) / 2;
        const offsetY = photoY + (photoHeight - finalHeight) / 2;
        
        // Add photo border for professional look
        doc.rect(photoX, photoY, photoWidth, photoHeight)
           .strokeColor('#d1d5db')
           .lineWidth(1)
           .stroke();
        
        // Place the photo
        doc.image(image, offsetX, offsetY, { width: finalWidth, height: finalHeight });
        
        // Add EHS photo label
        doc.font(this.getEHSFont('secondary'))
           .fontSize(8)
           .fillColor('#6b7280')
           .text('Professional Photo', photoX, photoY + photoHeight + 5, { width: photoWidth, align: 'center' });
      }
    } catch (error) {
      console.warn('Photo rendering failed:', error.message);
      // Fallback: render photo placeholder
      this.renderPhotoPlaceholder(doc, photoX, photoY);
    }
  }

  // Render photo placeholder if photo loading fails
  renderPhotoPlaceholder(doc, x, y) {
    const size = this.ehsPhotoSize.maxWidth;
    
    // Placeholder rectangle
    doc.rect(x, y, size, size)
       .fillColor('#f3f4f6')
       .fill()
       .strokeColor('#d1d5db')
       .lineWidth(1)
       .stroke();
    
    // Placeholder text
    doc.font(this.getEHSFont('secondary'))
       .fontSize(10)
       .fillColor('#9ca3af')
       .text('Photo', x, y + size/2 - 5, { width: size, align: 'center' });
  }

  // Get EHS font with fallback
  getEHSFont(fontType) {
    try {
      // Try to use EHS standard font
      return this.ehsFonts[fontType] || this.ehsFonts.primary;
    } catch (error) {
      // Fallback to standard fonts
      return this.fallbackFonts[fontType] || this.fallbackFonts.primary;
    }
  }

  renderPDFProfile(doc, profile, styling) {
    doc.moveDown(0.5);
    
    // Section header
    doc.font(this.getEHSFont('primary'))
       .fontSize(16)
       .fillColor(styling.primaryColor || '#2563eb')
       .text('Professional Profile', { underline: true });
    
    // Profile content
    doc.font(this.getEHSFont('secondary'))
       .fontSize(11)
       .fillColor('#374151')
       .text(profile, { align: 'justify' });
  }

  renderPDFExperience(doc, experience, styling) {
    doc.moveDown(1);
    
    // Section header
    doc.font(this.getEHSFont('primary'))
       .fontSize(16)
       .fillColor(styling.primaryColor || '#2563eb')
       .text('Professional Experience', { underline: true });
    
    experience.forEach((exp, index) => {
      doc.moveDown(0.5);
      
      // Company and position
      doc.font(this.getEHSFont('primary'))
         .fontSize(12)
         .fillColor('#1f2937')
         .text(`${exp.company}`, { continued: true })
         .fontSize(11)
         .fillColor('#6b7280')
         .text(` - ${exp.position}`);
      
      // Dates (EHS format: Jan 2020)
      doc.font(this.getEHSFont('secondary'))
         .fontSize(10)
         .fillColor('#9ca3af')
         .text(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`);
      
      // Description and achievements
      if (exp.description && Array.isArray(exp.description)) {
        exp.description.forEach(desc => {
          doc.font(this.getEHSFont('secondary'))
             .fontSize(10)
             .fillColor('#374151')
             .text(`• ${desc}`, { indent: 20 });
        });
      }
      
      if (exp.achievements && Array.isArray(exp.achievements)) {
        exp.achievements.forEach(achievement => {
          doc.font(this.getEHSFont('secondary'))
             .fontSize(10)
             .fillColor('#059669')
             .text(`✓ ${achievement}`, { indent: 20 });
        });
      }
    });
  }

  renderPDFEducation(doc, education, styling) {
    doc.moveDown(1);
    
    // Section header
    doc.font(this.getEHSFont('primary'))
       .fontSize(16)
       .fillColor(styling.primaryColor || '#2563eb')
       .text('Education', { underline: true });
    
    education.forEach((edu, index) => {
      doc.moveDown(0.5);
      
      // Degree and institution
      doc.font(this.getEHSFont('primary'))
         .fontSize(12)
         .fillColor('#1f2937')
         .text(`${edu.degree}`, { continued: true })
         .fontSize(11)
         .fillColor('#6b7280')
         .text(` - ${edu.institution}`);
      
      // Dates and grade
      doc.font(this.getEHSFont('secondary'))
         .fontSize(10)
         .fillColor('#9ca3af')
         .text(`${edu.startDate || ''} - ${edu.endDate || ''} ${edu.grade ? `| ${edu.grade}` : ''}`);
    });
  }

  renderPDFSkills(doc, skills, styling) {
    doc.moveDown(1);
    
    // Section header
    doc.font(this.getEHSFont('primary'))
       .fontSize(16)
       .fillColor(styling.primaryColor || '#2563eb')
       .text('Key Skills', { underline: true });
    
    // Skills in bullet points
    const skillsPerRow = 3;
    for (let i = 0; i < skills.length; i += skillsPerRow) {
      const rowSkills = skills.slice(i, i + skillsPerRow);
      const skillText = rowSkills.map(skill => `• ${skill}`).join('    ');
      
      doc.font(this.getEHSFont('secondary'))
         .fontSize(10)
         .fillColor('#374151')
         .text(skillText);
    }
  }

  renderPDFProjects(doc, projects, styling) {
    if (!projects || projects.length === 0) return;
    
    doc.moveDown(1);
    
    // Section header
    doc.font(this.getEHSFont('primary'))
       .fontSize(16)
       .fillColor(styling.primaryColor || '#2563eb')
       .text('Key Projects', { underline: true });
    
    projects.forEach((project, index) => {
      doc.moveDown(0.5);
      
      // Project name
      doc.font(this.getEHSFont('primary'))
         .fontSize(12)
         .fillColor('#1f2937')
         .text(project.name);
      
      // Project description
      if (project.description) {
        doc.font(this.getEHSFont('secondary'))
           .fontSize(10)
           .fillColor('#374151')
           .text(`• ${project.description}`, { indent: 20 });
      }
      
      // Technologies used
      if (project.technologies) {
        doc.font(this.getEHSFont('secondary'))
           .fontSize(9)
           .fillColor('#6b7280')
           .text(`Technologies: ${project.technologies.join(', ')}`, { indent: 20 });
      }
    });
  }

  renderPDFInterests(doc, interests, styling) {
    if (!interests || interests.length === 0) return;
    
    doc.moveDown(1);
    
    // Section header
    doc.font(this.getEHSFont('primary'))
       .fontSize(16)
       .fillColor(styling.primaryColor || '#2563eb')
       .text('Professional Interests', { underline: true });
    
    // Interests in bullet points
    interests.forEach(interest => {
      doc.font(this.getEHSFont('secondary'))
         .fontSize(10)
         .fillColor('#374151')
         .text(`• ${interest}`, { indent: 20 });
    });
  }

  // Generate DOCX with professional styling
  async generateDOCX(cvData, template, options = {}) {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: this.generateDOCXContent(cvData, template, options)
        }]
      });

      return await Packer.toBuffer(doc);
    } catch (error) {
      throw new Error(`DOCX generation failed: ${error.message}`);
    }
  }

  generateDOCXContent(cvData, template, options) {
    const children = [];
    const { styling } = template;
    
    // Header
    children.push(...this.generateDOCXHeader(cvData, styling));
    
    // Profile
    if (cvData.profile) {
      children.push(...this.generateDOCXProfile(cvData.profile, styling));
    }
    
    // Experience
    if (cvData.experience && cvData.experience.length > 0) {
      children.push(...this.generateDOCXExperience(cvData.experience, styling));
    }
    
    // Education
    if (cvData.education && cvData.education.length > 0) {
      children.push(...this.generateDOCXEducation(cvData.education, styling));
    }
    
    // Skills
    if (cvData.keySkills && cvData.keySkills.length > 0) {
      children.push(...this.generateDOCXSkills(cvData.keySkills, styling));
    }
    
    // Projects
    if (cvData.projects && cvData.projects.length > 0) {
      children.push(...this.generateDOCXProjects(cvData.projects, styling));
    }
    
    // Interests
    if (cvData.interests && cvData.interests.length > 0) {
      children.push(...this.generateDOCXInterests(cvData.interests, styling));
    }
    
    return children;
  }

  generateDOCXHeader(cvData, styling) {
    const { personalDetails } = cvData;
    const children = [];
    
    // Name
    children.push(new Paragraph({
      text: `${personalDetails.firstName} ${personalDetails.lastName}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${personalDetails.firstName} ${personalDetails.lastName}`,
          size: 32,
          color: styling.primaryColor || '2563eb'
        })
      ]
    }));
    
    // Job Title
    children.push(new Paragraph({
      text: personalDetails.jobTitle,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personalDetails.jobTitle,
          size: 20,
          color: styling.secondaryColor || '64748b'
        })
      ]
    }));
    
    // Contact Info
    const contactText = `${personalDetails.email} | ${personalDetails.phone}`;
    children.push(new Paragraph({
      text: contactText,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: contactText,
          size: 16,
          color: '374151'
        })
      ]
    }));
    
    if (personalDetails.address) {
      children.push(new Paragraph({
        text: personalDetails.address,
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: personalDetails.address,
            size: 16,
            color: '374151'
          })
        ]
      }));
    }
    
    return children;
  }

  generateDOCXProfile(profile, styling) {
    return [
      new Paragraph({
        text: 'Professional Profile',
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'Professional Profile',
            size: 18,
            color: '1f2937'
          })
        ]
      }),
      new Paragraph({
        text: profile,
        children: [
          new TextRun({
            text: profile,
            size: 14
          })
        ]
      })
    ];
  }

  generateDOCXExperience(experience, styling) {
    const children = [
      new Paragraph({
        text: 'Professional Experience',
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'Professional Experience',
            size: 18,
            color: '1f2937'
          })
        ]
      })
    ];
    
    experience.forEach(exp => {
      // Position and Company
      children.push(new Paragraph({
        text: `${exp.position} at ${exp.company}`,
        children: [
          new TextRun({
            text: `${exp.position} at ${exp.company}`,
            size: 16,
            color: styling.primaryColor || '2563eb',
            bold: true
          })
        ]
      }));
      
      // Dates
      children.push(new Paragraph({
        text: `${exp.startDate} - ${exp.endDate}`,
        children: [
          new TextRun({
            text: `${exp.startDate} - ${exp.endDate}`,
            size: 12,
            color: '6b7280'
          })
        ]
      }));
      
      // Description
      if (exp.description) {
        exp.description.forEach(desc => {
          children.push(new Paragraph({
            text: `• ${desc}`,
            children: [
              new TextRun({
                text: `• ${desc}`,
                size: 12
              })
            ]
          }));
        });
      }
      
      // Achievements
      if (exp.achievements) {
        exp.achievements.forEach(achievement => {
          children.push(new Paragraph({
            text: `✓ ${achievement}`,
            children: [
              new TextRun({
                text: `✓ ${achievement}`,
                size: 12,
                color: '059669'
              })
            ]
          }));
        });
      }
    });
    
    return children;
  }

  generateDOCXEducation(education, styling) {
    const children = [
      new Paragraph({
        text: 'Education',
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'Education',
            size: 18,
            color: '1f2937'
          })
        ]
      })
    ];
    
    education.forEach(edu => {
      children.push(new Paragraph({
        text: edu.degree,
        children: [
          new TextRun({
            text: edu.degree,
            size: 16,
            color: styling.primaryColor || '2563eb',
            bold: true
          })
        ]
      }));
      
      children.push(new Paragraph({
        text: edu.institution,
        children: [
          new TextRun({
            text: edu.institution,
            size: 12,
            color: '6b7280'
          })
        ]
      }));
      
      if (edu.grade) {
        children.push(new Paragraph({
          text: `Grade: ${edu.grade}`,
          children: [
            new TextRun({
              text: `Grade: ${edu.grade}`,
              size: 12
            })
          ]
        }));
      }
    });
    
    return children;
  }

  generateDOCXSkills(skills, styling) {
    const children = [
      new Paragraph({
        text: 'Key Skills',
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'Key Skills',
            size: 18,
            color: '1f2937'
          })
        ]
      })
    ];
    
    const skillsPerLine = 3;
    for (let i = 0; i < skills.length; i += skillsPerLine) {
      const lineSkills = skills.slice(i, i + skillsPerLine);
      const skillText = lineSkills.join(' • ');
      
      children.push(new Paragraph({
        text: skillText,
        children: [
          new TextRun({
            text: skillText,
            size: 12
          })
        ]
      }));
    }
    
    return children;
  }

  generateDOCXProjects(projects, styling) {
    const children = [
      new Paragraph({
        text: 'Projects',
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'Projects',
            size: 18,
            color: '1f2937'
          })
        ]
      })
    ];
    
    projects.forEach(project => {
      children.push(new Paragraph({
        text: project.name,
        children: [
          new TextRun({
            text: project.name,
            size: 16,
            color: styling.primaryColor || '2563eb',
            bold: true
          })
        ]
      }));
      
      children.push(new Paragraph({
        text: project.description,
        children: [
          new TextRun({
            text: project.description,
            size: 12
          })
        ]
      }));
      
      if (project.technologies) {
        children.push(new Paragraph({
          text: `Technologies: ${project.technologies.join(', ')}`,
          children: [
            new TextRun({
              text: `Technologies: ${project.technologies.join(', ')}`,
              size: 12,
              color: '6b7280'
            })
          ]
        }));
      }
    });
    
    return children;
  }

  generateDOCXInterests(interests, styling) {
    return [
      new Paragraph({
        text: 'Interests',
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'Interests',
            size: 18,
            color: '1f2937'
          })
        ]
      }),
      new Paragraph({
        text: interests.join(' • '),
        children: [
          new TextRun({
            text: interests.join(' • '),
            size: 12
          })
        ]
      })
    ];
  }

  // Generate HTML with responsive design
  async generateHTML(cvData, template, options = {}) {
    const { styling } = template;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${cvData.personalDetails.firstName} ${cvData.personalDetails.lastName} - CV</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: ${styling.fontFamily || 'Arial, sans-serif'}; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, ${styling.primaryColor || '#2563eb'}, ${styling.secondaryColor || '#64748b'}); color: white; border-radius: 10px; margin-bottom: 30px; }
          .header h1 { font-size: 2.5em; margin-bottom: 10px; }
          .header h2 { font-size: 1.5em; margin-bottom: 20px; opacity: 0.9; }
          .contact-info { font-size: 1.1em; }
          .section { margin-bottom: 30px; }
          .section h3 { color: ${styling.primaryColor || '#2563eb'}; border-bottom: 2px solid ${styling.primaryColor || '#2563eb'}; padding-bottom: 5px; margin-bottom: 15px; }
          .experience-item { margin-bottom: 20px; }
          .experience-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
          .company { font-weight: bold; color: ${styling.primaryColor || '#2563eb'}; }
          .dates { color: #666; font-style: italic; }
          .skills { display: flex; flex-wrap: wrap; gap: 10px; }
          .skill-tag { background: ${styling.primaryColor || '#2563eb'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9em; }
          .project-card { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${styling.primaryColor || '#2563eb'}; }
          @media (max-width: 600px) { .container { padding: 10px; } .header h1 { font-size: 2em; } .experience-header { flex-direction: column; align-items: flex-start; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${cvData.personalDetails.firstName} ${cvData.personalDetails.lastName}</h1>
            <h2>${cvData.personalDetails.jobTitle}</h2>
            <div class="contact-info">
              ${cvData.personalDetails.email} | ${cvData.personalDetails.phone}
              ${cvData.personalDetails.address ? `<br>${cvData.personalDetails.address}` : ''}
            </div>
          </div>
          
          ${cvData.profile ? `
          <div class="section">
            <h3>Professional Profile</h3>
            <p>${cvData.profile}</p>
          </div>
          ` : ''}
          
          ${cvData.experience && cvData.experience.length > 0 ? `
          <div class="section">
            <h3>Professional Experience</h3>
            ${cvData.experience.map(exp => `
              <div class="experience-item">
                <div class="experience-header">
                  <span class="company">${exp.position} at ${exp.company}</span>
                  <span class="dates">${exp.startDate} - ${exp.endDate}</span>
                </div>
                ${exp.description ? exp.description.map(desc => `<p>• ${desc}</p>`).join('') : ''}
                ${exp.achievements ? exp.achievements.map(achievement => `<p style="color: #059669;">✓ ${achievement}</p>`).join('') : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${cvData.education && cvData.education.length > 0 ? `
          <div class="section">
            <h3>Education</h3>
            ${cvData.education.map(edu => `
              <div class="experience-item">
                <div class="company">${edu.degree}</div>
                <div class="dates">${edu.institution}</div>
                ${edu.grade ? `<p>Grade: ${edu.grade}</p>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${cvData.keySkills && cvData.keySkills.length > 0 ? `
          <div class="section">
            <h3>Key Skills</h3>
            <div class="skills">
              ${cvData.keySkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
          ` : ''}
          
          ${cvData.projects && cvData.projects.length > 0 ? `
          <div class="section">
            <h3>Projects</h3>
            ${cvData.projects.map(project => `
              <div class="project-card">
                <div class="company">${project.name}</div>
                <p>${project.description}</p>
                ${project.technologies ? `<p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${cvData.interests && cvData.interests.length > 0 ? `
          <div class="section">
            <h3>Interests</h3>
            <p>${cvData.interests.join(' • ')}</p>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
    
    return Buffer.from(html, 'utf8');
  }

  // Generate LaTeX for academic/research CVs
  async generateLaTeX(cvData, template, options = {}) {
    const { styling } = template;
    
    const latex = `
      \\documentclass[11pt,a4paper]{article}
      \\usepackage[utf8]{inputenc}
      \\usepackage[T1]{fontenc}
      \\usepackage{geometry}
      \\usepackage{enumitem}
      \\usepackage{hyperref}
      \\usepackage{xcolor}
      
      \\geometry{margin=1in}
      \\hypersetup{colorlinks=true, linkcolor=${styling.primaryColor || 'blue'}, urlcolor=${styling.primaryColor || 'blue'}}
      
      \\begin{document}
      
      % Header
      \\begin{center}
        {\\Large \\textbf{${cvData.personalDetails.firstName} ${cvData.personalDetails.lastName}}} \\\\
        {\\large ${cvData.personalDetails.jobTitle}} \\\\
        ${cvData.personalDetails.email} $|$ ${cvData.personalDetails.phone}
        ${cvData.personalDetails.address ? `\\\\ ${cvData.personalDetails.address}` : ''}
      \\end{center}
      
      \\vspace{0.5cm}
      
      % Profile
      ${cvData.profile ? `
      \\section*{Professional Profile}
      ${cvData.profile}
      
      ` : ''}
      
      % Experience
      ${cvData.experience && cvData.experience.length > 0 ? `
      \\section*{Professional Experience}
      ${cvData.experience.map(exp => `
        \\textbf{${exp.position}} at \\textbf{${exp.company}} \\hfill ${exp.startDate} -- ${exp.endDate}
        \\begin{itemize}[leftmargin=*]
          ${exp.description ? exp.description.map(desc => `\\item ${desc}`).join('\\\\') : ''}
          ${exp.achievements ? exp.achievements.map(achievement => `\\item \\textbf{Achievement:} ${achievement}`).join('\\\\') : ''}
        \\end{itemize}
      `).join('\\\\')}
      
      ` : ''}
      
      % Education
      ${cvData.education && cvData.education.length > 0 ? `
      \\section*{Education}
      ${cvData.education.map(edu => `
        \\textbf{${edu.degree}} \\hfill ${edu.startDate} -- ${edu.endDate} \\\\
        ${edu.institution}
        ${edu.grade ? `\\\\ Grade: ${edu.grade}` : ''}
      `).join('\\\\')}
      
      ` : ''}
      
      % Skills
      ${cvData.keySkills && cvData.keySkills.length > 0 ? `
      \\section*{Key Skills}
      ${cvData.keySkills.join(', ')}
      
      ` : ''}
      
      % Projects
      ${cvData.projects && cvData.projects.length > 0 ? `
      \\section*{Projects}
      ${cvData.projects.map(project => `
        \\textbf{${project.name}} \\\\
        ${project.description}
        ${project.technologies ? `\\\\ \\textit{Technologies:} ${project.technologies.join(', ')}` : ''}
      `).join('\\\\')}
      
      ` : ''}
      
      % Interests
      ${cvData.interests && cvData.interests.length > 0 ? `
      \\section*{Interests}
      ${cvData.interests.join(', ')}
      ` : ''}
      
      \\end{document}
    `;
    
    return Buffer.from(latex, 'utf8');
  }

  // Export CV in multiple formats
  async exportCV(cvData, template, formats = ['pdf', 'docx', 'html'], options = {}) {
    const results = {};
    
    for (const format of formats) {
      try {
        switch (format.toLowerCase()) {
          case 'pdf':
            results.pdf = await this.generatePDF(cvData, template, options);
            break;
          case 'docx':
            results.docx = await this.generateDOCX(cvData, template, options);
            break;
          case 'html':
            results.html = await this.generateHTML(cvData, template, options);
            break;
          case 'latex':
            results.latex = await this.generateLaTeX(cvData, template, options);
            break;
          default:
            console.warn(`Unsupported format: ${format}`);
        }
      } catch (error) {
        console.error(`Error generating ${format}:`, error);
        results[format] = { error: error.message };
      }
    }
    
    return results;
  }
}

module.exports = ExportService;
