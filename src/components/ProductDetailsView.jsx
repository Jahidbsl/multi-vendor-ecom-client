// components/ProductDetailsView.jsx
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
  ChevronRight,
  AlertTriangle,
  Clock,
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

  const { data: session } = authClient.useSession();
  const userId = userIdProp || session?.user?.id;

  // Combine Product Images & Variant Images into a single unique array for the slider
  const rawImages = [
    product.image,
    ...(product.images || []),
    ...(product.variants?.map((v) => v.image) || []),
  ].filter(Boolean);

  const allImages = Array.from(new Set(rawImages));
  if (allImages.length === 0) allImages.push("/placeholder.png");

  const [activeImage, setActiveImage] = useState(allImages[0]);

  // Image Slider Next / Prev Handlers
  const handleNextImage = () => {
    const currentIndex = allImages.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setActiveImage(allImages[nextIndex]);
  };

  const handlePrevImage = () => {
    const currentIndex = allImages.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIndex]);
  };

  // Variant States - Initially Empty (Normally ektao selected thakbe na)
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Handle Variant Selection instantly without any loading delay
  const handleVariantSelect = (size, color) => {
    const newSize = size !== undefined ? size : selectedSize;
    const newColor = color !== undefined ? color : selectedColor;

    if (size !== undefined) setSelectedSize(size);
    if (color !== undefined) setSelectedColor(color);

    // Find matching variant image instantly
    const matchedVariant = product.variants?.find(
      (v) =>
        (!newSize || v.size === newSize) &&
        (!newColor || v.color === newColor) &&
        v.image
    );

    if (matchedVariant?.image) {
      setActiveImage(matchedVariant.image);
    }
  };

  const [likeCount, setLikeCount] = useState(
    product.likesCount || product.likes || 0,
  );
  const [isLiked, setIsLiked] = useState(
    product.likedBy?.includes(userId) || false,
  );
  const [isFavorite, setIsFavorite] = useState(
    product.favoritedBy?.includes(userId) || false,
  );
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
      setIsLiked(nextLikedState);
      setLikeCount((prev) => (nextLikedState ? prev + 1 : prev - 1));

      const result = await toggleProductLike(product._id, userId);

      if (!result?.success) {
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
        toast.success(
          nextFavoriteState ? "Added to Wishlist!" : "Removed from Wishlist!",
        );
        
        window.dispatchEvent(new Event("wishlistUpdated"));
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
        image: activeImage,
        size: selectedSize,
        color: selectedColor,
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
        toast.success(
          "Report submitted successfully! Admin will review this item.",
        );
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mt-5 sm:mt-6 items-start">
        {/* COMBINED IMAGE SLIDER & THUMBNAILS SECTION */}
        <div className="space-y-3 w-full min-w-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-full aspect-square rounded-2xl overflow-hidden bg-default-100 border border-default-200 dark:border-white/10 group"
          >
            <Image
              src={activeImage}
              alt={product.title || "Product image"}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />

            {/* Slider Controls */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 shadow-md"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 shadow-md"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </motion.div>

          {/* Thumbnails Gallery */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full max-w-full">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-default-100 ${
                    activeImage === img
                      ? "border-amber-500 scale-105 shadow-sm"
                      : "border-default-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${index}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS & VARIANTS SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5 sm:space-y-6 min-w-0"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
              {product.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-amber-500">
                  ${product.price}
                </span>

                {product.hasDiscount && product.originalPrice && (
                  <span className="text-lg font-bold text-default-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {product.hasDiscount &&
                product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full shadow-md">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100,
                    )}
                    % OFF
                  </span>
                )}

              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> In Stock ({product.stock || 0})
              </span>
            </div>

            {/* DISCOUNT DEADLINE SECTION */}
            {product.hasDiscount && product.endDate && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl w-fit border border-amber-500/20">
                <Clock size={14} />
                <span>
                  Offer ends on: {new Date(product.endDate).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-default-600 leading-relaxed bg-default-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-default-200 dark:border-white/5 max-h-40 overflow-y-auto">
            {product.description || "No description provided."}
          </p>

          {/* VARIANTS SELECTION (SIZE & COLOR) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-default-200 dark:border-white/5">
              {/* Sizes */}
              {product.variants.some((v) => v.size) && (
                <div>
                  <label className="text-xs font-bold text-default-500 uppercase tracking-wider mb-1.5 block">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        product.variants.map((v) => v.size).filter(Boolean),
                      ),
                    ).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleVariantSelect(size, undefined)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === size
                            ? "bg-amber-500 text-zinc-900 border-amber-500 shadow-md"
                            : "bg-default-100 text-foreground border-default-200 hover:border-amber-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.variants.some((v) => v.color) && (
                <div>
                  <label className="text-xs font-bold text-default-500 uppercase tracking-wider mb-1.5 block">
                    Select Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        product.variants.map((v) => v.color).filter(Boolean),
                      ),
                    ).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleVariantSelect(undefined, color)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedColor === color
                            ? "bg-amber-500 text-zinc-900 border-amber-500 shadow-md"
                            : "bg-default-100 text-foreground border-default-200 hover:border-amber-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* REPORT MODAL */}
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
                    <Modal.CloseTrigger
                      onClick={() => setIsReportOpen(false)}
                    />

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

                    <form
                      onSubmit={handleSubmitReport}
                      className="space-y-4 mt-4"
                    >
                      <Modal.Body className="p-0 space-y-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-default-600">
                            Select Reason{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            placeholder="Select a reason for reporting"
                            value={selectedReportReason}
                            onChange={(val) =>
                              setSelectedReportReason(
                                typeof val === "object"
                                  ? val?.target?.value
                                  : val,
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