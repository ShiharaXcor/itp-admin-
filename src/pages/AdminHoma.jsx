import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  Legend, Cell, PieChart, Pie, LineChart, Line 
} from "recharts";
import { Download, FileText, Printer, RotateCcw, TrendingUp } from "lucide-react";

const AdminHome = () => {
  // States
  const [stockData, setStockData] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSection, setActiveSection] = useState("inventory");

  // Company information
  const companyInfo = {
    name: "INVEXA",
    address: "No.123, Malabe Road, Colombo, Sri Lanka",
    phone: "0769137840"
  };

  useEffect(() => {
    fetchStockData();
    fetchFinancialSummary();
  }, []);

  // Stock data fetch
  const fetchStockData = async () => {
    setStockLoading(true);
    try {
      const res = await axios.get('http://localhost:4001/api/dashboard/stock');
      if (res.data.success) {
        setStockData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch stock data.");
    } finally {
      setStockLoading(false);
    }
  };

  // Financial data fetch
  const fetchFinancialSummary = async () => {
    setFinancialLoading(true);
    try {
      const { data } = await axios.get("http://localhost:4001/api/analytics/summary");
      setFinancialSummary(data);
    } catch (error) {
      console.error("Failed to load financial summary", error);
    } finally {
      setFinancialLoading(false);
    }
  };

  const safeToFixed = (value, decimalPlaces = 2) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return value.toFixed(decimalPlaces);
  };

  const safeGet = (obj, path, defaultValue = 0) => {
    if (!obj) return defaultValue;
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) break;
    }
    return result ?? defaultValue;
  };

  // BAR CHART COLOR FUNCTION
  const getBarColor = (entry) => {
    const quantity = entry.quantity;
    if (quantity < 50) return '#ef4444';
    if (quantity < 100) return '#f59e0b';
    return '#10b981';
  };

  // Pie chart data based on stock quantity
  const pieData = stockData.length ? [
    { name: 'Low Quantity (0-50)', value: stockData.filter(item => item.quantity < 50).length },
    { name: 'Medium Quantity (51-100)', value: stockData.filter(item => item.quantity >= 50 && item.quantity < 100).length },
    { name: 'High Quantity (100+)', value: stockData.filter(item => item.quantity >= 100).length }
  ] : [];

  // Financial chart data
  const financialChartData = financialSummary ? [
    { name: "Today", Sales: safeGet(financialSummary, "daily.sales"), Purchases: safeGet(financialSummary, "daily.purchases"), Profit: safeGet(financialSummary, "daily.profit") },
    { name: "Month", Sales: safeGet(financialSummary, "monthly.sales"), Purchases: safeGet(financialSummary, "monthly.purchases"), Profit: safeGet(financialSummary, "monthly.profit") },
    { name: "Year", Sales: safeGet(financialSummary, "yearly.sales"), Purchases: safeGet(financialSummary, "yearly.purchases"), Profit: safeGet(financialSummary, "yearly.profit") },
  ] : [];

  // Trend data
  const trendData = financialSummary ? [
    { name: "Jan", Profit: 12000 },
    { name: "Feb", Profit: 19000 },
    { name: "Mar", Profit: 17000 },
    { name: "Apr", Profit: 21000 },
    { name: "May", Profit: 24000 },
    { name: "Jun", Profit: 28000 },
    { name: "Jul", Profit: 32000 },
    { name: "Aug", Profit: 29000 },
    { name: "Sep", Profit: 35000 },
    { name: "Oct", Profit: 40000 },
    { name: "Nov", Profit: 38000 },
    { name: "Dec", Profit: safeGet(financialSummary, "yearly.profit") / 12 },
  ] : [];

  // Export functions
  const downloadCSV = () => {
    if (!financialSummary) return;
    
    const rows = [
      ["Period", "Sales (Rs.)", "Purchases (Rs.)", "Profit (Rs.)"],
      ["Daily", safeGet(financialSummary, "daily.sales"), safeGet(financialSummary, "daily.purchases"), safeGet(financialSummary, "daily.profit")],
      ["Monthly", safeGet(financialSummary, "monthly.sales"), safeGet(financialSummary, "monthly.purchases"), safeGet(financialSummary, "monthly.profit")],
      ["Yearly", safeGet(financialSummary, "yearly.sales"), safeGet(financialSummary, "yearly.purchases"), safeGet(financialSummary, "yearly.profit")],
    ];

    const csvContent = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "INVEXA_financial_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("CSV exported successfully!");
  };

  const downloadPDF = () => {
    alert("PDF export functionality would be implemented here");
    // Note: jsPDF implementation would be added here in a real application
  };

  const printSummary = () => {
    window.print();
  };

  // Loading state
  if (stockLoading && financialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <div className="ml-2">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp size={32} className="text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Invexa Wholesale Dashboard</h1>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { fetchStockData(); fetchFinancialSummary(); }}
                className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <RotateCcw size={16} />
                <span className="hidden md:inline">Refresh</span>
              </button>
              <button
                onClick={printSummary}
                className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <Printer size={16} />
                <span className="hidden md:inline">Print</span>
              </button>
              <button
                onClick={downloadCSV}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <FileText size={16} />
                <span className="hidden md:inline">CSV</span>
              </button>
              <button
                onClick={downloadPDF}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <Download size={16} />
                <span className="hidden md:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeSection === "inventory" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveSection("inventory")}
          >
            Inventory Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeSection === "financial" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveSection("financial")}
          >
            Financial Dashboard
          </button>
        </div>

        {/* Inventory Section */}
        {activeSection === "inventory" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Inventory Management Dashboard</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-blue-600">{stockData.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Total Items</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stockData.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Total Inventory Value</h3>
                <p className="text-3xl font-bold text-purple-600">
                  Rs. {safeToFixed(stockData.reduce((sum, item) => sum + item.totalValue, 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Product Quantity Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                      <Legend />
                      <Bar dataKey="quantity" name="Inventory Quantity" radius={[4, 4, 0, 0]}>
                        {stockData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Product Quantity Breakdown</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        <Cell fill="#ef4444" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} products`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Section */}
        {activeSection === "financial" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Financial Analysis Dashboard</h2>
            
            {/* Financial Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === "details" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("details")}
              >
                Detailed Analysis
              </button>
            </div>
            
            {activeTab === "overview" && financialSummary && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { period: "daily", title: "Today's Summary", icon: "📅", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
                    { period: "monthly", title: "Monthly Summary", icon: "📆", color: "bg-gradient-to-br from-green-500 to-green-600" },
                    { period: "yearly", title: "Yearly Summary", icon: "📊", color: "bg-gradient-to-br from-purple-500 to-purple-600" }
                  ].map((item) => (
                    <div
                      key={item.period}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className={`${item.color} px-6 py-4 text-white`}>
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <span className="text-2xl">{item.icon}</span>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Sales</p>
                          <p className="text-xl font-medium text-green-600">
                            Rs.{safeGet(financialSummary, `${item.period}.sales`).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Purchases</p>
                          <p className="text-xl font-medium text-orange-600">
                            Rs.{safeGet(financialSummary, `${item.period}.purchases`).toLocaleString()}
                          </p>
                        </div>
                        <div className="h-px bg-gray-200 my-2"></div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-700">Profit</p>
                          <p className="text-xl font-bold text-blue-600">
                            Rs.{safeGet(financialSummary, `${item.period}.profit`).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Financial Performance Comparison</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financialChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                          <YAxis tick={{ fill: '#6b7280' }} />
                          <Tooltip
                            contentStyle={{
                              background: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`Rs. ${value.toLocaleString()}`, undefined]}
                          />
                          <Legend wrapperStyle={{ paddingTop: 20 }} />
                          <Bar
                            dataKey="Sales"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            name="Total Sales"
                          />
                          <Bar
                            dataKey="Purchases"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                            name="Total Purchases"
                          />
                          <Bar
                            dataKey="Profit"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            name="Net Profit"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Profit Trend Analysis</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                          <YAxis tick={{ fill: '#6b7280' }} />
                          <Tooltip
                            contentStyle={{
                              background: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Profit"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="Profit"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "details" && financialSummary && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Detailed Financial Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Purchases</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {["daily", "monthly", "yearly"].map((period) => {
                        const sales = safeGet(financialSummary, `${period}.sales`);
                        const purchases = safeGet(financialSummary, `${period}.purchases`);
                        const profit = safeGet(financialSummary, `${period}.profit`);
                        const margin = sales > 0 ? ((profit / sales) * 100).toFixed(2) : "0.00";
                        
                        return (
                          <tr key={period} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{period}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800">Rs. {sales.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800">Rs. {purchases.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">Rs. {profit.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${parseFloat(margin) > 20 ? 'bg-green-100 text-green-800' : parseFloat(margin) > 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {margin}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!financialSummary && (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-red-500 text-5xl mb-4">❌</div>
                <p className="text-red-500 font-semibold text-xl mb-3">No financial data available.</p>
                <button 
                  onClick={fetchFinancialSummary}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <RotateCcw size={16} />
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;