import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateList = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("http://localhost:4001/api/products/");
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setMessage({ type: "error", text: "Failed to fetch products. Please check your server connection." });
        toast.error("Failed to fetch products. Please check your server connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSelect = (productId, key, value) => {
    setSelected((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [key]: value,
      },
    }));
  };

  const generatePDF = (selectedProducts) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text("INVEXA", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("No. 123, Malabe Road", 14, 30);
      doc.text("Colombo, Sri Lanka", 14, 35);
      doc.text("Phone: 07691 37840", 14, 40);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Product Quotation Request", 14, 55);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 62);

      doc.setFillColor(0, 51, 102);
      doc.rect(14, 70, 180, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Product", 16, 76);
      doc.text("Quantity", 80, 76);
      doc.text("Notes", 110, 76);
      doc.text("Deadline", 160, 76);

      doc.setDrawColor(0, 51, 102);
      doc.line(14, 70, 194, 70);
      doc.line(14, 80, 194, 80);
      doc.line(14, 70, 14, 80);
      doc.line(75, 70, 75, 80);
      doc.line(105, 70, 105, 80);
      doc.line(155, 70, 155, 80);
      doc.line(194, 70, 194, 80);

      let yPosition = 90;
      doc.setTextColor(0, 0, 0);

      selectedProducts.forEach((p) => {
        const productDetails = products.find(product => product._id === p.product);
        const productName = productDetails ? productDetails.name : p.product;

        doc.text(productName.substring(0, 28), 16, yPosition);
        doc.text(p.requestedQuantity.toString(), 80, yPosition);
        doc.text((p.notes || "—").substring(0, 22), 110, yPosition);
        doc.text(p.deadline || "—", 160, yPosition);

        const rowHeight = 10;
        doc.setDrawColor(220, 220, 220);
        doc.line(14, yPosition + 4, 194, yPosition + 4);
        doc.line(14, yPosition - 6, 14, yPosition + 4);
        doc.line(75, yPosition - 6, 75, yPosition + 4);
        doc.line(105, yPosition - 6, 105, yPosition + 4);
        doc.line(155, yPosition - 6, 155, yPosition + 4);
        doc.line(194, yPosition - 6, 194, yPosition + 4);

        yPosition += rowHeight;
      });

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Thank you for your business with INVEXA.", 14, 270);

      doc.save("invexa_purchase_request.pdf");
      return true;
    } catch (err) {
      console.error("Error generating PDF:", err);
      return false;
    }
  };

  const handleGenerateAndSubmit = async () => {
    const hasSelectedProducts = Object.values(selected).some(item => item.requestedQty > 0);
    if (!hasSelectedProducts) {
      setMessage({ type: "error", text: "Please select at least one product" });
      toast.error("Please select at least one product");
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const selectedProducts = Object.entries(selected)
      .filter(([_, data]) => data.requestedQty > 0)
      .map(([id, data]) => ({
        product: id,
        requestedQuantity: data.requestedQty || 0,
        notes: data.note || "",
        deadline: data.deadline || ""
      }));

    try {
      const res = await axios.post("http://localhost:4001/api/purchases/request", {
        products: selectedProducts,
      });

      const pdfGenerated = generatePDF(selectedProducts);

      if (pdfGenerated) {
        setMessage({
          type: "success",
          text: "Request created successfully and PDF generated.",
        });
        toast.success("Request created successfully and PDF generated");
        setSelected({});
      } else {
        setMessage({
          type: "warning",
          text: "Request created but PDF generation failed.",
        });
        toast.warning("Request created but PDF generation failed");
      }
    } catch (err) {
      console.error("Error creating request:", err);
      setMessage({
        type: "error",
        text: "Failed to create request. Please try again.",
      });
      toast.error("Failed to create request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedCount = () => {
    return Object.values(selected).filter(item => item.requestedQty > 0).length;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Product Request List</h2>
        <div className="text-sm text-gray-500">{getSelectedCount()} product(s) selected</div>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border-l-4 border-red-500"
              : message.type === "success"
              ? "bg-green-100 text-green-700 border-l-4 border-green-500"
              : "bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-blue-700 text-sm">
          Select products to request, specify quantities, add notes if needed, and set deadlines. 
          A PDF document will be generated with your selections.
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-left">
              <th className="p-3 font-medium border-b">Select</th>
              <th className="p-3 font-medium border-b">Product Name</th>
              <th className="p-3 font-medium border-b">Request Qty</th>
              <th className="p-3 font-medium border-b">Note</th>
              <th className="p-3 font-medium border-b">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  {isLoading ? "Loading products..." : "No products available"}
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded text-blue-600"
                      onChange={(e) =>
                        handleSelect(p._id, "requestedQty", e.target.checked ? 1 : 0)
                      }
                      checked={selected[p._id]?.requestedQty > 0}
                    />
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      className="w-20 border p-2 rounded-md"
                      value={selected[p._id]?.requestedQty || ""}
                      onChange={(e) =>
                        handleSelect(p._id, "requestedQty", parseInt(e.target.value || 0))
                      }
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      className="w-full border p-2 rounded-md"
                      value={selected[p._id]?.note || ""}
                      onChange={(e) =>
                        handleSelect(p._id, "note", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="date"
                      className="border p-2 rounded-md"
                      min={today} // 🔒 Prevents past dates
                      value={selected[p._id]?.deadline || ""}
                      onChange={(e) =>
                        handleSelect(p._id, "deadline", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={handleGenerateAndSubmit}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Generate PDF & Submit"}
        </button>
      </div>
    </div>
  );
};

export default CreateList;
