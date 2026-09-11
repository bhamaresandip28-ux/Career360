/**
 * Career360 — Placement API Service (Phase 4)
 * Frontend API calls for companies, drives, eligibility, and applications
 */

import api from './api';

export const getCompanies           = ()     => api.get('/placement/companies');
export const getCompanyDetails       = (id)   => api.get(`/placement/companies/${id}`);
export const createCompany           = (data) => api.post('/placement/companies', data);
export const getJobs                 = (companyId) => api.get('/placement/jobs', { params: companyId ? { companyId } : {} });
export const createJob               = (data) => api.post('/placement/jobs', data);
export const getDrives              = ()     => api.get('/placement/drives');
export const getDriveDetails        = (id)   => api.get(`/placement/drives/${id}`);
export const createDrive             = (data) => api.post('/placement/drives', data);
export const applyForDrive          = (data) => api.post('/placement/apply', data);
export const getMyApplications      = ()     => api.get('/placement/applications/my');
export const getAllApplications      = (params) => api.get('/placement/applications', { params });
export const getDriveApplications    = (id)   => api.get(`/placement/drives/${id}/applications`);
export const updateApplicationStatus = (id, status, notes) => api.patch(`/placement/applications/${id}/status`, { status, notes });
export const scheduleRound           = (data) => api.post('/placement/rounds', data);
export const getOutcomes            = ()     => api.get('/placement/outcomes');
export const recordOutcome           = (data) => api.post('/placement/outcomes', data);
