/**
 * Career360 — Student API Service (Phase 2)
 * All frontend calls for student profile endpoints
 */

import api from './api';

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile        = ()       => api.get('/students/profile');
export const updateProfile     = (data)   => api.put('/students/profile', data);
export const getCompleteness   = ()       => api.get('/students/profile/completeness');

// ─── Reference Data ──────────────────────────────────────────────────────────
export const getDepartments    = ()       => api.get('/students/departments');
export const getBatches        = (deptId) => api.get(`/students/departments/${deptId}/batches`);

// ─── Skills ──────────────────────────────────────────────────────────────────
export const getSkills         = ()       => api.get('/students/skills');
export const createSkill       = (data)   => api.post('/students/skills', data);
export const updateSkill       = (id, d)  => api.put(`/students/skills/${id}`, d);
export const deleteSkill       = (id)     => api.delete(`/students/skills/${id}`);

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects       = ()       => api.get('/students/projects');
export const createProject     = (data)   => api.post('/students/projects', data);
export const updateProject     = (id, d)  => api.put(`/students/projects/${id}`, d);
export const deleteProject     = (id)     => api.delete(`/students/projects/${id}`);

// ─── Certifications ───────────────────────────────────────────────────────────
export const getCertifications    = ()       => api.get('/students/certifications');
export const createCertification  = (data)   => api.post('/students/certifications', data);
export const updateCertification  = (id, d)  => api.put(`/students/certifications/${id}`, d);
export const deleteCertification  = (id)     => api.delete(`/students/certifications/${id}`);

// ─── Internships ──────────────────────────────────────────────────────────────
export const getInternships    = ()       => api.get('/students/internships');
export const createInternship  = (data)   => api.post('/students/internships', data);
export const updateInternship  = (id, d)  => api.put(`/students/internships/${id}`, d);
export const deleteInternship  = (id)     => api.delete(`/students/internships/${id}`);

// ─── Achievements ─────────────────────────────────────────────────────────────
export const getAchievements   = ()       => api.get('/students/achievements');
export const createAchievement = (data)   => api.post('/students/achievements', data);
export const updateAchievement = (id, d)  => api.put(`/students/achievements/${id}`, d);
export const deleteAchievement = (id)     => api.delete(`/students/achievements/${id}`);

// ─── Professional Links ───────────────────────────────────────────────────────
export const getLinks          = ()       => api.get('/students/links');
export const upsertLinks       = (links)  => api.put('/students/links', { links });

// ─── Career Preferences ───────────────────────────────────────────────────────
export const getCareerPreferences    = ()     => api.get('/students/career-preferences');
export const updateCareerPreferences = (data) => api.put('/students/career-preferences', data);
