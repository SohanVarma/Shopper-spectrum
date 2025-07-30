import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ShoppingCartIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const Dashboard = () => {
  const { 
    isDataUploaded, 
    analyticsData, 
    loading, 
    error,
    setLoading, 
    setError, 
    setAnalyticsData 
  } = useApp();

  useEffect(() => {
    if (isDataUploaded && !analyticsData) {
      fetchAnalyticsData();
    }
  }, [isDataUploaded, analyticsData]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAnalyticsSummary();
      setAnalyticsData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch analytics data');
    }
  };

  if (!isDataUploaded) {
    return (
      <div className="text-center py-12">
        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data uploaded</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by uploading your customer data CSV file.
        </p>
        <div className="mt-6">
          <Link to="/upload" className="btn-primary">
            Upload Data
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const stats = analyticsData ? [
    {
      name: 'Total Customers',
      value: formatNumber(analyticsData.total_customers),
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Products',
      value: formatNumber(analyticsData.total_products),
      icon: ShoppingCartIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Orders',
      value: formatNumber(analyticsData.total_orders),
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Average Order Value',
      value: formatCurrency(analyticsData.average_order_value),
      icon: CurrencyDollarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your customer analytics and insights
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="text-red-800">
            <h3 className="font-medium">Error loading data</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {analyticsData && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.name} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Date Range */}
          {analyticsData.date_range && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Period</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">From:</span>{' '}
                  {new Date(analyticsData.date_range.start).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">To:</span>{' '}
                  {new Date(analyticsData.date_range.end).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/rfm-analysis"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-8 w-8 text-primary-600 mb-2" />
                <h4 className="font-medium text-gray-900">RFM Analysis</h4>
                <p className="text-sm text-gray-600">
                  Analyze customer behavior patterns
                </p>
              </Link>
              
              <Link
                to="/customer-segments"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserGroupIcon className="h-8 w-8 text-primary-600 mb-2" />
                <h4 className="font-medium text-gray-900">Customer Segments</h4>
                <p className="text-sm text-gray-600">
                  View customer segmentation results
                </p>
              </Link>

              <Link
                to="/recommendations"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingCartIcon className="h-8 w-8 text-primary-600 mb-2" />
                <h4 className="font-medium text-gray-900">Product Recommendations</h4>
                <p className="text-sm text-gray-600">
                  Get product recommendation insights
                </p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;