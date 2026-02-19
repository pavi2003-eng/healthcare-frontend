import React, { useEffect, useState } from 'react';
import API from '../../api';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77'];

const Analytics = () => {
  const [riskData, setRiskData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [highRiskPatients, setHighRiskPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Risk distribution
        const riskRes = await API.get('/analytics/risk-summary');
        const formatted = Object.keys(riskRes.data).map(key => ({
          name: key,
          value: riskRes.data[key]
        }));
        setRiskData(formatted);

        // Vitals trend (last 7 days)
        const trendRes = await API.get('/analytics/vitals-trend');
        setTrendData(trendRes.data);

        // High-risk patients list
        const patientsRes = await API.get('/patients?critical=true');
        setHighRiskPatients(patientsRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard</h2>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Patient Risk Distribution</h3>
          <div className="flex justify-center">
            <PieChart width={400} height={300}>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

        {/* Vitals Trend Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Average Vitals (Last 7 Days)</h3>
          <LineChart width={400} height={300} data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgBP" stroke="#8884d8" name="BP" />
            <Line type="monotone" dataKey="avgGlucose" stroke="#82ca9d" name="Glucose" />
          </LineChart>
        </div>
      </div>

      {/* High‑Risk Patients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-medium p-4 border-b">High‑Risk Patients</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Glucose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {highRiskPatients.map(patient => (
              <tr key={patient._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.bloodPressure}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.glucoseLevel}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    High
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;