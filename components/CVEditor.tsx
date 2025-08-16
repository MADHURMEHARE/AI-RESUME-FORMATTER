'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  PlusIcon, 
  TrashIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'
import { CVData, CVEditorProps, Experience, Education } from '@/types/cv'
import toast from 'react-hot-toast'
import HomeButton from './HomeButton'

const CVEditor: React.FC<CVEditorProps> = ({ cvData, onUpdate, onBack }) => {
  const [editedData, setEditedData] = useState<CVData>(cvData)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>('')

  const handleEdit = (field: string, value: string) => {
    setEditingField(field)
    setTempValue(value)
  }

  const handleSave = (field: string) => {
    if (!tempValue.trim()) {
      toast.error('Field cannot be empty')
      return
    }

    const newData = { ...editedData }
    
    // Handle nested fields
    if (field.includes('.')) {
      const [section, key] = field.split('.')
      if (section === 'personalDetails') {
        newData.personalDetails = { ...newData.personalDetails, [key]: tempValue }
      }
    } else {
      // Handle top-level fields
      if (field === 'profile') {
        newData.profile = tempValue
      }
    }

    setEditedData(newData)
    setEditingField(null)
    setTempValue('')
    onUpdate(newData)
    toast.success('Updated successfully')
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleArrayEdit = (section: keyof CVData, index: number, field: string, value: string) => {
    const newData = { ...editedData }
    const array = newData[section] as any[]
    
    if (field.includes('.')) {
      const [subSection, key] = field.split('.')
      array[index] = { ...array[index], [key]: value }
    } else {
      array[index] = { ...array[index], [field]: value }
    }
    
    setEditedData(newData)
    onUpdate(newData)
  }

  const handleArrayAdd = (section: keyof CVData) => {
    const newData = { ...editedData }
    const array = newData[section] as any[]
    
    if (section === 'experience') {
      array.push({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: [''],
        achievements: ['']
      })
    } else if (section === 'education') {
      array.push({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        grade: ''
      })
    } else if (section === 'keySkills' || section === 'interests') {
      array.push('')
    }
    
    setEditedData(newData)
    onUpdate(newData)
  }

  const handleArrayRemove = (section: keyof CVData, index: number) => {
    const newData = { ...editedData }
    const array = newData[section] as any[]
    array.splice(index, 1)
    setEditedData(newData)
    onUpdate(newData)
    toast.success('Item removed')
  }

  const handleArrayItemEdit = (section: keyof CVData, index: number, field: string, value: string) => {
    const newData = { ...editedData }
    const array = newData[section] as any[]
    
    if (field === 'description' || field === 'achievements') {
      array[index] = { ...array[index], [field]: [value] }
    } else {
      array[index] = { ...array[index], [field]: value }
    }
    
    setEditedData(newData)
    onUpdate(newData)
  }

  const renderEditableField = (label: string, field: string, value: string, multiline = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {editingField === field ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="input-field"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => handleSave(field)}
              className="btn-primary flex items-center space-x-2 px-3 py-1 text-sm"
            >
              <CheckIcon className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2 px-3 py-1 text-sm"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <div className="flex-1">
            {multiline ? (
              <p className="text-gray-700 whitespace-pre-wrap">{value}</p>
            ) : (
              <p className="text-gray-700">{value}</p>
            )}
          </div>
          <button
            onClick={() => handleEdit(field, value)}
            className="opacity-0 group-hover:opacity-100 transition-opacity btn-secondary px-3 py-1 text-sm"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <HomeButton variant="secondary" />
          <button
            onClick={onBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Preview</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Edit CV</h2>
      </div>

      <div className="space-y-8">
        {/* Personal Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="cv-section-title">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderEditableField('First Name', 'personalDetails.firstName', editedData.personalDetails.firstName)}
            {renderEditableField('Last Name', 'personalDetails.lastName', editedData.personalDetails.lastName)}
            {renderEditableField('Job Title', 'personalDetails.jobTitle', editedData.personalDetails.jobTitle)}
            {renderEditableField('Nationality', 'personalDetails.nationality', editedData.personalDetails.nationality)}
            {renderEditableField('Languages', 'personalDetails.languages', editedData.personalDetails.languages.join(', '))}
            {renderEditableField('Date of Birth', 'personalDetails.dateOfBirth', editedData.personalDetails.dateOfBirth)}
            {renderEditableField('Marital Status', 'personalDetails.maritalStatus', editedData.personalDetails.maritalStatus)}
            {renderEditableField('Email', 'personalDetails.email', editedData.personalDetails.email)}
            {renderEditableField('Phone', 'personalDetails.phone', editedData.personalDetails.phone)}
            {renderEditableField('Address', 'personalDetails.address', editedData.personalDetails.address, true)}
          </div>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="cv-section-title">Professional Profile</h3>
          {renderEditableField('Profile', 'profile', editedData.profile, true)}
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="cv-section-title">Professional Experience</h3>
            <button
              onClick={() => handleArrayAdd('experience')}
              className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Experience</span>
            </button>
          </div>
          
          <div className="space-y-6">
            {editedData.experience.map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Experience #{index + 1}</h4>
                  <button
                    onClick={() => handleArrayRemove('experience', index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleArrayEdit('experience', index, 'company', e.target.value)}
                    className="input-field"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleArrayEdit('experience', index, 'position', e.target.value)}
                    className="input-field"
                    placeholder="Position"
                  />
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => handleArrayEdit('experience', index, 'startDate', e.target.value)}
                    className="input-field"
                    placeholder="Start Date (e.g., Jan 2020)"
                  />
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => handleArrayEdit('experience', index, 'endDate', e.target.value)}
                    className="input-field"
                    placeholder="End Date (e.g., Present)"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={exp.description[0] || ''}
                    onChange={(e) => handleArrayItemEdit('experience', index, 'description', e.target.value)}
                    className="input-field min-h-[80px]"
                    placeholder="Describe your responsibilities"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                  <textarea
                    value={exp.achievements[0] || ''}
                    onChange={(e) => handleArrayItemEdit('experience', index, 'achievements', e.target.value)}
                    className="input-field min-h-[80px]"
                    placeholder="List your key achievements"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="cv-section-title">Education</h3>
            <button
              onClick={() => handleArrayAdd('education')}
              className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Education</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {editedData.education.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Education #{index + 1}</h4>
                  <button
                    onClick={() => handleArrayRemove('education', index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleArrayEdit('education', index, 'institution', e.target.value)}
                    className="input-field"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleArrayEdit('education', index, 'degree', e.target.value)}
                    className="input-field"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => handleArrayEdit('education', index, 'field', e.target.value)}
                    className="input-field"
                    placeholder="Field of Study"
                  />
                  <input
                    type="text"
                    value={edu.grade || ''}
                    onChange={(e) => handleArrayEdit('education', index, 'grade', e.target.value)}
                    className="input-field"
                    placeholder="Grade (optional)"
                  />
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => handleArrayEdit('education', index, 'startDate', e.target.value)}
                    className="input-field"
                    placeholder="Start Date (e.g., Sep 2013)"
                  />
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => handleArrayEdit('education', index, 'endDate', e.target.value)}
                    className="input-field"
                    placeholder="End Date (e.g., Jun 2017)"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="cv-section-title">Key Skills</h3>
            <button
              onClick={() => handleArrayAdd('keySkills')}
              className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Skill</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {editedData.keySkills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayEdit('keySkills', index, '', e.target.value)}
                  className="input-field flex-1"
                  placeholder="Enter skill"
                />
                <button
                  onClick={() => handleArrayRemove('keySkills', index)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="cv-section-title">Interests</h3>
            <button
              onClick={() => handleArrayAdd('interests')}
              className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Interest</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {editedData.interests.map((interest, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => handleArrayEdit('interests', index, '', e.target.value)}
                  className="input-field flex-1"
                  placeholder="Enter interest"
                />
                <button
                  onClick={() => handleArrayRemove('interests', index)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Save Changes Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg"
      >
        <p className="text-green-800 text-sm">
          <strong>Note:</strong> All changes are automatically saved as you edit. 
          Use the "Back to Preview" button to see your updated CV.
        </p>
      </motion.div>
    </div>
  )
}

export default CVEditor
