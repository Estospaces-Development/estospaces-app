import { TrendingUp, Building2, Users, Target, DollarSign, Calendar } from 'lucide-react';
import BarChart from '../components/ui/BarChart';
import BackButton from '../components/ui/BackButton';

const Analytics = () => {
  const monthlyRevenue = [
    { month: 'Jan', value: 15000, change: 0 },
    { month: 'Feb', value: 18000, change: 20 },
    { month: 'Mar', value: 22000, change: 22.2 },
    { month: 'Apr', value: 25000, change: 13.6 },
    { month: 'May', value: 28000, change: 12 },
    { month: 'Jun', value: 32000, change: 14.3 },
  ];

  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.value, 0);
  const averageRevenue = totalRevenue / monthlyRevenue.length;
  const highestMonth = monthlyRevenue.reduce((max, item) => (item.value > max.value ? item : max), monthlyRevenue[0]);
  const growthRate = ((monthlyRevenue[monthlyRevenue.length - 1].value - monthlyRevenue[0].value) / monthlyRevenue[0].value) * 100;

  const propertyPerformance = [
    {
      property: 'Modern Downtown Apartment',
      apartment: 45,
      application: 12,
      conversionRate: 26.7,
    },
    {
      property: 'Luxury Condo with City View',
      apartment: 38,
      application: 8,
      conversionRate: 21.1,
    },
    {
      property: 'Spacious Penthouse',
      apartment: 52,
      application: 15,
      conversionRate: 28.8,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Analytics</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">247</h3>
          <p className="text-sm text-gray-600">Total Leads</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">120</h3>
          <p className="text-sm text-gray-600">Total Properties</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">14.7%</h3>
          <p className="text-sm text-gray-600">Conversion Rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">18.2%</h3>
          <p className="text-sm text-gray-600">Growth Rate</p>
        </div>
      </div>

      {/* Monthly Revenue Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Monthly Revenue Trend</h2>
            <p className="text-sm text-gray-600">Track your revenue performance over time</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">+{growthRate.toFixed(1)}% Growth</span>
            </div>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600">Total Revenue</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">${(totalRevenue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Average Monthly</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">${(averageRevenue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-gray-500 mt-1">Per month average</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Best Month</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{highestMonth.month}</p>
            <p className="text-xs text-gray-500 mt-1">${(highestMonth.value / 1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* Enhanced Bar Chart */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <BarChart
            data={monthlyRevenue.map((item) => ({
              label: item.month,
              value: item.value,
              color: '#FF6B35',
            }))}
            height={300}
            showValues={true}
          />
        </div>

        {/* Monthly Details Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyRevenue.map((item, index) => {
                const previousValue = index > 0 ? monthlyRevenue[index - 1].value : item.value;
                const change = index > 0 ? ((item.value - previousValue) / previousValue) * 100 : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{item.month}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ${item.value.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {index > 0 && (
                        <span
                          className={`text-sm font-medium ${
                            change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {change >= 0 ? '+' : ''}
                          {change.toFixed(1)}%
                        </span>
                      )}
                      {index === 0 && (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {index > 0 && (
                        <div className="flex items-center gap-1">
                          {change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                          )}
                          <span
                            className={`text-xs ${
                              change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {change >= 0 ? 'Up' : 'Down'}
                          </span>
                        </div>
                      )}
                      {index === 0 && (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apartment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {propertyPerformance.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.property}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.apartment}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.application}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${item.conversionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{item.conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Analytic */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Analytic</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Leads</span>
              <span className="text-lg font-semibold text-gray-800">247</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Properties</span>
              <span className="text-lg font-semibold text-gray-800">120</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-lg font-semibold text-gray-800">14.7%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Passed</span>
              <span className="text-lg font-semibold text-gray-800">36</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
