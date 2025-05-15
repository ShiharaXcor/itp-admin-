import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Edit, Trash2, X, Check, Upload, Image as ImageIcon } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({});
  const [newImage, setNewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4001/api/products/');
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:4001/api/categories/');
      if (Array.isArray(res.data)) setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category?._id || '',
    });
    setNewImage(null);
  };

  const handleCancel = () => {
    setEditingProductId(null);
    setFormData({});
    setNewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewImage(e.target.files[0]);
      toast.info('New image selected');
    }
  };

  const handleUpdate = async (id) => {
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      if (newImage) data.append('images', newImage);

      const res = await axios.put(
        `http://localhost:4001/api/products/update/${id}`,
        data
      );

      if (res.data.success) {
        toast.success('Product updated successfully');
        setEditingProductId(null);
        fetchProducts();
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:4001/api/products/delete/${id}`);
      if (res.data.success) {
        setProducts(products.filter((p) => p._id !== id));
        toast.success('Product deleted successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
    }
  };

  const confirmDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      handleDelete(id);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || product.category?._id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Inventory</h1>
        
        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Card Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const isEditing = editingProductId === product._id;
              
              return (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 relative">
                    {isEditing ? (
                      <div className="h-full w-full flex flex-col items-center justify-center p-4">
                        {product.images?.[0] && !newImage ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-32 object-contain"
                          />
                        ) : newImage ? (
                          <div className="text-center">
                            <div className="text-green-600 mb-2">
                              <Upload size={24} className="mx-auto mb-1" />
                              New image selected
                            </div>
                            <p className="text-sm text-gray-600 truncate w-full">{newImage.name}</p>
                          </div>
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center">
                            <ImageIcon size={48} className="mb-2" />
                            <span>No Image</span>
                          </div>
                        )}
                        <label className="mt-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-100">
                          Choose Image
                          <input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50">
                          <div className="text-gray-400 flex flex-col items-center">
                            <ImageIcon size={48} className="mb-2" />
                            <span>No Image</span>
                          </div>
                        </div>
                      )
                    )}
                    
                    {/* Category Badge */}
                    {!isEditing && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-blue-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            name="category"
                            value={formData.category || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">{product.name}</h2>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                      </>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-end">
                      {isEditing ? (
                        <>
                          <button
                            className="flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-2 transition-colors"
                            onClick={() => handleUpdate(product._id)}
                          >
                            <Check size={16} className="mr-1" />
                            Save
                          </button>
                          <button
                            className="flex items-center text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
                            onClick={handleCancel}
                          >
                            <X size={16} className="mr-1" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="flex items-center text-blue-600 hover:bg-blue-50 px-3 py-1 rounded mr-2 transition-colors"
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </button>
                          <button
                            className="flex items-center text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                            onClick={() => confirmDelete(product._id, product.name)}
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;