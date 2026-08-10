import { reportsService } from '../services/reportsService.js';

/**
 * Controller for Generating Dynamic CSV/PDF Export Report Data
 * GET /api/reports/generateReport or POST /api/reports/generateReport
 */
export const generateReport = async (req, res) => {
  try {
    const reportData = await reportsService.generateReport(
      req.user._id,
      req.user,
      req.body,
      req.query
    );

    const type = (req.body.type || req.query.type || 'expense').toUpperCase();

    return res.status(200).json({
      success: true,
      message: `${type} report generated successfully`,
      data: reportData,
    });
  } catch (error) {
    console.error('Error in generateReport controller:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate report',
    });
  }
};
