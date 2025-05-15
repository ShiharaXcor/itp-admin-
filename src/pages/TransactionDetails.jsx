import { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";

const TransactionDetails = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint =
          activeTab === "sales"
            ? "http://localhost:4001/api/analytics/sales"
            : "http://localhost:4001/api/analytics/purchases";

        const { data: response } = await axios.get(endpoint, {
          params: { page: pagination.currentPage },
        });

        setData(response.data);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
        });
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, pagination.currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Header with Tabs */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Transaction Details</h2>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => {
                    setActiveTab("sales");
                    setPagination({ currentPage: 1, totalPages: 1 });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeTab === "sales"
                      ? "bg-white shadow-sm text-gray-800"
                      : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Sales
                </button>
                <button
                  onClick={() => {
                    setActiveTab("purchases");
                    setPagination({ currentPage: 1, totalPages: 1 });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeTab === "purchases"
                      ? "bg-white shadow-sm text-gray-800"
                      : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Purchases
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {activeTab === "sales" ? (
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Received</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr
                        key={activeTab === "sales" ? item.orderId : item.productId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {activeTab === "sales" ? (
                          <>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 font-mono">
                              #{item.orderId || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.date ? format(parseISO(item.date), "dd MMM yyyy") : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              Rs.{item.amount?.toLocaleString() ?? "0"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${item.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"}`}
                              >
                                {item.status || "unknown"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                              {item.paymentMethod || "N/A"}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 font-mono">
                              #{item.productId || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.productName || "Unnamed Product"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.dateReceived
                                ? format(parseISO(item.dateReceived), "dd MMM yyyy")
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {item.quantity ?? 0}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              Rs.{item.totalCost?.toLocaleString() ?? "0"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: prev.currentPage - 1,
                          }))
                        }
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: prev.currentPage + 1,
                          }))
                        }
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
