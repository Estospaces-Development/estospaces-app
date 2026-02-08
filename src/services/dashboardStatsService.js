/**
 * Dashboard Stats Service
 * Returns mock data for dashboard statistics (no backend API calls)
 */

/**
 * Fetch dashboard statistics for manager dashboard
 */
export const getDashboardStats = async () => {
  return {
    data: {
      monthlyRevenue: '45250.00',
      monthlyRevenueChange: '+12.5%',
      activeProperties: 12,
      activeListingsChange: '+2',
      totalViews: '3,450',
      totalViewsChange: '+18.2%',
      conversionRate: '2.8%',
      conversionRateChange: '+0.4%',
      activeLeads: 24,
      totalApplications: 45,
    },
    error: null,
  };
};

/**
 * Fetch statistics for Welcome Banner (simplified)
 */
export const getWelcomeBannerStats = async () => {
  return {
    data: {
      activeProperties: 12,
      activeLeads: 24,
      totalApplications: 45,
    },
    error: null,
  };
};
