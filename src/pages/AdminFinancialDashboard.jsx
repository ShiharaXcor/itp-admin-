import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Download, FileText, Printer, RotateCcw, TrendingUp } from "lucide-react";

const AdminFinancialDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Company information
  const companyInfo = {
    name: "INVEXA",
    address: "No.123, Malabe Road, Colombo, Sri Lanka",
    phone: "0769137840"
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:4001/api/analytics/summary");
      setSummary(data);
      toast.success("Financial data loaded successfully!");
    } catch (error) {
      console.error("Failed to load financial summary", error);
      toast.error("Failed to load financial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const safeGet = (obj, path, defaultValue = 0) => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) break;
    }
    return result ?? defaultValue;
  };

  const chartData = [
    { name: "Today", Sales: safeGet(summary, "daily.sales"), Purchases: safeGet(summary, "daily.purchases"), Profit: safeGet(summary, "daily.profit") },
    { name: "Month", Sales: safeGet(summary, "monthly.sales"), Purchases: safeGet(summary, "monthly.purchases"), Profit: safeGet(summary, "monthly.profit") },
    { name: "Year", Sales: safeGet(summary, "yearly.sales"), Purchases: safeGet(summary, "yearly.purchases"), Profit: safeGet(summary, "yearly.profit") },
  ];

  const trendData = [
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
    { name: "Dec", Profit: safeGet(summary, "yearly.profit") / 12 },
  ];

  const downloadCSV = () => {
    const rows = [
      ["Period", "Sales (Rs.)", "Purchases (Rs.)", "Profit (Rs.)"],
      ["Daily", safeGet(summary, "daily.sales"), safeGet(summary, "daily.purchases"), safeGet(summary, "daily.profit")],
      ["Monthly", safeGet(summary, "monthly.sales"), safeGet(summary, "monthly.purchases"), safeGet(summary, "monthly.profit")],
      ["Yearly", safeGet(summary, "yearly.sales"), safeGet(summary, "yearly.purchases"), safeGet(summary, "yearly.profit")],
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
    
    toast.info("CSV export successful!");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(companyInfo.name, 14, 20);
    
    doc.setFontSize(10);
    doc.text(companyInfo.address, 14, 30);
    doc.text(`Phone: ${companyInfo.phone}`, 14, 36);
    
    // Report title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("Financial Summary Report", 14, 55);
    
    // Current date
    const today = new Date();
    doc.setFontSize(10);
    doc.text(`Generated on: ${today.toLocaleDateString()}`, 14, 62);

    const tableData = [
      ["Daily", 
       `Rs. ${safeGet(summary, "daily.sales").toLocaleString()}`, 
       `Rs. ${safeGet(summary, "daily.purchases").toLocaleString()}`, 
       `Rs. ${safeGet(summary, "daily.profit").toLocaleString()}`
      ],
      ["Monthly", 
       `Rs. ${safeGet(summary, "monthly.sales").toLocaleString()}`, 
       `Rs. ${safeGet(summary, "monthly.purchases").toLocaleString()}`, 
       `Rs. ${safeGet(summary, "monthly.profit").toLocaleString()}`
      ],
      ["Yearly", 
       `Rs. ${safeGet(summary, "yearly.sales").toLocaleString()}`, 
       `Rs. ${safeGet(summary, "yearly.purchases").toLocaleString()}`, 
       `Rs. ${safeGet(summary, "yearly.profit").toLocaleString()}`
      ],
    ];

    autoTable(doc, {
      head: [["Period", "Sales", "Purchases", "Profit"]],
      body: tableData,
      startY: 70,
      theme: "striped",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 248, 255] }
    });
    
    

    doc.save("INVEXA_financial_summary.pdf");
    toast.success("PDF export successful!");
  };

  const printSummary = () => {
    window.print();
    toast.info("Print request sent!");
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <div className="text-gray-700 font-medium">Loading financial dashboard...</div>
      </div>
      <ToastContainer position="top-right" theme="colored" />
    </div>
  );

  if (!summary) return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-red-500 text-5xl mb-4">❌</div>
        <p className="text-red-500 font-semibold text-xl mb-3">No financial data available.</p>
        <button 
          onClick={fetchSummary}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Refresh Data
        </button>
      </div>
      <ToastContainer position="top-right" theme="colored" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer position="top-right" theme="colored" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp size={32} className="text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sales & Puuchase Dashboard</h1>
                
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchSummary}
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

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
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
        
        {activeTab === "overview" && (
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
                        Rs.{safeGet(summary, `${item.period}.sales`).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">Purchases</p>
                      <p className="text-xl font-medium text-orange-600">
                        Rs.{safeGet(summary, `${item.period}.purchases`).toLocaleString()}
                      </p>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700">Profit</p>
                      <p className="text-xl font-bold text-blue-600">
                        Rs.{safeGet(summary, `${item.period}.profit`).toLocaleString()}
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
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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

        {activeTab === "details" && (
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
                    const sales = safeGet(summary, `${period}.sales`);
                    const purchases = safeGet(summary, `${period}.purchases`);
                    const profit = safeGet(summary, `${period}.profit`);
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
      </div>
      
      {/* Footer */}
     
    </div>
  );
};

export default AdminFinancialDashboard;