/**
 * Career360 — Academic Controller (Phase 3)
 * Thin HTTP adapter for academic endpoints
 */

const academicService = require('../services/academic.service');
const auditService    = require('../services/audit.service');
const { sendSuccess } = require('../utils/apiResponse');

const getSemesters = async (req, res, next) => {
  try {
    const semesters = await academicService.getSemesters(req.user.id);
    sendSuccess(res, { semesters }, 'Semesters fetched successfully.');
  } catch (e) { next(e); }
};

const upsertSemester = async (req, res, next) => {
  try {
    const semester = await academicService.upsertSemester(req.user.id, req.body);
    auditService.recordAudit({
      userId: req.user.id,
      action: 'ACADEMIC_RECORD_UPDATE',
      entityType: 'ACADEMIC_SEMESTER',
      entityId: semester.id,
      details: { semesterNumber: semester.semesterNumber, sgpa: semester.sgpa },
      req,
    });
    sendSuccess(res, { semester }, 'Semester saved successfully.', 201);
  } catch (e) { next(e); }
};

const deleteSemester = async (req, res, next) => {
  try {
    await academicService.deleteSemester(req.user.id, req.params.id);
    sendSuccess(res, null, 'Semester deleted.');
  } catch (e) { next(e); }
};

const getSemesterDetails = async (req, res, next) => {
  try {
    const semester = await academicService.getSemesterDetails(req.user.id, req.params.id);
    sendSuccess(res, { semester }, 'Semester details fetched.');
  } catch (e) { next(e); }
};

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await academicService.getSubjects(req.query.departmentId);
    sendSuccess(res, { subjects }, 'Subjects fetched.');
  } catch (e) { next(e); }
};

const createSubject = async (req, res, next) => {
  try {
    const subject = await academicService.createSubject(req.body);
    sendSuccess(res, { subject }, 'Subject created.', 201);
  } catch (e) { next(e); }
};

const upsertSubjectRecord = async (req, res, next) => {
  try {
    const record = await academicService.upsertSubjectRecord(req.user.id, req.body);
    sendSuccess(res, { record }, 'Subject record saved.');
  } catch (e) { next(e); }
};

const deleteSubjectRecord = async (req, res, next) => {
  try {
    await academicService.deleteSubjectRecord(req.user.id, req.params.id);
    sendSuccess(res, null, 'Subject record deleted.');
  } catch (e) { next(e); }
};

const getAcademicSummary = async (req, res, next) => {
  try {
    const summary = await academicService.getAcademicSummary(req.user.id);
    sendSuccess(res, { summary }, 'Academic summary and insights fetched.');
  } catch (e) { next(e); }
};

module.exports = {
  getSemesters,
  upsertSemester,
  deleteSemester,
  getSemesterDetails,
  getSubjects,
  createSubject,
  upsertSubjectRecord,
  deleteSubjectRecord,
  getAcademicSummary,
};
