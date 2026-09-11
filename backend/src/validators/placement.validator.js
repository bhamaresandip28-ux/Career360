/**
 * Career360 — Placement Validators (Phase 4)
 * Zod schemas for companies, drives, eligibility, and applications
 */

const { z } = require('zod');

const DriveStatusEnum = z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED']);
const ApplicationStatusEnum = z.enum([
  'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'OFFERED', 'ACCEPTED', 'DECLINED',
]);
const RoundStatusEnum = z.enum(['SCHEDULED', 'CLEARED', 'ELIMINATED', 'ABSENT']);
const OutcomeStatusEnum = z.enum(['ACCEPTED', 'REJECTED']);

const createCompanySchema = z.object({
  name:        z.string().min(2).max(100),
  industry:    z.string().min(2).max(100),
  website:     z.string().url().optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  location:    z.string().max(100).optional(),
  logoUrl:     z.string().url().optional().or(z.literal('')),
});

const createJobSchema = z.object({
  companyId:      z.string().min(1),
  title:          z.string().min(2).max(100),
  description:    z.string().max(3000).optional(),
  role:           z.string().max(100).optional(),
  packageMin:     z.number().min(0).max(100).optional(),
  packageMax:     z.number().min(0).max(100).optional(),
  location:       z.string().max(100).optional(),
  employmentType: z.string().max(50).default('Full-time'),
  requiredSkills: z.array(z.string()).default([]),
});

const createDriveSchema = z.object({
  companyId:        z.string().min(1),
  jobId:            z.string().min(1),
  title:            z.string().min(2).max(150),
  openDate:         z.string(),
  deadline:         z.string(),
  selectionProcess: z.string().max(1000).optional(),
  status:           DriveStatusEnum.default('ACTIVE'),
  eligibility: z.object({
    departments:            z.array(z.string()).default([]),
    minCgpa:                z.number().min(0).max(10).default(6.0),
    maxActiveBacklogs:      z.number().int().min(0).max(20).default(0),
    maxTotalBacklogs:       z.number().int().min(0).max(50).default(2),
    minAttendance:          z.number().min(0).max(100).default(75.0),
    allowedGraduationYears: z.array(z.number().int()).default([]),
    requiredSkills:         z.array(z.string()).default([]),
  }).optional(),
});

const applyDriveSchema = z.object({
  driveId:   z.string().min(1),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  notes:     z.string().max(500).optional(),
});

const updateApplicationStatusSchema = z.object({
  status: ApplicationStatusEnum,
  notes:  z.string().max(500).optional(),
});

const scheduleRoundSchema = z.object({
  driveId:       z.string().min(1),
  applicationId: z.string().optional(),
  studentId:     z.string().min(1),
  roundNumber:   z.number().int().min(1).max(10),
  roundName:     z.string().min(2).max(100),
  scheduledAt:   z.string().optional(),
  venueOrLink:   z.string().max(300).optional(),
  status:        RoundStatusEnum.default('SCHEDULED'),
  feedback:      z.string().max(1000).optional(),
});

const recordOutcomeSchema = z.object({
  studentId:      z.string().min(1),
  companyId:      z.string().min(1),
  jobId:          z.string().min(1),
  packageOffered: z.number().min(0).max(200),
  status:         OutcomeStatusEnum.default('ACCEPTED'),
  offerLetterUrl: z.string().url().optional().or(z.literal('')),
});

module.exports = {
  createCompanySchema,
  createJobSchema,
  createDriveSchema,
  applyDriveSchema,
  updateApplicationStatusSchema,
  scheduleRoundSchema,
  recordOutcomeSchema,
};
