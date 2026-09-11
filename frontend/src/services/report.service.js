import api from './api';

export const reportService = {
  /**
   * Get verified student placement CV dataset
   */
  async getStudentCV(studentId = null) {
    const url = studentId ? `/reports/student-cv/${studentId}` : '/reports/student-cv';
    const res = await api.get(url);
    return res.data?.data;
  },

  /**
   * Get student official academic transcript dataset
   */
  async getAcademicTranscript(studentId = null) {
    const url = studentId ? `/reports/transcript/${studentId}` : '/reports/transcript';
    const res = await api.get(url);
    return res.data?.data;
  },

  /**
   * Get institutional placement summary report
   */
  async getPlacementSummary() {
    const res = await api.get('/reports/placement-summary');
    return res.data?.data;
  },

  /**
   * Trigger CSV download for roster or placements
   */
  async downloadCSV(type = 'roster') {
    const response = await api.get('/reports/export-csv', {
      params: { type },
      responseType: 'blob',
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `career360-${type}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reportService;
