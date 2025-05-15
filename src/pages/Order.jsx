import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Company details for PDF export
  const companyDetails = {
    name: "INVEXA",
    address: "No.123, Malabe Road, Colombo, Sri Lanka",
    phone: "0769137840",
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      setError("Failed to fetch orders");
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${backendUrl}/api/orders/${orderId}/status`, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    }
  };

  const exportToPDF = (order) => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text(companyDetails.name, 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(companyDetails.address, 105, 27, { align: "center" });
    doc.text(companyDetails.phone, 105, 32, { align: "center" });
    
    doc.line(20, 35, 190, 35);
    
    // Order details
    doc.setFontSize(14);
    doc.text("Order Details", 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Order ID: ${order._id}`, 20, 55);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 62);
    doc.text(`Customer: ${order.fname} ${order.lname}`, 20, 69);
    doc.text(`Email: ${order.email}`, 20, 76);
    doc.text(`Phone: ${order.phone}`, 20, 83);
    doc.text(`Status: ${order.status}`, 20, 90);
    
    // Order items table (if available)
    if (order.items && order.items.length > 0) {
      doc.text("Order Items:", 20, 100);
      
      const tableColumn = ["Item", "Quantity", "Price", "Total"];
      const tableRows = order.items.map(item => [
        item.name || "Product",
        item.quantity || 1,
        `Rs ${item.price || 0}`,
        `Rs ${(item.price * item.quantity) || 0}`
      ]);
      
      doc.autoTable({
        startY: 105,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9 }
      });
    }
    
    // Add total at the bottom
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 110;
    doc.text(`Total Amount: Rs ${order.totalAmount}`, 150, finalY, { align: "right" });
    
    // Footer
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    
    // Save the PDF
    doc.save(`INVEXA_Order_${order._id}.pdf`);
  };

  const viewOrderDetails = (orderId) => {
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
        <div className="flex gap-2">
          <button 
            onClick={fetchOrders}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3 text-left">Customer Details</th>
                <th className="px-4 py-3 text-left">Order Info</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{order.fname} {order.lname}</div>
                      <div className="text-sm text-gray-600">{order.email}</div>
                      <div className="text-sm text-gray-600">{order.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <span className="font-medium">Order Date:</span> {new Date(order.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        Rs {order.totalAmount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          order.status === "Delivered" ? "bg-green-500" :
                          order.status === "Shipped" ? "bg-blue-500" :
                          order.status === "Ready To Ship" ? "bg-yellow-500" : "bg-gray-500"
                        }`}></div>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="border p-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        >
                          <option value="Order Received">Order Received</option>
                          <option value="Ready To Ship">Ready To Ship</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => viewOrderDetails(order._id)} 
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                        >
                          {selectedOrderId === order._id ? 'Hide Details' : 'View Details'}
                        </button>
                        <button 
                          onClick={() => exportToPDF(order)} 
                          className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                  {selectedOrderId === order._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-800 mb-2">Order Details</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p><span className="font-medium">Order ID:</span> {order._id}</p>
                              <p><span className="font-medium">Date:</span> {new Date(order.date).toLocaleString()}</p>
                              <p><span className="font-medium">Status:</span> {order.status}</p>
                              <p><span className="font-medium">Total Amount:</span> Rs {order.totalAmount}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Customer:</span> {order.fname} {order.lname}</p>
                              <p><span className="font-medium">Email:</span> {order.email}</p>
                              <p><span className="font-medium">Phone:</span> {order.phone}</p>
                              {order.address && <p><span className="font-medium">Address:</span> {order.address}</p>}
                            </div>
                          </div>
                          
                          {order.items && order.items.length > 0 && (
                            <div className="mt-4">
                              <div className="font-medium text-gray-800 mb-2">Order Items</div>
                              <div className="bg-white rounded overflow-hidden border">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {order.items.map((item, index) => (
                                      <tr key={index}>
                                        <td className="px-4 py-2">{item.name || "Product"}</td>
                                        <td className="px-4 py-2">{item.quantity || 1}</td>
                                        <td className="px-4 py-2">Rs {item.price || 0}</td>
                                        <td className="px-4 py-2">Rs {(item.price * item.quantity) || 0}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Order;