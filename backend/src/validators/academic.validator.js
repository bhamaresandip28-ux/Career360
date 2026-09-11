/**
 * Career360 — Academic Validators (Phase 3)
 * Zod schemas for semester, subject, and grade records
 */

const { z } = require('zod');

const createSemesterSchema = z.object({
  semesterNumber: z.number().int().min(1).max(12),
  academicYear:   z.string().min(4).max(20),
  sgpa:           z.number().min(0).max(10).optional(),
  totalCredits:   z.number().int().min(0).max(50).optional(),
});

const updateSemesterSchema = createSemesterSchema.partial();

const createSubjectSchema = z.object({
  code:         z.string().min(2).max(20),
  name:         z.string().min(2).max(150),
  credits:      z.number().int().min(1).max(10).default(3),
  departmentId: z.string().optional(),
});

const createSubjectRecordSchema = z.object({
  semesterId:    z.string().min(1),
  subjectId:     z.string().min(1),
  marksObtained: z.number().min(0).max(100).optional(),
  maxMarks:      z.number().min(1).max(100).default(100),
  grade:         z.string().max(5).optional(),
  attendance:    z.number().min(0).max(100).optional(),
  isBacklog:     z.boolean().default(false),
  clearedAt:     z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

const updateSubjectRecordSchema = z.object({
  marksObtained: z.number().min(0).max(100).optional(),
  maxMarks:      z.number().min(1).max(100).optional(),
  grade:         z.string().max(5).optional(),
  attendance:    z.number().min(0).max(100).optional(),
  isBacklog:     z.boolean().optional(),
  clearedAt:     z.string().optional().nullable(),
});

module.exports = {
  createSemesterSchema,
  updateSemesterSchema,
  createSubjectSchema,
  createSubjectRecordSchema,
  updateSubjectRecordSchema,
};
