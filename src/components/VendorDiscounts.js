"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:5000"; // নিশ্চিত করুন আপনার এক্সপ্রেস সার্ভার এই পোর্টে চলছে

export default function VendorDiscounts() {
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendorId");

  const [products, setProducts] = useState([]);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("Current Vendor ID:", vendorId); // এটি কনসোলে দেখা যাচ্ছে কি?
  if (vendorId) {
    fetchProducts();
  }
}, [vendorId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // এখানে পাথটি আপনার এক্সপ্রেস ব্যাকএন্ডের রাউটের সাথে মিলিয়ে নেবেন
      const res = await fetch(`${BASE_URL}/api/discounts/vendor/${vendorId}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        toast.error(data.message || "Failed to fetch");
      }
    } catch (error) {
      toast.error("Server is not responding");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscount = async (productId, remove = false) => {
    const discountPercent = inputs[productId];

    if (!remove && (!discountPercent || discountPercent <= 0 || discountPercent >= 100)) {
      return toast.warning("Please enter a valid discount (1-99).");
    }

    try {
      const url = remove 
        ? `${BASE_URL}/api/discounts/${productId}` 
        : `${BASE_URL}/api/discounts`;
        
      const res = await fetch(url, {
        method: remove ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: remove ? null : JSON.stringify({ vendorId, productId, discountPercent }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchProducts(); // ডাটা রিফ্রেশ করুন
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to perform action");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading products...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Discounts</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {products.map((p) => (
          <div key={p._id} className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-2">{p.title}</h2>
            
            <div className="my-4">
              {p.hasDiscount ? (
                <>
                  <p className="text-gray-400 line-through">${p.originalPrice}</p>
                  <p className="text-2xl font-bold text-green-600">${p.price}</p>
                </>
              ) : (
                <p className="text-2xl font-bold">${p.price}</p>
              )}
            </div>

            <input
              type="number"
              placeholder="Discount %"
              className="w-full p-2 border rounded-md mb-4"
              value={inputs[p._id] || ""}
              onChange={(e) => setInputs({ ...inputs, [p._id]: e.target.value })}
            />

            <div className="flex gap-2">
              <button 
                onClick={() => handleDiscount(p._id)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Apply
              </button>
              <button 
                onClick={() => handleDiscount(p._id, true)}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}