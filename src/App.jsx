import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Order from "./pages/Order";
import UserClient from "./pages/UserClient";
import AddProduct from "./pages/AddProduct";
import ViewInventory from "./pages/ViewInventory";
import CreateList from "./pages/CreateList";
import ReceiveProducts from "./pages/ReceiveProducts";
import StockDashboard from "./pages/StockDashboard";
import PriceManager from "./pages/PriceManager";
import AdminFinancialDashboard from "./pages/AdminFinancialDashboard";
import TransactionDetails from "./pages/TransactionDetails";
import ReturnAndRefundDashboard from './pages/ReturnAndRefundDashboard';
import ReturnsList from "./components/ReturnsList";
import ReturnDetails from "./components/ReturnDetails";
import SupplierForm from "./pages/SupplierForm";
import SupplierList from "./pages/SupplierList";
import  AdminHome   from   './pages/AdminHoma'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <div className="flex">
            <Navbar className="w-1/5 min-h-screen" setToken={setToken}/>
            <div className="w-4/5 p-8">
            <ToastContainer position="top-right" autoClose={3000} />
              <Routes>
              <Route path="/adminHome" element={<AdminHome />} />
                <Route path="/order" element={<Order />} />
                <Route path="/buyer" element={<UserClient />} />
                <Route path="/addPrdouct" element={<AddProduct />} />
                <Route path="/viewInventory" element={<ViewInventory />} />
                <Route path="/create-request" element={<CreateList />} />
                <Route path="/productsrecived" element={<ReceiveProducts />} />
                <Route path="/stock" element={<StockDashboard />} />
                <Route path="/pricedisc" element={<PriceManager />} />
                <Route path="/fianance" element={<AdminFinancialDashboard />} />
                <Route path="/transactions" element={<TransactionDetails />}/>
                <Route path="/dashboard/returns-refunds" element={<ReturnAndRefundDashboard />} />
                <Route path="/admin/returns" element={<ReturnsList />} />
                <Route path="/admin/returns/:id" element={<ReturnDetails />} />
                <Route path="/addSupplier" element={<SupplierForm />} />
                <Route path="/supplierlist" element={<SupplierList />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
