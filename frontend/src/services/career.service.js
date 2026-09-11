/**
 * Career360 — Career Intelligence & Preparation API Client
 */

import api from './api';

export const getTargetRoles = async () => {
  const res = await api.get('/career/roles');
  return res.data?.data || [];
};

export const getMyTargetRole = async () => {
  const res = await api.get('/career/target-role');
  return res.data?.data || null;
};

export const setTargetRole = async (targetRoleId) => {
  const res = await api.post('/career/target-role', { targetRoleId });
  return res.data?.data;
};

export const setMyTargetRole = setTargetRole;

export const getReadiness = async (targetRoleId = null) => {
  const params = targetRoleId ? { targetRoleId } : {};
  const res = await api.get('/career/readiness', { params });
  return res.data?.data;
};

export const getSkillGap = async (targetRoleId = null) => {
  const params = targetRoleId ? { targetRoleId } : {};
  const res = await api.get('/career/skill-gap', { params });
  return res.data?.data;
};

export const getRoadmap = async () => {
  const res = await api.get('/career/roadmap');
  return res.data?.data || { summary: {}, items: [] };
};

export const createRoadmapItem = async (data) => {
  const res = await api.post('/career/roadmap', data);
  return res.data?.data;
};

export const updateRoadmapItem = async (id, data) => {
  const res = await api.patch(`/career/roadmap/${id}`, data);
  return res.data?.data;
};

export const deleteRoadmapItem = async (id) => {
  const res = await api.delete(`/career/roadmap/${id}`);
  return res.data;
};

export const getPreparationCatalog = async (filters = {}) => {
  const res = await api.get('/career/preparation', { params: filters });
  return res.data?.data || { summary: {}, resources: [] };
};

export const updatePrepProgress = async (id, data) => {
  const res = await api.patch(`/career/preparation/${id}`, data);
  return res.data?.data;
};
