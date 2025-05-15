import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chip,
  CircularProgress,
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Cell as PieCell
} from 'recharts';
import { Warning, CheckCircle, Inventory, PictureAsPdf } from '@mui/icons-material';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StockDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchStockData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const lowItems = data.filter(item => item.quantity < 50);
      setLowStockItems(lowItems);
      lowItems.forEach(item => {
        toast.warning(
          `Low stock alert: ${item.name} (${item.quantity} remaining)`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      });
    }
  }, [data]);

  useEffect(() => {
    let result = [...data];
    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(item => {
        const qty = item.quantity;
        if (statusFilter === 'Low') return qty < 50;
        if (statusFilter === 'Medium') return qty >= 50 && qty < 100;
        if (statusFilter === 'Good') return qty >= 100;
        return true;
      });
    }
    setFilteredData(result);
  }, [searchTerm, statusFilter, data]);

  const fetchStockData = async () => {
    try {
      const res = await axios.get('http://localhost:4001/api/dashboard/stock');
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError('Failed to fetch stock data.');
        toast.error('Failed to fetch stock data.');
      }
    } catch (err) {
      setError('An error occurred while fetching the data.');
      toast.error('An error occurred while fetching the data.');
    } finally {
      setLoading(false);
    }
  };

  const safeToFixed = (value, decimalPlaces = 2) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return value.toFixed(decimalPlaces);
  };

  const getStatusChip = (quantity) => {
    if (quantity < 50) {
      return <Chip icon={<Warning />} label="Low" color="error" size="small" />;
    } else if (quantity < 100) {
      return <Chip icon={<Warning />} label="Medium" color="warning" size="small" />;
    }
    return <Chip icon={<CheckCircle />} label="Good" color="success" size="small" />;
  };

  const getBarColor = (entry) => {
    const quantity = entry.quantity;
    if (quantity < 50) return '#ef4444';
    if (quantity < 100) return '#f59e0b';
    return '#10b981';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Stock Inventory Report', 14, 15);
    const tableData = filteredData.map(item => [
      item.name,
      item.quantity,
      item.quantity < 50 ? 'Low' : item.quantity < 100 ? 'Medium' : 'Good',
      `Rs. ${safeToFixed(item.totalValue).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
    ]);
    autoTable(doc, {
      head: [['Product', 'Quantity', 'Status', 'Total Value']],
      body: tableData,
      startY: 20,
    });
    doc.save('stock_inventory.pdf');
  };

  const getPieChartData = () => {
    return [
      {
        name: 'Low Stock',
        value: data.filter(item => item.quantity < 50).length,
        fill: '#ef4444',
      },
      {
        name: 'Medium Stock',
        value: data.filter(item => item.quantity >= 50 && item.quantity < 100).length,
        fill: '#f59e0b',
      },
      {
        name: 'Good Stock',
        value: data.filter(item => item.quantity >= 100).length,
        fill: '#10b981',
      },
    ];
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
        <Typography ml={2}>Loading inventory data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      <Box className="mb-6 flex items-center">
        <Inventory fontSize="large" className="text-blue-600 mr-2" />
        <Typography variant="h4" fontWeight="bold">
          Stock Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={4}>
          <Paper elevation={3} className="p-4 h-full">
            <Typography variant="h6" className="mb-2">Total Products</Typography>
            <Typography variant="h3" className="text-blue-600 font-bold">{data.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} className="p-4 h-full">
            <Typography variant="h6" className="mb-2">Total Items</Typography>
            <Typography variant="h3" className="text-green-600 font-bold">
              {data.reduce((sum, item) => sum + item.quantity, 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} className="p-4 h-full">
            <Typography variant="h6" className="mb-2">Total Inventory Value</Typography>
            <Typography variant="h3" className="text-purple-600 font-bold">
              Rs. {safeToFixed(data.reduce((sum, item) => sum + item.totalValue, 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {lowStockItems.length > 0 && (
        <Alert severity="warning" className="mb-6" variant="filled">
          <Typography variant="subtitle1" fontWeight="bold">
            Warning: {lowStockItems.length} product(s) with low inventory
          </Typography>
        </Alert>
      )}

      <Box className="mb-4 flex flex-wrap items-center gap-4">
        <TextField
          label="Search Product"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField
          label="Filter Status"
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {['All', 'Low', 'Medium', 'Good'].map(status => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<PictureAsPdf />}
          onClick={exportToPDF}
        >
          Export PDF
        </Button>
      </Box>

      <Paper elevation={3} className="mb-6 p-4 rounded-lg">
        <Typography variant="h6" className="mb-4 font-semibold">
          Product Quantity Distribution (Bar Chart)
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
            <Legend />
            <Bar dataKey="quantity" name="Inventory Quantity" radius={[4, 4, 0, 0]}>
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Pie chart */}
      <Paper elevation={3} className="mb-6 p-4 rounded-lg">
        <Typography variant="h6" className="mb-4 font-semibold">
          Stock Status Distribution (Pie Chart)
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={getPieChartData()}
              dataKey="value"
              nameKey="name"
              outerRadius={150}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {getPieChartData().map((entry, index) => (
                <PieCell key={`pie-cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Paper>

      {/* Product Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{getStatusChip(item.quantity)}</TableCell>
                <TableCell>{`Rs. ${safeToFixed(item.totalValue)}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StockDashboard;
