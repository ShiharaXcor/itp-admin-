import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, RefreshCw, CheckCircle, FileText } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReceiveProducts = () => {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const requestsRes = await axios.get('http://localhost:4001/api/purchases/requests?status=Pending');
        if (requestsRes.data.success) {
          setPurchaseRequests(requestsRes.data.requests);
        }

        const productsRes = await axios.get('http://localhost:4001/api/products/');
        if (productsRes.data.success) {
          setProducts(productsRes.data.products);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error('Failed to load data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);

    const newEntries = request.products.map(item => ({
      product: item.product._id || item.product,
      productName: item.product.name,
      requestedQuantity: item.requestedQuantity,
      quantityReceived: '',
      pricePerUnit: '',
      supplierName: '',
      purchaseRequest: request._id,
      notes: item.notes
    }));

    setEntries(newEntries);
  };

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const submitEntries = async () => {
    const validEntries = entries.filter(entry =>
      entry.product &&
      entry.quantityReceived &&
      entry.quantityReceived > 0 &&
      entry.pricePerUnit &&
      entry.pricePerUnit > 0
    );

    if (validEntries.length === 0) {
      toast.error('Please add at least one valid entry with quantity and price');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:4001/api/purchases/receive', {
        entries: validEntries
      });

      if (response.data.success) {
        toast.success('Products received and stock updated successfully!');

        setSelectedRequest(null);
        setEntries([]);

        const requestsRes = await axios.get('http://localhost:4001/api/purchases/requests?status=Pending');
        if (requestsRes.data.success) {
          setPurchaseRequests(requestsRes.data.requests);
        }
      }
    } catch (err) {
      console.error("Error submitting entries:", err);
      toast.error(`Failed to record deliveries: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addManualEntry = () => {
    setEntries([...entries, {
      product: '',
      productName: '',
      quantityReceived: '',
      pricePerUnit: '',
      supplierName: '',
      purchaseRequest: selectedRequest?._id || ''
    }]);
  };

  const removeEntry = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const getPurchaseRequestProducts = (request) => {
    if (!request.products || request.products.length === 0) return "No products";
  
    const productNames = request.products.map(item => {
      const product = item.product;
      if (product && product.name) {
        return product.name;
      }
      return "Unknown Product"; // Return a default name if product or its name is missing
    });
  
    if (productNames.length === 1) return productNames[0];
    return `${productNames[0]} + ${productNames.length - 1} more`;
  };
  

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="flex items-center mb-6 pb-4 border-b">
        <Package className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Record Supplier Delivery</h2>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center">
            <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mr-2" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Select Purchase Request
        </h3>

        {purchaseRequests.length > 0 ? (
          <div className="border rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseRequests.map(request => (
                  <tr
                    key={request._id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedRequest?._id === request._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getPurchaseRequestProducts(request)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.products.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRequestSelect(request)}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500 border">
            No pending purchase requests found
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Record Received Items
          </h3>

          <div className="mb-4 overflow-x-auto rounded-lg shadow border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Qty</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Qty</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Per Unit</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.requestedQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={entry.quantityReceived}
                        onChange={(e) => handleChange(index, 'quantityReceived', e.target.value)}
                        className="border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={entry.pricePerUnit}
                        onChange={(e) => handleChange(index, 'pricePerUnit', e.target.value)}
                        className="border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={entry.supplierName}
                        onChange={(e) => handleChange(index, 'supplierName', e.target.value)}
                        className="border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => removeEntry(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <button
              onClick={addManualEntry}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Entry
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={submitEntries}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Submit Entries
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiveProducts;
