export type ProcessingState = 'idle' | 'processing' | 'completed' | 'error'

export interface CvDraft {
  header: {
    name: string;
    title: string;
    photoUrl: string | null;
  };
  personalDetails: {
    nationality: string;
    languages: string[];
    dob: string;
    maritalStatus: string;
  };
  profile: string;
  experience: Array<{
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    details: string[];
  }>;
  skills: string[];
  interests: string[];
  audit: {
    rulesApplied: string[];
    issues: string[];
  };
}

export interface PersonalDetails {
  firstName: string
  lastName: string
  jobTitle: string
  photo?: string
  nationality: string
  languages: string[]
  dateOfBirth: string
  maritalStatus: string
  email: string
  phone: string
  address: string
}

export interface Experience {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string[]
  achievements: string[]
}

export interface Education {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  grade?: string
}

export interface CVData {
  personalDetails: PersonalDetails
  profile: string
  experience: Experience[]
  education: Education[]
  keySkills: string[]
  interests: string[]
  metadata: {
    originalFileName: string
    processedAt: string
    version: string
  }
}

export interface FileUploadProps {
  onFileProcessed: (data: CVData, original: string) => void
  onProcessingStart: () => void
}

export interface CVPreviewProps {
  cvData: CVData
}

export interface CVEditorProps {
  cvData: CVData
  onUpdate: (data: CVData) => void
  onBack: () => void
}

export interface ProcessingStatusProps {
  // Component doesn't need props for now
}
