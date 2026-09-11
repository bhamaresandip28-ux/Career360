/**
 * Career360 — Academic API Service (Phase 3)
 * Frontend API calls for academic intelligence and semester records
 */

import api from './api';

export const getAcademicSummary   = ()       => api.get('/academics/summary');
export const getSemesters         = ()       => api.get('/academics/semesters');
export const upsertSemester       = (data)   => api.post('/academics/semesters', data);
export const getSemesterDetails   = (id)     => api.get(`/academics/semesters/${id}`);
export const deleteSemester       = (id)     => api.delete(`/academics/semesters/${id}`);

export const getSubjects          = (deptId) => api.get('/academics/subjects', { params: { departmentId: deptId } });
export const upsertSubjectRecord  = (data)   => api.post('/academics/records', data);
export const updateSubjectRecord  = (id, d)  => api.put(`/academics/records/${id}`, d);
export const deleteSubjectRecord  = (id)     => api.delete(`/academics/records/${id}`);
