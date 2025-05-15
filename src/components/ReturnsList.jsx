import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ReturnsList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await axios.get('http://localhost:4001/api/refunds/returns');
        setReturns(res.data);
      } catch (error) {
        console.error('Error fetching returns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Returns</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {returns.map(ret => (
              <tr key={ret._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ret.order?._id.slice(-8) || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ret.status)}`}>
                    {ret.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ret.items.length} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/admin/returns/${ret._id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReturnsList;