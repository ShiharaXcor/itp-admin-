import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddProduct = () => {
  const [form, setForm] = useState({
    name: '',
    category: '',  // This will hold the category _id
    description: '',
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:4001/api/categories/');
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
          console.error('Expected an array of categories but got:', res.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
  
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    setForm(prev => ({ ...prev, images: files }));
    
    // Create preview URLs for images
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      urls.push(URL.createObjectURL(files[i]));
    }
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category) {
      setMessage('Product name and category are required');
      toast.warning('Product name and category are required');
      return;
    }

    const data = new FormData();
    data.append('name', form.name);
    data.append('category', form.category);  // Ensure it's sending the correct category _id
    data.append('description', form.description);
    for (let i = 0; i < form.images.length; i++) {
      data.append('images', form.images[i]);
    }

    try {
      setLoading(true);
      setMessage('');
      await axios.post('http://localhost:4001/api/products/add', data);
      setMessage('Product added successfully!');
      toast.success('Product added successfully!');
      setForm({ name: '', category: '', description: '', images: [] });
      setPreviewUrls([]);
      document.getElementById('imageInput').value = '';
    } catch (err) {
      console.error(err);
      setMessage('Error adding product.');
      toast.error('Error adding product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Product</h2>

      {message && (
        <div className={`p-3 mb-4 rounded text-sm font-medium ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name} — {cat.description}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <input
            id="imageInput"
            type="file"
            name="images"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {previewUrls.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Image Previews:</p>
            <div className="grid grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="h-24 border rounded-md overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            'Add Product'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;