import React, { useEffect } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const RFMAnalysis = () => {
  const { 
    isDataUploaded, 
    rfmData, 
    loading, 
    error,
    setLoading, 
    setError, 
    setRFMData 
  } = useApp();

  useEffect(() => {
    if (isDataUploaded && !rfmData) {
      fetchRFMData();
    }
  }, [isDataUploaded, rfmData]);

  const fetchRFMData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRFMAnalysis();
      setRFMData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch RFM data');
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
        <p className="text-gray-600">Loading RFM analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="text-red-800">
          <h3 className="font-medium">Error loading RFM data</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const rfmChartData = rfmData?.rfm_data?.map(customer => ({
    CustomerID: customer.CustomerID,
    Recency: customer.Recency,
    Frequency: customer.Frequency,
    Monetary: customer.Monetary,
    Cluster: customer.Cluster
  })) || [];

  const clusterColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">RFM Analysis</h1>
        <p className="mt-2 text-gray-600">
          Customer behavior analysis using Recency, Frequency, and Monetary metrics
        </p>
      </div>

      {rfmData && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Customers</h3>
              <p className="text-3xl font-bold text-primary-600">
                {formatNumber(rfmData.total_customers)}
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Clusters</h3>
              <p className="text-3xl font-bold text-green-600">
                {rfmData.clusters?.length || 0}
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Avg Frequency</h3>
              <p className="text-3xl font-bold text-orange-600">
                {rfmData.rfm_data ? 
                  (rfmData.rfm_data.reduce((sum, c) => sum + c.Frequency, 0) / rfmData.rfm_data.length).toFixed(1) : 
                  0
                }
              </p>
            </div>
          </div>

          {/* RFM Scatter Plot */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              RFM Distribution by Customer Clusters
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={rfmChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="Recency" 
                    name="Recency (Days)"
                    label={{ value: 'Recency (Days)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    dataKey="Monetary" 
                    name="Monetary Value"
                    label={{ value: 'Monetary Value ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Monetary Value') return [formatCurrency(value), name];
                      return [value, name];
                    }}
                    labelFormatter={(value) => `Customer ID: ${value}`}
                  />
                  {rfmData.clusters?.map((cluster, index) => (
                    <Scatter
                      key={cluster}
                      name={`Cluster ${cluster}`}
                      data={rfmChartData.filter(d => d.Cluster === cluster)}
                      fill={clusterColors[index % clusterColors.length]}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cluster Statistics */}
          {rfmData.cluster_statistics && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cluster Statistics
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cluster
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Recency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Monetary
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rfmData.cluster_statistics.map((stat, index) => (
                      <tr key={stat.Cluster} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: clusterColors[index % clusterColors.length] }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              Cluster {stat.Cluster}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.CustomerID_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.Recency_mean} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.Frequency_mean}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(stat.Monetary_mean)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Frequency Distribution */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Frequency Distribution by Cluster
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rfmData.cluster_statistics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Cluster" label={{ value: 'Cluster', position: 'insideBottom', offset: -10 }} />
                  <YAxis label={{ value: 'Average Frequency', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar 
                    dataKey="Frequency_mean" 
                    fill="#3B82F6" 
                    name="Average Frequency"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RFMAnalysis;