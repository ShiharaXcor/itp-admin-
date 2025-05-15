import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReturnAndRefundDashboard = () => {
  const [stats, setStats] = useState({
    returns: {},
    refunds: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await axios.get('http://localhost:4001/api/refunds/dashboard');
        setStats({
          returns: data.returns || {},  // null-safety added
          refunds: data.refunds || {},  // null-safety added
          loading: false,
          error: null
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  const processChartData = (labels, dataPoints, label, color) => ({
    labels,
    datasets: [{
      label,
      data: dataPoints,
      backgroundColor: color,
      borderColor: color.replace('0.5', '1'),
      borderWidth: 1
    }]
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Returns & Refunds Dashboard</h1>

      {stats.loading ? (
        <div className="text-center py-8">Loading dashboard data...</div>
      ) : stats.error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded">{stats.error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Returns Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Return Requests</h2>
            <div className="h-80">
              <Bar
                data={processChartData(
                  Object.keys(stats.returns || {}),
                  Object.values(stats.returns || {}),
                  'Return Status Distribution',
                  'rgba(79, 70, 229, 0.5)'
                )}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Refunds Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Refund Status</h2>
            <div className="h-80">
              <Bar
                data={processChartData(
                  Object.keys(stats.refunds || {}),
                  Object.values(stats.refunds || {}),
                  'Refund Status Distribution',
                  'rgba(16, 185, 129, 0.5)'
                )}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Total Returns</h3>
              <p className="text-2xl font-bold">
                {Object.values(stats.returns || {}).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Pending Refunds</h3>
              <p className="text-2xl font-bold">
                {(stats.refunds?.Pending) || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Completed Refunds</h3>
              <p className="text-2xl font-bold">
                {(stats.refunds?.Completed) || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Failed Refunds</h3>
              <p className="text-2xl font-bold">
                {(stats.refunds?.Failed) || 0}
              </p>
            </div>
            <div className="lg:col-span-2 mt-4">
                
                </div>

          </div>
        </div>
        
      )}
    </div>
  );
};

export default ReturnAndRefundDashboard;
