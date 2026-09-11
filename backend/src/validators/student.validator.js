/**
 * Career360 — Student Validators (Phase 2)
 * Zod schemas for all student profile endpoints
 */

const { z } = require('zod');

// ─── Enums ────────────────────────────────────────────────────────────────────
const SkillCategoryEnum = z.enum([
  'PROGRAMMING', 'WEB_DEVELOPMENT', 'DATABASE', 'CLOUD',
  'DEVOPS', 'AI_ML', 'TOOLS', 'SOFT_SKILLS', 'OTHER',
]);

const SkillProficiencyEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);

const ProjectCategoryEnum = z.enum([
  'WEB', 'MOBILE', 'DESKTOP', 'DATA_SCIENCE', 'AI_ML', 'IOT', 'GAME', 'OTHER',
]);

const AchievementCategoryEnum = z.enum([
  'HACKATHON', 'COMPETITION', 'AWARD', 'LEADERSHIP', 'PUBLICATION',
  'SPORTS', 'CULTURAL', 'OTHER',
]);

const ProfessionalPlatformEnum = z.enum([
  'LINKEDIN', 'GITHUB', 'PORTFOLIO', 'LEETCODE', 'CODECHEF',
  'HACKERRANK', 'CODEFORCES', 'KAGGLE', 'OTHER',
]);

const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);

// ─── Profile ─────────────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  phone:           z.string().max(20).optional(),
  gender:          GenderEnum.optional(),
  dateOfBirth:     z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  address:         z.string().max(500).optional(),
  departmentId:    z.string().optional(),
  batchId:         z.string().optional(),
  currentSemester: z.number().int().min(1).max(12).optional(),
  admissionYear:   z.number().int().min(2000).max(2100).optional(),
  rollNumber:      z.string().max(50).optional(),
});

// ─── Skills ──────────────────────────────────────────────────────────────────
const createSkillSchema = z.object({
  name:        z.string().min(1).max(100),
  category:    SkillCategoryEnum,
  proficiency: SkillProficiencyEnum,
  evidence:    z.string().max(500).optional(),
});

const updateSkillSchema = createSkillSchema.partial();

// ─── Projects ────────────────────────────────────────────────────────────────
const createProjectSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  techStack:   z.array(z.string().max(50)).min(1).max(20),
  role:        z.string().max(100).optional(),
  category:    ProjectCategoryEnum.default('OTHER'),
  isTeam:      z.boolean().default(false),
  teamSize:    z.number().int().min(2).max(100).optional(),
  startDate:   z.string().optional(),
  endDate:     z.string().optional(),
  githubUrl:   z.string().url().optional().or(z.literal('')),
  liveUrl:     z.string().url().optional().or(z.literal('')),
});

const updateProjectSchema = createProjectSchema.partial();

// ─── Certifications ──────────────────────────────────────────────────────────
const createCertificationSchema = z.object({
  name:            z.string().min(1).max(200),
  issuingOrg:      z.string().min(1).max(200),
  issueDate:       z.string(),
  expiryDate:      z.string().optional(),
  credentialId:    z.string().max(200).optional(),
  verificationUrl: z.string().url().optional().or(z.literal('')),
});

const updateCertificationSchema = createCertificationSchema.partial();

// ─── Internships ─────────────────────────────────────────────────────────────
const createInternshipSchema = z.object({
  organization:    z.string().min(1).max(200),
  role:            z.string().min(1).max(100),
  startDate:       z.string(),
  endDate:         z.string().optional(),
  description:     z.string().max(2000).optional(),
  techStack:       z.array(z.string().max(50)).max(20).default([]),
  verificationUrl: z.string().url().optional().or(z.literal('')),
});

const updateInternshipSchema = createInternshipSchema.partial();

// ─── Achievements ─────────────────────────────────────────────────────────────
const createAchievementSchema = z.object({
  title:       z.string().min(1).max(200),
  category:    AchievementCategoryEnum,
  description: z.string().max(1000).optional(),
  date:        z.string(),
  proofUrl:    z.string().url().optional().or(z.literal('')),
});

const updateAchievementSchema = createAchievementSchema.partial();

// ─── Professional Links ───────────────────────────────────────────────────────
const upsertLinkSchema = z.object({
  links: z.array(z.object({
    platform: ProfessionalPlatformEnum,
    url:      z.string().url({ message: 'Must be a valid URL' }),
    isPublic: z.boolean().default(true),
  })).max(15),
});

// ─── Career Preferences ───────────────────────────────────────────────────────
const updateCareerPreferenceSchema = z.object({
  targetRole:        z.string().max(100).optional(),
  careerInterests:   z.array(z.string().max(100)).max(10).optional(),
  preferredLocation: z.string().max(100).optional(),
  careerGoals:       z.string().max(1000).optional(),
});

module.exports = {
  updateProfileSchema,
  createSkillSchema,
  updateSkillSchema,
  createProjectSchema,
  updateProjectSchema,
  createCertificationSchema,
  updateCertificationSchema,
  createInternshipSchema,
  updateInternshipSchema,
  createAchievementSchema,
  updateAchievementSchema,
  upsertLinkSchema,
  updateCareerPreferenceSchema,
};
