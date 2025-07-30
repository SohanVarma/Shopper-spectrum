import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const CustomerSegments = () => {
  const { 
    isDataUploaded, 
    customerSegments, 
    loading, 
    error,
    setLoading, 
    setError, 
    setCustomerSegments 
  } = useApp();

  useEffect(() => {
    if (isDataUploaded && !customerSegments) {
      fetchCustomerSegments();
    }
  }, [isDataUploaded, customerSegments]);

  const fetchCustomerSegments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCustomerSegments();
      setCustomerSegments(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch customer segments');
    }
  };

  if (!isDataUploaded) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No data available</h3>
        <p className="text-gray-600">Please upload customer data first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading customer segments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="text-red-800">
          <h3 className="font-medium">Error loading customer segments</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const segmentColors = {
    'Champions': '#10B981',
    'Loyal Customers': '#3B82F6',
    'Potential Loyalists': '#F59E0B',
    'New Customers': '#8B5CF6',
    'At Risk': '#F97316',
    'Lost Customers': '#EF4444'
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getSegmentDescription = (segment) => {
    const descriptions = {
      'Champions': 'Recent customers with high frequency and monetary value. Your best customers.',
      'Loyal Customers': 'Recent customers with high engagement. Focus on retention.',
      'Potential Loyalists': 'Recent customers with good monetary value. Nurture for loyalty.',
      'New Customers': 'Recent but lower engagement. Perfect for onboarding campaigns.',
      'At Risk': 'Customers who haven\'t purchased recently. Require re-engagement.',
      'Lost Customers': 'Haven\'t purchased in a long time. Consider win-back campaigns.'
    };
    return descriptions[segment] || 'Customer segment analysis';
  };

  const getSegmentIcon = (segment) => {
    const icons = {
      'Champions': '👑',
      'Loyal Customers': '💎',
      'Potential Loyalists': '⭐',
      'New Customers': '🌱',
      'At Risk': '⚠️',
      'Lost Customers': '😴'
    };
    return icons[segment] || '👤';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Segments</h1>
        <p className="mt-2 text-gray-600">
          Customer segmentation based on RFM analysis and behavior patterns
        </p>
      </div>

      {customerSegments && (
        <>
          {/* Segment Distribution Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Segment Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerSegments.segment_statistics}
                      dataKey="Customer_Count"
                      nameKey="Segment"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {customerSegments.segment_statistics.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={segmentColors[entry.Segment] || '#6B7280'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [formatNumber(value), 'Customers']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Segment Value Analysis */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Average Monetary Value by Segment
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerSegments.segment_statistics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="Segment" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Avg Monetary Value']}
                    />
                    <Bar dataKey="Avg_Monetary">
                      {customerSegments.segment_statistics.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={segmentColors[entry.Segment] || '#6B7280'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Segment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {customerSegments.segment_statistics.map((segment) => (
              <div 
                key={segment.Segment} 
                className="card border-l-4" 
                style={{ borderLeftColor: segmentColors[segment.Segment] }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">
                        {getSegmentIcon(segment.Segment)}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {segment.Segment}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {getSegmentDescription(segment.Segment)}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Customers</p>
                        <p className="font-semibold text-gray-900">
                          {formatNumber(segment.Customer_Count)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Value</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(segment.Avg_Monetary)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Recency</p>
                        <p className="font-semibold text-gray-900">
                          {Math.round(segment.Avg_Recency)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Frequency</p>
                        <p className="font-semibold text-gray-900">
                          {segment.Avg_Frequency.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Table */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Segment Statistics Table
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Recency (Days)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Monetary Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerSegments.segment_statistics.map((segment, index) => {
                    const totalCustomers = customerSegments.segment_statistics.reduce(
                      (sum, s) => sum + s.Customer_Count, 0
                    );
                    const percentage = ((segment.Customer_Count / totalCustomers) * 100).toFixed(1);
                    
                    return (
                      <tr key={segment.Segment} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: segmentColors[segment.Segment] }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {segment.Segment}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(segment.Customer_Count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {percentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Math.round(segment.Avg_Recency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {segment.Avg_Frequency.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(segment.Avg_Monetary)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerSegments;