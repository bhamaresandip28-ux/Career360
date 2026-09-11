/**
 * Career360 — Placement Controller (Phase 4)
 * HTTP controller for companies, drives, applications, and rounds
 */

const placementService = require('../services/placement.service');
const auditService     = require('../services/audit.service');
const { sendSuccess }   = require('../utils/apiResponse');

const getCompanies = async (req, res, next) => {
  try {
    const companies = await placementService.getCompanies();
    sendSuccess(res, { companies }, 'Companies fetched.');
  } catch (e) { next(e); }
};

const getCompanyDetails = async (req, res, next) => {
  try {
    const company = await placementService.getCompanyDetails(req.params.id);
    sendSuccess(res, { company }, 'Company details fetched.');
  } catch (e) { next(e); }
};

const createCompany = async (req, res, next) => {
  try {
    const company = await placementService.createCompany(req.body);
    auditService.recordAudit({
      userId: req.user.id,
      action: 'COMPANY_CREATE',
      entityType: 'COMPANY',
      entityId: company.id,
      details: { name: company.name, industry: company.industry },
      req,
    });
    sendSuccess(res, { company }, 'Company created.', 201);
  } catch (e) { next(e); }
};

const getJobs = async (req, res, next) => {
  try {
    const jobs = await placementService.getJobs(req.query.companyId);
    sendSuccess(res, { jobs }, 'Job openings fetched.');
  } catch (e) { next(e); }
};

const createJob = async (req, res, next) => {
  try {
    const job = await placementService.createJob(req.body);
    sendSuccess(res, { job }, 'Job opening created.', 201);
  } catch (e) { next(e); }
};

const getDrives = async (req, res, next) => {
  try {
    const drives = await placementService.getDrives(req.user.id, req.user.role);
    sendSuccess(res, { drives }, 'Placement drives fetched.');
  } catch (e) { next(e); }
};

const getDriveDetails = async (req, res, next) => {
  try {
    const data = await placementService.getDriveDetails(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, data, 'Placement drive details fetched.');
  } catch (e) { next(e); }
};

const createDrive = async (req, res, next) => {
  try {
    const drive = await placementService.createDrive(req.body);
    auditService.recordAudit({
      userId: req.user.id,
      action: 'DRIVE_CREATE',
      entityType: 'PLACEMENT_DRIVE',
      entityId: drive.id,
      details: { title: drive.title, companyId: drive.companyId, jobId: drive.jobId },
      req,
    });
    sendSuccess(res, { drive }, 'Placement drive created.', 201);
  } catch (e) { next(e); }
};

const applyForDrive = async (req, res, next) => {
  try {
    const application = await placementService.applyForDrive(req.user.id, req.body);
    auditService.recordAudit({
      userId: req.user.id,
      action: 'APPLICATION_SUBMIT',
      entityType: 'APPLICATION',
      entityId: application.id,
      details: { driveId: application.driveId },
      req,
    });
    sendSuccess(res, { application }, 'Application submitted successfully!', 201);
  } catch (e) { next(e); }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await placementService.getStudentApplications(req.user.id);
    sendSuccess(res, { applications }, 'Student applications fetched.');
  } catch (e) { next(e); }
};

const getDriveApplications = async (req, res, next) => {
  try {
    const applications = await placementService.getDriveApplications(req.params.id);
    sendSuccess(res, { applications }, 'Drive applicants fetched.');
  } catch (e) { next(e); }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await placementService.updateApplicationStatus(req.params.id, req.body.status, req.body.notes);
    auditService.recordAudit({
      userId: req.user.id,
      action: 'APPLICATION_STATUS_UPDATE',
      entityType: 'APPLICATION',
      entityId: application.id,
      details: { status: req.body.status, studentId: application.studentId },
      req,
    });
    sendSuccess(res, { application }, 'Application status updated.');
  } catch (e) { next(e); }
};

const scheduleRound = async (req, res, next) => {
  try {
    const round = await placementService.scheduleRound(req.body);
    sendSuccess(res, { round }, 'Selection round scheduled.', 201);
  } catch (e) { next(e); }
};

const updateRoundStatus = async (req, res, next) => {
  try {
    const round = await placementService.updateRoundStatus(req.params.id, req.body);
    sendSuccess(res, { round }, 'Selection round status updated.');
  } catch (e) { next(e); }
};

const getOutcomes = async (req, res, next) => {
  try {
    const outcomes = await placementService.getPlacementOutcomes(req.user.id, req.user.role);
    sendSuccess(res, { outcomes }, 'Placement outcomes fetched.');
  } catch (e) { next(e); }
};

const recordOutcome = async (req, res, next) => {
  try {
    const outcome = await placementService.recordOutcome(req.body);
    auditService.recordAudit({
      userId: req.user.id,
      action: 'PLACEMENT_OUTCOME_UPDATE',
      entityType: 'PLACEMENT_OUTCOME',
      entityId: outcome.id,
      details: { studentId: outcome.studentId, companyId: outcome.companyId, packageOffered: outcome.packageOffered },
      req,
    });
    sendSuccess(res, { outcome }, 'Placement outcome recorded.', 201);
  } catch (e) { next(e); }
};

const getAllApplications = async (req, res, next) => {
  try {
    const applications = await placementService.getAllApplications(req.query);
    sendSuccess(res, { applications }, 'Applications fetched.');
  } catch (e) { next(e); }
};

module.exports = {
  getCompanies,
  getCompanyDetails,
  createCompany,
  getJobs,
  createJob,
  getDrives,
  getDriveDetails,
  createDrive,
  applyForDrive,
  getMyApplications,
  getDriveApplications,
  getAllApplications,
  updateApplicationStatus,
  scheduleRound,
  updateRoundStatus,
  getOutcomes,
  recordOutcome,
};
