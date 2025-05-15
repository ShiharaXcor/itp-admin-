import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ setToken }) => {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  const toggleInventory = () => setInventoryOpen(!inventoryOpen);
  const toggleUser = () => setUserOpen(!userOpen);
  const toggleOrder = () => setOrderOpen(!orderOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <div className="w-[18%] min-h-screen bg-blue-950 border-r-2 p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>

        <nav className="flex flex-col gap-4 text-[15px] text-white">
          {/* Home */}
          <NavLink to="/adminHome" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
            <span>Home</span>
          </NavLink>

          {/* User Management */}
          <div>
            <button onClick={toggleUser} className="flex items-center justify-between w-full hover:bg-gray-700 p-2 rounded-md">
              <div className="flex items-center gap-3">
                <span>User Management</span>
              </div>
              <span>{userOpen ? '-' : '+'}</span>
            </button>

            {userOpen && (
              <div className="ml-6 flex flex-col gap-2 mt-2">
                <NavLink to="/supplierlist" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Supplier Management</span>
                </NavLink>
                <NavLink to="/addSupplier" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Add Supplier</span>
                </NavLink>
                <NavLink to="/buyer" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Buyer Management</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Inventory Management */}
          <div>
            <button onClick={toggleInventory} className="flex items-center justify-between w-full hover:bg-gray-700 p-2 rounded-md">
              <div className="flex items-center gap-3">
                <span>Inventory Management</span>
              </div>
              <span>{inventoryOpen ? '-' : '+'}</span>
            </button>

            {inventoryOpen && (
              <div className="ml-6 flex flex-col gap-2 mt-2">
                <NavLink to="/addPrdouct" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Add New Products</span>
                </NavLink>
                <NavLink to="/create-request" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Create List</span>
                </NavLink>
                <NavLink to="/viewInventory" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>View Inventory</span>
                </NavLink>
                <NavLink to="/productsrecived" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Prodcusts Recived</span>
                </NavLink>
                <NavLink to="/stock" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Stock Controlling</span>
                </NavLink>
                <NavLink to="/inventory/notification" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Notification</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Orders Management */}
          <div>
            <button onClick={toggleOrder} className="flex items-center justify-between w-full hover:bg-gray-700 p-2 rounded-md">
              <div className="flex items-center gap-3">
                <span>Order Management</span>
              </div>
              <span>{orderOpen ? '-' : '+'}</span>
            </button>

            {orderOpen && (
              <div className="ml-6 flex flex-col gap-2 mt-2">
                <NavLink to="/order" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Orders</span>
                </NavLink>
                <NavLink to="/order/delivery" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
                  <span>Delivery</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Financial Management */}
          <NavLink to="/fianance" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
            <span>Financial Management</span>
          </NavLink>
          <NavLink to="/transactions" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
            <span>Sales and Purchases</span>
          </NavLink>
          {/* Reimbursement Management */}
          <NavLink to="/dashboard/returns-refunds" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
            <span>Reimbursement Management</span>
          </NavLink>
          <NavLink to="/pricedisc" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
            <span>Price and discount Management</span>
          </NavLink>
          <NavLink to="/admin/returns" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md">
            <span>Returns</span>
          </NavLink>
        </nav>
        {/* Price and discount Management */}
        
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
