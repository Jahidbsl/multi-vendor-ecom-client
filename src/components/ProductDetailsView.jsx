"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Modal,
  Select,
  ListBox,
  Label,
  TextField,
  Input,
} from "@heroui/react";
import {
  Store,
  CheckCircle2,
  ShoppingCart,
  Heart,
  Flag,
  ThumbsUp,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  toggleProductLike,
  toggleProductWishlist,
  addToCart,
  submitProductReport,
} from "@/lib/actions/products";

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

export default function ProductDetailsView({ product, userId: userIdProp }) {
  const router = useRouter();

  // Fallback to live session if the parent didn't pass a valid userId.
  // This is exactly what the (working) modal version relied on — the
  // details page dropped it, which is why actions silently no-op'd
  // whenever the prop came through empty/stale.
  const { data: session } = authClient.useSession();
  const userId = userIdProp || session?.user?.id;

  const [likeCount, setLikeCount] = useState(product.likesCount || product.likes || 0);
  const [isLiked, setIsLiked] = useState(product.likedBy?.includes(userId) || false);
  const [isFavorite, setIsFavorite] = useState(product.favoritedBy?.includes(userId) || false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // ---- Like ----------------------------------------------------------
  const handleToggleLike = async () => {
    if (!userId) {
      toast.error("Please login to like products!");
      return;
    }
    if (isActionPending) return;

    const nextLikedState = !isLiked;
    try {
      setIsActionPending(true);

      // Optimistic update
      setIsLiked(nextLikedState);
      setLikeCount((prev) => (nextLikedState ? prev + 1 : prev - 1));

      const result = await toggleProductLike(product._id, userId);

      if (!result?.success) {
        // Rollback on failure — the modal version had this, the details
        // page didn't, which made it look "broken" on error.
        setIsLiked(!nextLikedState);
        setLikeCount((prev) => (nextLikedState ? prev - 1 : prev + 1));
        toast.error(result?.message || "Failed to update like status");
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

  // ---- Wishlist / Favorite -------------------------------------------
  const handleToggleFavorite = async () => {
    if (!userId) {
      toast.error("Please login to add to wishlist!");
      return;
    }
    if (isActionPending) return;

    const nextFavoriteState = !isFavorite;
    try {
      setIsActionPending(true);
      setIsFavorite(nextFavoriteState);

      const result = await toggleProductWishlist(product._id, userId);

      if (result?.success) {
        toast.success(nextFavoriteState ? "Added to Wishlist!" : "Removed from Wishlist!");
      } else {
        setIsFavorite(!nextFavoriteState);
        toast.error(result?.message || "Wishlist update failed");
      }
    } catch (err) {
      console.error(err);
      setIsFavorite(!nextFavoriteState);
      toast.error("Network error updating wishlist");
    } finally {
      setIsActionPending(false);
    }
  };

  // ---- Add to Cart -----------------------------------------------------
  // The previous version never sent `userId` in the payload, so the
  // server action had nothing to attach the cart item to.
  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please login to add items to your cart!");
      return;
    }
    if (isAddingToCart) return;

    try {
      setIsAddingToCart(true);

      const cartPayload = {
        userId: userId,
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
        vendorId: product.vendorId,
        quantity: 1,
      };

      const result = await addToCart(cartPayload);

      if (result?.success) {
        toast.success(`${product.title} added to cart!`);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result?.message || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while updating cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ---- Report -----------------------------------------------------------
  // The previous payload was missing `reportedBy` (who's reporting) and
  // `productTitle`, both of which the working modal version sent.
  const handleOpenReport = () => {
    if (!userId) {
      toast.error("Please login to report items!");
      return;
    }
    setSelectedReportReason("");
    setReportDetails("");
    setIsReportOpen(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!selectedReportReason) {
      toast.error("Please select a reason for reporting!");
      return;
    }

    try {
      setIsSubmittingReport(true);

      const reportPayload = {
        productId: product._id,
        productTitle: product.title,
        reportedBy: userId,
        reason: selectedReportReason,
        additionalInfo: reportDetails,
      };

      const result = await submitProductReport(reportPayload);

      if (result?.success) {
        toast.success("Report submitted successfully! Admin will review this item.");
        setIsReportOpen(false);
      } else {
        toast.error(result?.message || "Failed to submit report.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while submitting report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full bg-background rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-default-200 dark:border-white/10 shadow-xl"
    >
      <Button
        variant="flat"
        className="mb-4 sm:mb-6"
        onClick={() => router.back()}
        as={motion.button}
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={16} /> Back
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-default-100 dark:border-white/5">
        <span className="capitalize text-xs font-bold bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full">
          {product.category}
        </span>

        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="flat"
              size="sm"
              className={`rounded-full transition-colors ${
                isLiked ? "bg-blue-500 text-white" : ""
              }`}
              onClick={handleToggleLike}
              disabled={isActionPending}
            >
              <motion.span
                key={isLiked ? "liked" : "unliked"}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex items-center gap-1.5"
              >
                <ThumbsUp size={14} className={isLiked ? "fill-white" : ""} />
                {likeCount}
              </motion.span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="flat"
              size="sm"
              className={`rounded-full transition-colors ${
                isFavorite ? "bg-rose-500 text-white" : ""
              }`}
              onClick={handleToggleFavorite}
              disabled={isActionPending}
            >
              <motion.span
                animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart size={14} className={isFavorite ? "fill-white" : ""} />
              </motion.span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="flat"
              size="sm"
              className="rounded-full text-red-500 hover:bg-red-500/10"
              onClick={handleOpenReport}
            >
              <Flag size={14} />
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mt-5 sm:mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-square rounded-2xl overflow-hidden bg-default-100"
        >
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.title || "Product image"}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5 sm:space-y-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-500">
                ${product.price}
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> In Stock ({product.stock || 0})
              </span>
            </div>
          </div>

          <p className="text-sm text-default-600 leading-relaxed bg-default-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-default-200 dark:border-white/5 max-h-40 overflow-y-auto">
            {product.description || "No description provided."}
          </p>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Store size={22} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate">
                {product.shopName || "Certified Vendor"}
              </p>
              <p className="text-xs text-default-500 truncate">
                {product.vendorEmail || "vendor@store.com"}
              </p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-900 font-extrabold text-base sm:text-lg py-6 sm:py-8 rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all"
              onClick={handleAddToCart}
              isLoading={isAddingToCart}
            >
              <ShoppingCart size={20} /> Add to Cart
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isReportOpen && (
          <Modal isOpen={isReportOpen} onOpenChange={setIsReportOpen}>
            <Modal.Backdrop>
              <Modal.Container>
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Modal.Dialog className="max-w-md w-full bg-background rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-default-200 dark:border-white/10">
                    <Modal.CloseTrigger onClick={() => setIsReportOpen(false)} />

                    <Modal.Header className="flex items-center gap-3 pb-4 border-b border-default-100 dark:border-white/5">
                      <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="min-w-0">
                        <Modal.Heading className="text-lg font-bold text-foreground">
                          Report Product
                        </Modal.Heading>
                        <p className="text-xs text-default-500 truncate">
                          {product.title}
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

                      <Modal.Footer className="pt-4 p-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-default-100 dark:border-white/5">
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
                </motion.div>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}