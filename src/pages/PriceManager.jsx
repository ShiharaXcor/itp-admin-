import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PriceManager() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // ✅ NEW

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await axios.get('http://localhost:4001/api/selling-price/');
      setPrices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  const initializePrices = async () => {
    try {
      await axios.post('http://localhost:4001/api/selling-price/initialize');
      fetchPrices();
    } catch (err) {
      alert('Initialization failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const updatePrice = async (id, basePrice, quantityDiscounts) => {
    try {
      await axios.put(`http://localhost:4001/api/selling-price/${id}`, {
        basePrice,
        quantityDiscounts,
      });
      setMessage('Price updated successfully ✅'); // ✅ SET MESSAGE
      setTimeout(() => setMessage(null), 3000); // ✅ CLEAR AFTER 3 SECONDS
      fetchPrices(); // Refresh
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating price');
      console.error('Update failed:', error.response?.data);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...prices];
    updated[index][field] = value;
    setPrices(updated);
  };

  const handleDiscountChange = (productIndex, discountIndex, field, value) => {
    const updated = [...prices];
    updated[productIndex].quantityDiscounts[discountIndex][field] = value;
    setPrices(updated);
  };

  const addDiscount = (productIndex) => {
    const updated = [...prices];
    updated[productIndex].quantityDiscounts.push({ minQuantity: 1, discountPercent: 0 });
    setPrices(updated);
  };

  const removeDiscount = (productIndex, discountIndex) => {
    const updated = [...prices];
    updated[productIndex].quantityDiscounts.splice(discountIndex, 1);
    setPrices(updated);
  };

  if (loading) return <p className="p-4 text-gray-500">Loading selling prices...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Manage Selling Prices</h2>
        <button
          onClick={initializePrices}
          className="bg-purple-600 text-white px-4 py-2 rounded shadow"
        >
          Initialize Missing Prices
        </button>
      </div>

      {/* ✅ Success Message */}
      {message && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          {message}
        </div>
      )}

      {prices.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        prices.map((item, i) => (
          <div key={item._id || i} className="bg-white p-4 shadow rounded mb-6">
            <h3 className="font-semibold text-lg">{item.product?.name || 'Unnamed Product'}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Stock: {item.totalCurrentQuantity ?? 0} kg/units
            </p>

            <div className="flex flex-wrap gap-3 items-center mb-4">
              <label className="text-sm">Base Price Rs.:</label>
              <input
                type="number"
                className="border p-2 rounded w-32"
                value={item.basePrice}
                min="0"
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  handleChange(i, 'basePrice', isNaN(val) ? 0 : val);
                }}
              />

              <button
                onClick={() => addDiscount(i)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                + Add Discount
              </button>

              <button
                onClick={() =>
                  updatePrice(item._id, item.basePrice, item.quantityDiscounts)
                }
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>

            {item.quantityDiscounts?.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">Discounts:</p>
                {item.quantityDiscounts.map((discount, j) => (
                  <div key={j} className="flex gap-3 items-center">
                    <input
                      type="number"
                      className="border p-1 rounded w-24"
                      min="1"
                      value={discount.minQuantity}
                      onChange={(e) =>
                        handleDiscountChange(i, j, 'minQuantity', parseInt(e.target.value) || 1)
                      }
                    />
                    <span className="text-gray-500">kg →</span>
                    <input
                      type="number"
                      className="border p-1 rounded w-20"
                      min="0"
                      max="100"
                      value={discount.discountPercent}
                      onChange={(e) =>
                        handleDiscountChange(i, j, 'discountPercent', parseFloat(e.target.value) || 0)
                      }
                    />
                    <span className="text-gray-500">%</span>
                    <button
                      onClick={() => removeDiscount(i, j)}
                      className="text-red-500 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
