/**
 * Auth validators — Zod schemas for registration and login input.
 */

const { z } = require('zod');

// ─── Password policy ──────────────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

// ─── Register ─────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must be at most 100 characters.'),

  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address.'),

  password: passwordSchema,

  confirmPassword: z.string({ required_error: 'Please confirm your password.' }),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match.', path: ['confirmPassword'] }
);

// ─── Login ────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

module.exports = { registerSchema, loginSchema };
