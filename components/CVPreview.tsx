'use client'

import { motion } from 'framer-motion'
import { CVData, CVPreviewProps } from '@/types/cv'

const CVPreview: React.FC<CVPreviewProps> = ({ cvData }) => {
  const { personalDetails, profile, experience, education, keySkills, interests } = cvData

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 font-palatino">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 border-b border-gray-200 pb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalDetails.firstName} {personalDetails.lastName}
        </h1>
        <h2 className="text-xl text-primary-600 font-semibold mb-4">
          {personalDetails.jobTitle}
        </h2>
        
        {/* Personal Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 max-w-2xl mx-auto">
          <div className="text-left">
            <p><span className="font-semibold">Nationality:</span> {personalDetails.nationality}</p>
            <p><span className="font-semibold">Languages:</span> {personalDetails.languages.join(', ')}</p>
            <p><span className="font-semibold">Date of Birth:</span> {personalDetails.dateOfBirth}</p>
          </div>
          <div className="text-left">
            <p><span className="font-semibold">Marital Status:</span> {personalDetails.maritalStatus}</p>
            <p><span className="font-semibold">Email:</span> {personalDetails.email}</p>
            <p><span className="font-semibold">Phone:</span> {personalDetails.phone}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-semibold">Address:</span> {personalDetails.address}
        </p>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="cv-section"
      >
        <h3 className="cv-section-title">Professional Profile</h3>
        <p className="text-gray-700 leading-relaxed text-balance">
          {profile}
        </p>
      </motion.div>

      {/* Experience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="cv-section"
      >
        <h3 className="cv-section-title">Professional Experience</h3>
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="border-l-4 border-primary-200 pl-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{exp.position}</h4>
                <span className="text-sm text-gray-500 font-medium">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <h5 className="text-primary-600 font-medium mb-3">{exp.company}</h5>
              
              <div className="space-y-3">
                <div>
                  <h6 className="font-semibold text-gray-800 mb-2">Key Responsibilities:</h6>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="text-sm">{desc}</li>
                    ))}
                  </ul>
                </div>
                
                {exp.achievements.length > 0 && (
                  <div>
                    <h6 className="font-semibold text-gray-800 mb-2">Key Achievements:</h6>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="text-sm">{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="cv-section"
      >
        <h3 className="cv-section-title">Education</h3>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="border-l-4 border-green-200 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{edu.degree}</h4>
                  <h5 className="text-primary-600 font-medium">{edu.institution}</h5>
                  <p className="text-gray-600">{edu.field}</p>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              {edu.grade && (
                <p className="text-sm text-gray-600 font-medium">Grade: {edu.grade}</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Key Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="cv-section"
      >
        <h3 className="cv-section-title">Key Skills</h3>
        <div className="flex flex-wrap gap-2">
          {keySkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Interests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="cv-section"
      >
        <h3 className="cv-section-title">Interests</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {interests.map((interest, index) => (
            <li key={index} className="text-sm">{interest}</li>
          ))}
        </ul>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500"
      >
        <p>Transformed using AI CV Transformer • {new Date().toLocaleDateString()}</p>
        <p className="mt-1">Following EHS Professional Formatting Standards</p>
      </motion.div>
    </div>
  )
}

export default CVPreview
