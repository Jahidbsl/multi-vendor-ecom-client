"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Table,
  Button,
  Modal,
  AlertDialog,
  Form,
  TextField,
  Label,
  Input,
  Select,
  ListBox,
  FieldError,
} from "@heroui/react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import {
  
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/lib/actions/products";
import { Plus, Pencil, Trash2, Package, Eye, Store, User, Mail, AlertTriangle } from "lucide-react";
import { getVendorProductsAction } from "@/lib/api/produts";

const CATEGORIES = [
  { label: "Fashion", value: "fashion" },
  { label: "Home & Living", value: "home_living" },
  { label: "Electronics", value: "electronics" },
  { label: "Beauty", value: "beauty" },
  { label: "Handmade", value: "handmade" },
  { label: "Groceries", value: "groceries" },
];

export default function VendorProductsPage() {
  const { data: session } = authClient.useSession();
  const vendorId = session?.user?.id;
  
  // Vendor account-wise default category
  const vendorCategory = session?.user?.category || "electronics";

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Pagination State
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 8,
  });

  const getItemId = (item) => {
    if (!item?._id) return "";
    return typeof item._id === "object" && item._id.$oid
      ? item._id.$oid
      : item._id.toString();
  };

  // Fetch Products
  const fetchProducts = useCallback(
    async (page) => {
      if (!vendorId) return;
      try {
        setIsLoading(true);
        const res = await getVendorProductsAction(vendorId, page, pagination.limit);

        if (res?.success) {
          setProducts(res.data);
          setPagination(res.pagination);
        } else {
          toast.error(res?.message || "Failed to fetch products");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading products");
      } finally {
        setIsLoading(false);
      }
    },
    [vendorId, pagination.limit]
  );

  useEffect(() => {
    fetchProducts(pagination.currentPage);
  }, [fetchProducts, pagination.currentPage]);

  // Open Form Modal (Create or Edit)
  const handleOpenFormModal = (product = null) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  // Open View Details Modal
  const handleOpenViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewOpen(true);
  };

  // Open Delete Confirmation Alert
  const handleOpenDeleteAlert = (id) => {
    setDeleteTargetId(id);
    setIsDeleteAlertOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    
    // Auto collecting vendor information from logged-in session
    const payload = {
      vendorId: vendorId,
      vendorName: session?.user?.name || "N/A",
      shopName: session?.user?.shopName || "N/A",
      vendorEmail: session?.user?.email || "N/A",
      title: formData.get("title")?.toString(),
      price: formData.get("price")?.toString(),
      stock: formData.get("stock")?.toString(),
      image: formData.get("image")?.toString(),
      category: vendorCategory, // Category locked to vendor's registered category
      description: formData.get("description")?.toString(),
    };

    try {
      setIsSubmitting(true);
      let res;

      if (selectedProduct) {
        res = await updateProductAction(getItemId(selectedProduct), payload);
      } else {
        res = await createProductAction(payload);
      }

      if (res?.success) {
        toast.success(res.message);
        setIsFormOpen(false);
        setSelectedProduct(null);
        fetchProducts(pagination.currentPage);
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action Handler
  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsSubmitting(true);
      const res = await deleteProductAction(deleteTargetId);
      if (res?.success) {
        toast.success(res.message);
        setIsDeleteAlertOpen(false);
        setDeleteTargetId(null);
        fetchProducts(pagination.currentPage);
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="text-amber-500" size={28} /> My Store Products
          </h1>
          <p className="text-sm text-default-500">
            Category: <span className="font-semibold capitalize text-amber-500">{vendorCategory}</span> (Locked to your account)
          </p>
        </div>

        <Button
          className="bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold w-full sm:w-auto"
          onClick={() => handleOpenFormModal()}
        >
          <Plus size={18} /> Add New Product
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-default-200 dark:border-white/10 bg-background shadow-sm overflow-hidden">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Products Table" className="min-w-[800px]">
              <Table.Header>
                <Table.Column isRowHeader>Product Details</Table.Column>
                <Table.Column>Category</Table.Column>
                <Table.Column>Price</Table.Column>
                <Table.Column>Stock</Table.Column>
                <Table.Column>Actions</Table.Column>
              </Table.Header>

              <Table.Body>
                {isLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="text-center py-10 text-default-500">
                      Loading products...
                    </Table.Cell>
                  </Table.Row>
                ) : products.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="text-center py-10 text-default-500">
                      No products found. Click "Add New Product" to create one.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  products.map((item) => {
                    const productId = getItemId(item);

                    return (
                      <Table.Row key={productId}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {/* Updated with Next Image Wrapper */}
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-default-200 dark:border-white/10 bg-default-100">
                              <Image
                                src={item.image || "/placeholder.png"}
                                alt={item.title || "Product"}
                                fill
                                sizes="40px"
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground truncate max-w-[200px]">
                                {item.title}
                              </span>
                              <span className="text-xs text-default-500 truncate max-w-[220px]">
                                {item.description || "No description"}
                              </span>
                            </div>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="capitalize text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full">
                            {item.category || vendorCategory}
                          </span>
                        </Table.Cell>

                        <Table.Cell className="font-bold text-foreground">
                          ${item.price}
                        </Table.Cell>

                        <Table.Cell className="text-default-600">
                          {item.stock} pcs
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-1.5">
                            {/* View Button */}
                            <Button
                              size="sm"
                              variant="flat"
                              className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                              onClick={() => handleOpenViewModal(item)}
                            >
                              <Eye size={14} /> View
                            </Button>

                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="flat"
                              onClick={() => handleOpenFormModal(item)}
                            >
                              <Pencil size={14} /> Edit
                            </Button>

                            {/* Delete Button */}
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onClick={() => handleOpenDeleteAlert(productId)}
                            >
                              <Trash2 size={14} /> Delete
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>

        {/* Server Side Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-default-200 bg-default-50/50">
            <span className="text-sm text-default-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                isDisabled={pagination.currentPage <= 1 || isLoading}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                isDisabled={
                  pagination.currentPage >= pagination.totalPages || isLoading
                }
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT FORM MODAL */}
      {isFormOpen && (
        <Modal isOpen={isFormOpen} onOpenChange={setIsFormOpen}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="max-w-md w-full bg-background rounded-2xl p-6 shadow-xl border border-default-200 dark:border-white/10">
                <Modal.CloseTrigger onClick={() => setIsFormOpen(false)} />

                <Modal.Header>
                  <Modal.Heading className="text-xl font-bold">
                    {selectedProduct ? "Edit Product" : "Create New Product"}
                  </Modal.Heading>
                </Modal.Header>

                <Form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
                  <Modal.Body className="flex flex-col gap-4 p-0">
                    {/* Product Title */}
                    <TextField isRequired name="title" defaultValue={selectedProduct?.title || ""}>
                      <Label>Product Title</Label>
                      <Input placeholder="Wireless Headphones" />
                      <FieldError />
                    </TextField>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-2 gap-3">
                      <TextField isRequired name="price" type="number" defaultValue={selectedProduct?.price || ""}>
                        <Label>Price ($)</Label>
                        <Input placeholder="99.99" step="0.01" />
                        <FieldError />
                      </TextField>

                      <TextField isRequired name="stock" type="number" defaultValue={selectedProduct?.stock || ""}>
                        <Label>Stock</Label>
                        <Input placeholder="10" />
                        <FieldError />
                      </TextField>
                    </div>

                    {/* Category Select - LOCKED / DISABLED */}
                    <Select
                      isDisabled
                      selectedKey={vendorCategory}
                      className="opacity-75"
                    >
                      <Label>Category (Locked to Account)</Label>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {CATEGORIES.map((cat) => (
                            <ListBox.Item key={cat.value} id={cat.value} textValue={cat.label}>
                              <Label>{cat.label}</Label>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    {/* Image URL */}
                    <TextField isRequired name="image" type="url" defaultValue={selectedProduct?.image || ""}>
                      <Label>Image URL</Label>
                      <Input placeholder="https://example.com/product.jpg" />
                      <FieldError />
                    </TextField>

                    {/* Description */}
                    <TextField name="description" defaultValue={selectedProduct?.description || ""}>
                      <Label>Description</Label>
                      <Input placeholder="Short description..." />
                      <FieldError />
                    </TextField>
                  </Modal.Body>

                  <Modal.Footer className="flex items-center justify-end gap-2 pt-4 p-0">
                    <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold"
                      isLoading={isSubmitting}
                    >
                      {selectedProduct ? "Save Changes" : "Create Product"}
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewOpen && selectedProduct && (
        <Modal isOpen={isViewOpen} onOpenChange={setIsViewOpen}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="max-w-lg w-full bg-background rounded-2xl p-6 shadow-xl border border-default-200 dark:border-white/10">
                <Modal.CloseTrigger onClick={() => setIsViewOpen(false)} />

                <Modal.Header>
                  <Modal.Heading className="text-xl font-bold flex items-center gap-2">
                    <Eye className="text-amber-500" size={20} /> Product & Vendor Details
                  </Modal.Heading>
                </Modal.Header>

                <Modal.Body className="space-y-4 py-4 p-0">
                  {/* Image & Price Header */}
                  <div className="flex gap-4 items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-default-200/50">
                    {/* Updated with Next Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border shrink-0 bg-default-100">
                      <Image
                        src={selectedProduct.image || "/placeholder.png"}
                        alt={selectedProduct.title || "Product Image"}
                        fill
                        sizes="80px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{selectedProduct.title}</h3>
                      <p className="text-xl font-extrabold text-amber-500">${selectedProduct.price}</p>
                      <p className="text-xs text-default-500">Stock: {selectedProduct.stock} pcs</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-xs font-semibold text-default-500">Description</Label>
                    <p className="text-sm text-foreground bg-default-100/50 p-2.5 rounded-lg mt-1">
                      {selectedProduct.description || "No description provided."}
                    </p>
                  </div>

                  {/* Vendor Information Box */}
                  <div className="space-y-2 border-t border-default-200 pt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-default-400">
                      Vendor Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 bg-default-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                        <Store size={14} className="text-amber-500 shrink-0" />
                        <span className="truncate">Store: {selectedProduct.shopName || session?.user?.shopName || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-default-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                        <User size={14} className="text-amber-500 shrink-0" />
                        <span className="truncate">Owner: {selectedProduct.vendorName || session?.user?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-default-50 dark:bg-zinc-800/50 p-2 rounded-lg sm:col-span-2">
                        <Mail size={14} className="text-amber-500 shrink-0" />
                        <span className="truncate">Email: {selectedProduct.vendorEmail || session?.user?.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </Modal.Body>

                <Modal.Footer className="pt-2 p-0">
                  <Button className="w-full" variant="flat" onClick={() => setIsViewOpen(false)}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}

      {/* DELETE CONFIRMATION ALERT DIALOG (HeroUI Style) */}
      {isDeleteAlertOpen && (
        <AlertDialog isOpen={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialog.Backdrop>
            <AlertDialog.Container>
              <AlertDialog.Dialog className="max-w-sm w-full bg-background rounded-2xl p-6 shadow-xl border border-default-200 dark:border-white/10">
                <AlertDialog.CloseTrigger onClick={() => setIsDeleteAlertOpen(false)} />
                <AlertDialog.Header className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                    <AlertTriangle size={24} />
                  </div>
                  <AlertDialog.Heading className="text-lg font-bold text-foreground">
                    Delete Product
                  </AlertDialog.Heading>
                </AlertDialog.Header>

                <AlertDialog.Body className="text-center text-sm text-default-500 my-2">
                  Are you sure you want to delete this product? This action cannot be undone.
                </AlertDialog.Body>

                <AlertDialog.Footer className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="flat"
                    onClick={() => setIsDeleteAlertOpen(false)}
                    isDisabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    className="bg-red-600 text-white font-semibold"
                    onClick={confirmDelete}
                    isLoading={isSubmitting}
                  >
                    Delete
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      )}
    </div>
  );
}