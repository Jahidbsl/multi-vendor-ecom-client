// components/ManageProducts.jsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Search, Trash2, Star } from "lucide-react";
import { AlertDialog, Button, Alert } from "@heroui/react";
import { getProducts } from "@/lib/api/produts";
import { deleteProductActionforAdmin } from "@/lib/actions/products";
import { adminToggleFeaturedProduct } from "@/lib/api/produts";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ visible: false, message: "", color: "success" });
  const [isPending, startTransition] = useTransition();
  const limit = 10;

  const loadProducts = async () => {
    setLoading(true);
    const result = await getProducts(page, limit);
    
    if (result && result.success) {
      let fetchedData = result.data || [];

      if (search) {
        fetchedData = fetchedData.filter((product) =>
          product.title?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setProducts(fetchedData);
      setTotalPages(result.pagination?.totalPages || 1);
    } else {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const handleFeaturedToggle = async (id, currentFeaturedStatus) => {
    const nextStatus = !currentFeaturedStatus;

    try {
      setActionLoadingId(id);
      const data = await adminToggleFeaturedProduct(id, nextStatus);

      if (data?.success) {
        setAlertInfo({ visible: true, message: data.message || "Featured status updated successfully!", color: "success" });
        loadProducts();
      } else {
        setAlertInfo({ visible: true, message: data?.message || "Failed to update featured status.", color: "danger" });
      }
      setTimeout(() => setAlertInfo((prev) => ({ ...prev, visible: false })), 4000);
    } catch (error) {
      console.error(error);
      setAlertInfo({ visible: true, message: "Something went wrong.", color: "danger" });
      setTimeout(() => setAlertInfo((prev) => ({ ...prev, visible: false })), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedProductId) return;

    startTransition(async () => {
      const res = await deleteProductActionforAdmin(selectedProductId);
      if (res.success) {
        setAlertInfo({ visible: true, message: res.message || "Product deleted successfully!", color: "success" });
        loadProducts();
      } else {
        setAlertInfo({ visible: true, message: res.message || "Failed to delete product.", color: "danger" });
      }
      setSelectedProductId(null);
      setTimeout(() => setAlertInfo((prev) => ({ ...prev, visible: false })), 4000);
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      
      {alertInfo.visible && (
        <div className="mb-4">
          <Alert color={alertInfo.color} title={alertInfo.message} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Manage All Products
        </h2>
        
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-colors"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isFeatured = !!product.hasfeature;
                  const productId = product._id;

                  return (
                    <tr key={productId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                          <Image
                            src={product.image || "https://via.placeholder.com/50"}
                            alt={product.title || "Product image"}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">
                        {product.title}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-semibold">${product.price}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.stock}</td>
                      
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          isLoading={actionLoadingId === productId}
                          isDisabled={actionLoadingId !== null}
                          onClick={() => handleFeaturedToggle(productId, isFeatured)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition ${
                            isFeatured
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFeatured ? "fill-current" : ""}`} />
                          {isFeatured ? "Featured" : "Make Featured"}
                        </Button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <AlertDialog>
                          <Button 
                            variant="danger" 
                            isIconOnly 
                            size="sm"
                            onClick={() => setSelectedProductId(productId)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition shadow-sm inline-flex items-center justify-center cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog.Backdrop>
                            <AlertDialog.Container>
                              <AlertDialog.Dialog className="sm:max-w-[400px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800">
                                <AlertDialog.CloseTrigger />
                                <AlertDialog.Header>
                                  <AlertDialog.Icon status="danger" />
                                  <AlertDialog.Heading className="text-lg font-bold">Delete product permanently?</AlertDialog.Heading>
                                </AlertDialog.Header>
                                <AlertDialog.Body className="py-4">
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    This will permanently delete <strong className="text-gray-900 dark:text-white">{product.title}</strong> and all of its
                                    data. This action cannot be undone.
                                  </p>
                                </AlertDialog.Body>
                                <AlertDialog.Footer className="flex justify-end gap-3 mt-4">
                                  <Button slot="close" variant="tertiary" className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    Cancel
                                  </Button>
                                  <Button 
                                    slot="close" 
                                    variant="danger" 
                                    onClick={handleConfirmDelete}
                                    disabled={isPending}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                  >
                                    {isPending ? "Deleting..." : "Delete Product"}
                                  </Button>
                                </AlertDialog.Footer>
                              </AlertDialog.Dialog>
                            </AlertDialog.Container>
                          </AlertDialog.Backdrop>
                        </AlertDialog>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}