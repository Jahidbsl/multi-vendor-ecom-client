// components/AdminCategories.jsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, FolderTree, ShieldCheck } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlertDialog, Button } from "@heroui/react";
import { getAdminCategories, addAdminCategory, deleteAdminCategory } from "@/lib/api/categories";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    const result = await getAdminCategories();
    if (result && result.success) {
      setCategories(result.data || []);
    } else {
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const res = await addAdminCategory({ name, description });
      if (res?.success) {
        toast.success(res.message || "Category added successfully!");
        setName("");
        setDescription("");
        loadCategories();
      } else {
        toast.error(res?.message || "Failed to add category.");
      }
    });
  };

  const openDeleteModal = (cat) => {
    if (String(cat._id).startsWith("def-") || cat.isDefault) {
      toast.warn("Default categories cannot be deleted.");
      return;
    }
    setSelectedCategory(cat);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedCategory) return;

    startTransition(async () => {
      const res = await deleteAdminCategory(selectedCategory._id);
      if (res?.success) {
        toast.success("Category deleted successfully!");
        loadCategories();
      } else {
        toast.error(res?.message || "Failed to delete category.");
      }
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      
      {/* Toast Notification Container */}
      <ToastContainer position="top-right" autoClose={4000} />

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Manage Categories
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Category Form */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 h-fit">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-500" /> Add New Category
          </h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Footwear"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                placeholder="Category description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {isPending ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 h-fit">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        {cat.name}
                        {cat.isDefault && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                            <ShieldCheck className="w-3 h-3" /> Default
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {cat.description || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!cat.isDefault ? (
                          <button
                            onClick={() => openDeleteModal(cat)}
                            disabled={isPending}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition shadow-sm inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* HeroUI Custom Delete Confirmation Dialog */}
      <AlertDialog isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Delete category permanently?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will permanently delete <strong>{selectedCategory?.name}</strong> category and all related data. This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" disabled={isPending} onClick={confirmDelete}>
                  {isPending ? "Deleting..." : "Delete Category"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

    </div>
  );
}