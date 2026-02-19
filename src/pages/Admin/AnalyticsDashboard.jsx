import React, { useEffect, useState } from 'react';
import API from '../../api';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = () => {
  const [riskData, setRiskData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/analytics/risk-summary');
        setRiskData(res.data.riskDistribution);
        setTimelineData(res.data.timeline);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center p-8">Loading Analytics...</div>;

  const pieColors = ['#FF8042', '#FFBB28', '#00C49F'];

  // Calculate total patients
  const totalPatients = (riskData?.high || 0) + (riskData?.moderate || 0) + (riskData?.low || 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard</h2>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">Total Patients</p>
          <p className="text-3xl font-bold">{totalPatients}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">High Risk</p>
          <p className="text-3xl font-bold text-red-600">{riskData?.high || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">Moderate Risk</p>
          <p className="text-3xl font-bold text-yellow-600">{riskData?.moderate || 0}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'High Risk', value: riskData?.high || 0 },
                  { name: 'Moderate Risk', value: riskData?.moderate || 0 },
                  { name: 'Low Risk', value: riskData?.low || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieColors.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BP/Glucose Trend Line */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Average Vitals (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgBP" stroke="#8884d8" name="Avg BP" />
              <Line type="monotone" dataKey="avgGlucose" stroke="#82ca9d" name="Avg Glucose" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;