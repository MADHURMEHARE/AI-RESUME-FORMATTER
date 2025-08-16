import { z } from 'zod';

// Header schema
const HeaderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Job title is required'),
  photoUrl: z.string().url('Photo URL must be valid').optional(),
});

// Personal details schema
const PersonalDetailsSchema = z.object({
  nationality: z.string().min(1, 'Nationality is required'),
  languages: z.array(z.string().min(1, 'Language cannot be empty')).min(1, 'At least one language is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  maritalStatus: z.string().min(1, 'Marital status is required'),
});

// Experience item schema
const ExperienceItemSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  bullets: z.array(z.string().min(1, 'Bullet point cannot be empty')).min(1, 'At least one bullet point is required'),
});

// Education item schema
const EducationItemSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  details: z.array(z.string().min(1, 'Detail cannot be empty')).min(1, 'At least one detail is required'),
});

// Audit schema
const AuditSchema = z.object({
  rulesApplied: z.array(z.string().min(1, 'Rule cannot be empty')),
  issues: z.array(z.string().min(1, 'Issue cannot be empty')),
});

// Main CV Draft schema
export const CvDraftSchema = z.object({
  header: HeaderSchema,
  personalDetails: PersonalDetailsSchema,
  profile: z.string().min(1, 'Profile is required'),
  experience: z.array(ExperienceItemSchema).min(1, 'At least one experience entry is required'),
  education: z.array(EducationItemSchema).min(1, 'At least one education entry is required'),
  skills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one skill is required'),
  interests: z.array(z.string().min(1, 'Interest cannot be empty')).min(1, 'At least one interest is required'),
  audit: AuditSchema,
});

// TypeScript type derived from the schema
export type CvDraft = z.infer<typeof CvDraftSchema>;

// Partial schema for updates (all fields optional)
export const CvDraftPartialSchema = CvDraftSchema.partial();

// Schema for creating a new CV draft
export const CreateCvDraftSchema = CvDraftSchema.omit({
  audit: true,
}).extend({
  audit: AuditSchema.optional(),
});

// Schema for updating an existing CV draft
export const UpdateCvDraftSchema = CvDraftSchema.partial();

// Validation helper functions
export const validateCvDraft = (data: unknown): CvDraft => {
  return CvDraftSchema.parse(data);
};

export const validateCvDraftSafe = (data: unknown): { success: true; data: CvDraft } | { success: false; error: z.ZodError } => {
  const result = CvDraftSchema.safeParse(data);
  return result;
};

// Schema for individual sections (useful for partial updates)
export const HeaderUpdateSchema = HeaderSchema.partial();
export const PersonalDetailsUpdateSchema = PersonalDetailsSchema.partial();
export const ExperienceUpdateSchema = z.array(ExperienceItemSchema.partial());
export const EducationUpdateSchema = z.array(EducationItemSchema.partial());
export const SkillsUpdateSchema = z.array(z.string().min(1));
export const InterestsUpdateSchema = z.array(z.string().min(1));
export const ProfileUpdateSchema = z.string().min(1);

// Export individual schemas for reuse
export {
  HeaderSchema,
  PersonalDetailsSchema,
  ExperienceItemSchema,
  EducationItemSchema,
  AuditSchema,
};




