import { dashboardService } from '../services/dashboardService.js';

/**
 * Controller for Fetching Complete Dashboard Summary
 * GET /api/dashboard/getSummary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const summary = await dashboardService.getDashboardSummary(
      req.user._id,
      req.query.year,
      req.query.month
    );

    return res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    console.error('Error in getDashboardSummary controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard summary',
    });
  }
};
