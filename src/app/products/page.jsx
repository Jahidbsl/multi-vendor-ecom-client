"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  Button,
  Modal,
  Skeleton,
  Select,
  ListBox,
  Label,
  TextField,
  Input,
} from "@heroui/react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import {
  Eye,
  Store,
  Package,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Heart,
  ThumbsUp,
  Flag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Imports from Server Actions / API Handlers
import {
  addToCart,
  submitProductReport,
  toggleProductLike,
  toggleProductWishlist,
} from "@/lib/actions/products";
import { getProducts } from "@/lib/api/produts";
import Link from "next/link";

// Report Reasons List
const REPORT_REASONS = [
  { value: "fake_product", label: "Fake or Counterfeit Product" },
  { value: "misleading_info", label: "Misleading Title or Description" },
  { value: "wrong_category", label: "Wrong Category Classification" },
  { value: "wrong_price", label: "Incorrect or Suspicious Price" },
  { value: "copyright_issue", label: "Copyright or Trademark Violation" },
  { value: "inappropriate_content", label: "Inappropriate Images or Content" },
  { value: "out_of_stock", label: "Item Continuously Out of Stock" },
  { value: "other", label: "Other Issues" },
];

export default function AllProductsPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Interactive Dynamic States
  const [isFavorite, setIsFavorite] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  // Pagination State
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 8,
  });

  // 1. Fetch Products via serverFetch Action
  const fetchProducts = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        const data = await getProducts(page, pagination.limit);

        if (data?.success) {
          setProducts(data.data || []);
          if (data.pagination) {
            setPagination((prev) => ({
              ...prev,
              currentPage: data.pagination.currentPage,
              totalPages: data.pagination.totalPages,
              totalProducts: data.pagination.totalProducts,
            }));
          }
        } else {
          toast.error(data?.message || "Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    fetchProducts(pagination.currentPage);
  }, [fetchProducts, pagination.currentPage]);

  // 2. Open View Modal & Check Product User States
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setLikeCount(product.likesCount || product.likes || 0);

    const userLiked = product.likedBy?.includes(userId) || false;
    const userFavorited = product.favoritedBy?.includes(userId) || false;

    setIsLiked(userLiked);
    setIsFavorite(userFavorited);
    setIsViewOpen(true);
  };

  // 3. Dynamic Toggle Like via serverMutation Action
  const handleToggleLike = async () => {
    if (!userId) {
      toast.error("Please login to like products!");
      return;
    }
    if (isActionPending) return;

    const nextLikedState = !isLiked;
    try {
      setIsActionPending(true);

      // Optimistic UI Update
      setIsLiked(nextLikedState);
      setLikeCount((prev) => (nextLikedState ? prev + 1 : prev - 1));

      const data = await toggleProductLike(selectedProduct._id, userId);

      if (!data?.success) {
        // Rollback on error
        setIsLiked(!nextLikedState);
        setLikeCount((prev) => (nextLikedState ? prev - 1 : prev + 1));
        toast.error(data?.message || "Failed to update like status");
      }
    } catch (err) {
      console.error(err);
      setIsLiked(!nextLikedState);
      setLikeCount((prev) => (nextLikedState ? prev - 1 : prev + 1));
      toast.error("Network error updating like state");
    } finally {
      setIsActionPending(false);
    }
  };

  // 4. Dynamic Toggle Wishlist / Favorite via serverMutation Action
  const handleToggleFavorite = async () => {
    if (!userId) {
      toast.error("Please login to add to wishlist!");
      return;
    }
    if (isActionPending) return;

    const nextFavoriteState = !isFavorite;
    try {
      setIsActionPending(true);

      // Optimistic UI Update
      setIsFavorite(nextFavoriteState);

      const data = await toggleProductWishlist(selectedProduct._id, userId);

      if (data?.success) {
        toast.success(
          nextFavoriteState ? "Added to Wishlist!" : "Removed from Wishlist!",
        );
      } else {
        // Rollback on error
        setIsFavorite(!nextFavoriteState);
        toast.error(data?.message || "Wishlist update failed");
      }
    } catch (err) {
      console.error(err);
      setIsFavorite(!nextFavoriteState);
      toast.error("Network error updating wishlist");
    } finally {
      setIsActionPending(false);
    }
  };

  // 5. Open Report Modal
  const handleOpenReport = () => {
    if (!userId) {
      toast.error("Please login to report items!");
      return;
    }
    setSelectedReportReason("");
    setReportDetails("");
    setIsReportOpen(true);
  };

  // 6. Submit Report via serverMutation Action
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!selectedReportReason) {
      toast.error("Please select a reason for reporting!");
      return;
    }

    try {
      setIsSubmittingReport(true);

      const reportPayload = {
        productId: selectedProduct?._id,
        productTitle: selectedProduct?.title,
        reportedBy: userId,
        reason: selectedReportReason,
        additionalInfo: reportDetails,
      };

      const data = await submitProductReport(reportPayload);

      if (data?.success) {
        toast.success(
          "Report submitted successfully! Admin will review this item.",
        );
        setIsReportOpen(false);
      } else {
        toast.error(data?.message || "Failed to submit report.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while submitting report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // 7. Add to Cart Handler via serverMutation Action
  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please login to add items to your cart!");
      return;
    }

    try {
      const cartPayload = {
        userId: userId,
        productId: selectedProduct._id,
        title: selectedProduct.title,
        price: selectedProduct.price,
        image: selectedProduct.image,
        vendorId: selectedProduct.vendorId,
        quantity: 1,
      };

      const data = await addToCart(cartPayload);

      if (data?.success) {
        toast.success(`${selectedProduct.title} added to cart!`);
        // Trigger auto-reload for Navbar cart counter
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(data?.message || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while updating cart.");
    }
  };

  return (
    <div className="min-h-screen bg-default-50/50 dark:bg-zinc-950 text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-default-200 dark:border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <ShoppingBag className="text-amber-500" size={32} />
              Explore All Products
            </h1>
            <p className="text-sm text-default-500 mt-1">
              Browse authentic items directly offered by certified vendors.
            </p>
          </div>
          <div className="text-sm font-semibold text-default-600 bg-background border border-default-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-sm">
            Total Products:{" "}
            <span className="text-amber-500">{pagination.totalProducts}</span>
          </div>
        </div>

        {/* Products Grid / Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: pagination.limit }).map((_, idx) => (
              <Card key={idx} className="relative h-[300px] sm:h-[350px] p-4">
                <Skeleton className="absolute inset-0 w-full h-full rounded-2xl" />
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-2xl border border-default-200 dark:border-white/10">
            <Package size={48} className="mx-auto text-default-400 mb-3" />
            <h3 className="text-lg font-bold">No Products Available</h3>
            <p className="text-sm text-default-500">
              Check back later for new items from our vendors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product._id}
                className="relative h-[300px] sm:h-[350px] group overflow-hidden rounded-2xl border border-default-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <span className="absolute top-3 left-3 z-20 capitalize text-xs font-semibold bg-zinc-900/80 backdrop-blur-md text-amber-400 border border-amber-400/20 px-3 py-1 rounded-full">
                  {product.category}
                </span>

                <Image
                  src={product.image || "/placeholder.png"}
                  alt={product.title || "Product Image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                <Card.Footer className="z-20 mt-auto flex items-end justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-white sm:text-lg truncate">
                      {product.title}
                    </div>
                    <div className="text-xs font-semibold text-amber-400 sm:text-sm">
                      ${product.price}
                    </div>
                  </div>
                  <Link
                    href={`/products/${product._id}-${product.title.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <Button
                      className="bg-white/20 hover:bg-amber-400 text-white font-semibold"
                      size="sm"
                    >
                      <Eye size={16} /> View Details
                    </Button>
                  </Link>
                </Card.Footer>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background border border-default-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <span className="text-sm text-default-500">
              Showing Page{" "}
              <span className="font-semibold text-foreground">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {pagination.totalPages}
              </span>
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                isDisabled={pagination.currentPage <= 1}
                onClick={() => fetchProducts(pagination.currentPage - 1)}
              >
                <ArrowLeft size={16} /> Previous
              </Button>

              <Button
                size="sm"
                variant="flat"
                isDisabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => fetchProducts(pagination.currentPage + 1)}
              >
                Next <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILS MODAL WITH DYNAMIC ACTIONS */}
      {isViewOpen && selectedProduct && (
        <Modal isOpen={isViewOpen} onOpenChange={setIsViewOpen}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="max-w-2xl w-full bg-background rounded-3xl p-6 sm:p-8 shadow-2xl border border-default-200 dark:border-white/10 overflow-hidden">
                <Modal.CloseTrigger onClick={() => setIsViewOpen(false)} />

                <Modal.Body className="space-y-6 p-0">
                  {/* Top Action Bar */}
                  <div className="flex items-center justify-between pr-8 border-b border-default-100 dark:border-white/5 pb-4">
                    <span className="capitalize text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full">
                      {selectedProduct.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Dynamic Like */}
                      <button
                        onClick={handleToggleLike}
                        disabled={isActionPending}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          isLiked
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-default-100 dark:bg-zinc-800 text-default-600 hover:bg-default-200"
                        }`}
                      >
                        <ThumbsUp
                          size={14}
                          className={isLiked ? "fill-white" : ""}
                        />
                        <span>{likeCount}</span>
                      </button>

                      {/* Dynamic Wishlist / Favorite */}
                      <button
                        onClick={handleToggleFavorite}
                        disabled={isActionPending}
                        className={`p-2 rounded-full border transition-all ${
                          isFavorite
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-default-100 dark:bg-zinc-800 text-default-600 hover:bg-default-200"
                        }`}
                        title="Wishlist"
                      >
                        <Heart
                          size={16}
                          className={isFavorite ? "fill-white" : ""}
                        />
                      </button>

                      {/* Dynamic Report Trigger */}
                      <button
                        onClick={handleOpenReport}
                        className="p-2 bg-default-100 dark:bg-zinc-800 text-default-400 hover:text-red-500 hover:bg-red-500/10 rounded-full border border-transparent transition-all"
                        title="Report Item"
                      >
                        <Flag size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Main Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-default-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={selectedProduct.image || "/placeholder.png"}
                        alt={selectedProduct.title || "Product Image"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-black text-foreground leading-tight">
                          {selectedProduct.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-3xl font-extrabold text-amber-500">
                            ${selectedProduct.price}
                          </span>
                          <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> In Stock (
                            {selectedProduct.stock || 0})
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                          Description
                        </span>
                        <p className="text-xs sm:text-sm text-default-600 leading-relaxed bg-default-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-default-200/50 dark:border-white/5 max-h-32 overflow-y-auto">
                          {selectedProduct.description ||
                            "No detailed description provided."}
                        </p>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                          <Store size={20} />
                        </div>
                        <div className="text-xs min-w-0">
                          <p className="font-bold text-foreground truncate">
                            {selectedProduct.shopName ||
                              "Certified Vendor Shop"}
                          </p>
                          <p className="text-default-500 truncate">
                            {selectedProduct.vendorEmail || "vendor@store.com"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Modal.Body>

                <Modal.Footer className="mt-6 pt-4 border-t border-default-100 dark:border-white/10 p-0 flex items-center gap-3">
                  <Button
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-zinc-900 font-extrabold text-base py-6 rounded-2xl shadow-lg transition-all"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={20} /> Add to Cart
                  </Button>

                  <Button
                    variant="flat"
                    className="bg-default-100 dark:bg-zinc-800 font-semibold py-6 rounded-2xl"
                    onClick={() => setIsViewOpen(false)}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}

      {/* REPORT MODAL */}
      {isReportOpen && selectedProduct && (
        <Modal isOpen={isReportOpen} onOpenChange={setIsReportOpen}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="max-w-md w-full bg-background rounded-3xl p-6 shadow-2xl border border-default-200 dark:border-white/10">
                <Modal.CloseTrigger onClick={() => setIsReportOpen(false)} />

                <Modal.Header className="flex items-center gap-3 pb-2 border-b border-default-100 dark:border-white/5">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <Modal.Heading className="text-lg font-bold text-foreground">
                      Report Product
                    </Modal.Heading>
                    <p className="text-xs text-default-500 truncate max-w-[240px]">
                      {selectedProduct.title}
                    </p>
                  </div>
                </Modal.Header>

                <form onSubmit={handleSubmitReport} className="space-y-4 mt-4">
                  <Modal.Body className="p-0 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-default-600">
                        Select Reason <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        placeholder="Select a reason for reporting"
                        value={selectedReportReason}
                        onChange={(val) =>
                          setSelectedReportReason(
                            typeof val === "object" ? val?.target?.value : val,
                          )
                        }
                        className="w-full"
                      >
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {REPORT_REASONS.map((reason) => (
                              <ListBox.Item
                                key={reason.value}
                                id={reason.value}
                                textValue={reason.label}
                              >
                                <Label>{reason.label}</Label>
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>

                    <TextField className="space-y-1">
                      <Label className="text-xs font-bold text-default-600">
                        Additional Details (Optional)
                      </Label>
                      <Input
                        placeholder="Tell us more about the problem..."
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                      />
                    </TextField>
                  </Modal.Body>

                  <Modal.Footer className="pt-4 p-0 flex items-center justify-end gap-2 border-t border-default-100 dark:border-white/5">
                    <Button
                      type="button"
                      variant="flat"
                      onClick={() => setIsReportOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="danger"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold"
                      isLoading={isSubmittingReport}
                    >
                      <Flag size={16} /> Submit Report
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}
    </div>
  );
}
