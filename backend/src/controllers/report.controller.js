/**
 * Career360 — Advanced Reporting Controller (Phase 7)
 */

const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/apiResponse');

const getStudentCV = async (req, res, next) => {
  try {
    const studentId = (['FACULTY', 'PLACEMENT_COORDINATOR', 'ADMIN'].includes(req.user.role) && req.params.studentId)
      ? req.params.studentId
      : req.user.id;

    const report = await reportService.getStudentCVReport(studentId);
    sendSuccess(res, report, 'Student CV report generated.');
  } catch (e) { next(e); }
};

const getAcademicTranscript = async (req, res, next) => {
  try {
    const studentId = (['FACULTY', 'PLACEMENT_COORDINATOR', 'ADMIN'].includes(req.user.role) && req.params.studentId)
      ? req.params.studentId
      : req.user.id;

    const report = await reportService.getAcademicTranscriptReport(studentId);
    sendSuccess(res, report, 'Academic transcript generated.');
  } catch (e) { next(e); }
};

const getPlacementSummary = async (req, res, next) => {
  try {
    const report = await reportService.getPlacementSummaryReport();
    sendSuccess(res, report, 'Placement summary report generated.');
  } catch (e) { next(e); }
};

const exportCSV = async (req, res, next) => {
  try {
    const type = req.query.type || 'roster';
    const csvData = await reportService.exportCSV(type);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="career360-${type}-${Date.now()}.csv"`);
    res.send(csvData);
  } catch (e) { next(e); }
};

module.exports = {
  getStudentCV,
  getAcademicTranscript,
  getPlacementSummary,
  exportCSV,
};
