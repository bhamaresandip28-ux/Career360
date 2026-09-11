/**
 * Career Intelligence & Preparation Zod Validators
 */

const { z } = require('zod');

const setTargetRoleSchema = z.object({
  targetRoleId: z.string({ required_error: 'targetRoleId is required' }).min(1, 'targetRoleId cannot be empty'),
});

const createRoadmapItemSchema = z.object({
  title: z.string({ required_error: 'title is required' }).min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['ACADEMIC', 'SKILL', 'PROJECT', 'INTERNSHIP', 'CERTIFICATION', 'PREPARATION']).default('SKILL'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  targetRoleId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
});

const updateRoadmapItemSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['ACADEMIC', 'SKILL', 'PROJECT', 'INTERNSHIP', 'CERTIFICATION', 'PREPARATION']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().optional().nullable(),
});

const updatePrepProgressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], {
    required_error: 'status must be NOT_STARTED, IN_PROGRESS, or COMPLETED',
  }),
  notes: z.string().max(1000).optional().nullable(),
});

module.exports = {
  setTargetRoleSchema,
  createRoadmapItemSchema,
  updateRoadmapItemSchema,
  updatePrepProgressSchema,
};
