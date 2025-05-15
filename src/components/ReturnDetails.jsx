import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ReturnDetails = () => {
  const { id } = useParams();
  const [returnReq, setReturnReq] = useState(null);
  const [status, setStatus] = useState('');
  const [refundStatus, setRefundStatus] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const fetchReturn = async () => {
      try {
        const res = await axios.get(`http://localhost:4001/api/refunds/returns/${id}`);
        console.log('Fetched return:', res.data);
        setReturnReq(res.data);
        setStatus(res.data.status);
        if (res.data.refund) {
          setRefundStatus(res.data.refund.status);
        }
      } catch (error) {
        console.error('Error fetching return:', error);
      }
    };

    fetchReturn();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      console.log('Sending status update:', status);
      const res = await axios.put(
        `http://localhost:4001/api/refunds/returns/${id}/status`,
        { status },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Updated return:', res.data);
      setReturnReq(res.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRefundUpdate = async () => {
    try {
      await axios.put(`http://localhost:4001/api/refunds/refunds/${returnReq.refund._id}`, {
        status: refundStatus,
        transactionId
      });
      const res = await axios.get(`http://localhost:4001/api/refunds/returns/${id}`);
      setReturnReq(res.data);
    } catch (error) {
      console.error('Error updating refund:', error);
    }
  };

  if (!returnReq) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Return Details</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-semibold">Order ID:</p>
            <p>{returnReq.order?._id}</p>
          </div>
          <div>
            <p className="font-semibold">Current Status:</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Update Status
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Return Items</h3>
          <div className="space-y-2">
            {returnReq.items.map((item, index) => (
              <div key={index} className="border p-3 rounded">
                <p className="font-medium">{item.name}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Reason: {item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Evidence Photos</h3>
          <div className="grid grid-cols-3 gap-4">
            {returnReq.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Evidence ${index + 1}`}
                className="rounded-lg shadow-sm h-32 object-cover"
              />
            ))}
          </div>
        </div>

        {returnReq.refund && (
          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold mb-2">Refund Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Amount:</p>
                <p>${returnReq.refund.amount}</p>
              </div>
              <div>
                <p className="font-semibold">Refund Status:</p>
                <select
                  value={refundStatus}
                  onChange={(e) => setRefundStatus(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div>
                <p className="font-semibold">Transaction ID:</p>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Enter transaction ID"
                />
              </div>
            </div>
            <button
              onClick={handleRefundUpdate}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              Update Refund
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnDetails;
