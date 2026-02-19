import React, { useEffect, useState } from 'react';
import API from '../../api';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await API.get('/departments');
        setDepartments(res.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        // Fallback to specialties list from screenshot
        setDepartments([
          { name: 'Allergy and immunology' },
          { name: 'Anesthesiology' },
          { name: 'Dermatology' },
          { name: 'Diagnostic radiology' },
          { name: 'Emergency medicine' },
          { name: 'Neurology' },
          { name: 'Medical genetics' },
          { name: 'Nuclear medicine' },
          { name: 'Obstetrics and gynecology' },
          { name: 'Ophthalmology' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Doctor Dashboard &gt; Department List</h2>
      <div className="bg-white p-4 rounded shadow max-w-md">
        <h3 className="font-bold mb-2">Specialty</h3>
        <ul className="space-y-1">
          {departments.map((dept, i) => (
            <li key={i} className="p-2 hover:bg-gray-100 cursor-pointer border-b">{dept.name}</li>
          ))}
        </ul>
        <div className="flex gap-1 mt-4">
          <button className="px-3 py-1 border rounded">First</button>
          <button className="px-3 py-1 border rounded">Previous</button>
          <button className="px-3 py-1 border rounded">Next</button>
          <button className="px-3 py-1 border rounded">Last</button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">Made with DrapCode</p>
    </div>
  );
};

export default DepartmentList;