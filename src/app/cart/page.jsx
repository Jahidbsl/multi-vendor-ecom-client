"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, Button, Skeleton } from "@heroui/react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/checkout";

export default function CartPage() {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const userId = session?.user?.id;

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    "http://localhost:5000";

// 1. Fetch Cart Items for Logged-In User
  const fetchCartItems = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/cart/${userId}`);
      const data = await res.json();

      if (data?.success) {
        setCartItems(data.data || []);
      } else {
        toast.error(data?.message || "Failed to load cart items");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Network error loading cart.");
    } finally { // 👈 Fixed typo here
      setIsLoading(false);
    }
  }, [baseUrl, userId]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchCartItems();
    }
  }, [fetchCartItems, isAuthLoading]);

  // 2. Quantity Increment / Decrement Handler
  const handleUpdateQuantity = async (cartId, currentQty, newQty) => {
    if (newQty < 1) return;

    try {
      setUpdatingItemId(cartId);

      // Optimistic Update
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === cartId ? { ...item, quantity: newQty } : item,
        ),
      );

      const res = await fetch(`${baseUrl}/api/cart/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      const data = await res.json();

      if (!data?.success) {
        // Rollback state on failure
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item._id === cartId ? { ...item, quantity: currentQty } : item,
          ),
        );
        toast.error(data?.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Quantity update error:", error);
      toast.error("Network error while updating quantity.");
      // Rollback state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === cartId ? { ...item, quantity: currentQty } : item,
        ),
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  // 3. Remove Single Item from Cart
  const handleRemoveItem = async (cartId, itemTitle) => {
    try {
      setUpdatingItemId(cartId);

      const res = await fetch(`${baseUrl}/api/cart/${cartId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data?.success) {
        setCartItems((prev) => prev.filter((item) => item._id !== cartId));
        toast.success(`${itemTitle} removed from cart`);
      } else {
        toast.error(data?.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Remove cart error:", error);
      toast.error("Network error removing item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // 4. Clear Entire Cart
  const handleClearCart = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/cart/user/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data?.success) {
        setCartItems([]);
        toast.info("Cart cleared!");
      } else {
        toast.error(data?.message || "Failed to clear cart.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error clearing cart.");
    } finally {
      setIsLoading(false);
    }
  };

  // Subtotal calculation
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (parseFloat(item.price) || 0) * (item.quantity || 1),
    0,
  );
  const shippingFee = cartItems.length > 0 ? 10 : 0;
  const totalPrice = subtotal + shippingFee;

  // 5. Checkout Handler
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setIsCheckingOut(true);

      // Trigger server action to generate Stripe checkout session
      const res = await createCheckoutSession({
        userId: userId,
        products: cartItems,
      });

      // Verify server response for URL
      if (res?.url) {
        window.location.href = res.url; // Redirect to Stripe payment page
      } else {
        toast.error(
          res?.error || res?.message || "Failed to initiate checkout",
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred during checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <ShoppingCart size={64} className="text-default-300 mb-4" />
        <h2 className="text-2xl font-bold">Please Log In</h2>
        <p className="text-sm text-default-500 mt-1 mb-6">
          You need to be logged in to view and manage your shopping cart.
        </p>
        <Button
          as={Link}
          href="/login"
          color="amber"
          className="font-bold bg-amber-500 text-zinc-950"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50/50 dark:bg-zinc-950 text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-default-200 dark:border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <ShoppingCart className="text-amber-500" size={32} />
              Shopping Cart
            </h1>
            <p className="text-sm text-default-500 mt-1">
              Manage your selected items before proceeding to checkout.
            </p>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="flat"
              color="danger"
              size="sm"
              onClick={handleClearCart}
              className="text-xs font-semibold"
            >
              <Trash2 size={14} /> Clear Cart
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-20 bg-background rounded-3xl border border-default-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-bold">Your Cart is Empty</h3>
            <p className="text-sm text-default-500 max-w-sm mx-auto">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button
              as={Link}
              href="/products"
              className="bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold mt-2"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Button>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Side: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const itemTotal =
                  (parseFloat(item.price) || 0) * (item.quantity || 1);

                return (
                  <Card
                    key={item._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-default-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Item Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-default-200 dark:border-white/10">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.title || "Product"}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="font-bold text-base sm:text-lg text-foreground truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-default-500">
                          Unit Price:{" "}
                          <span className="font-semibold text-amber-500">
                            ${item.price}
                          </span>
                        </p>
                        <p className="text-sm font-extrabold text-foreground sm:hidden">
                          Total: ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls & Delete Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-default-100 dark:border-white/5">
                      {/* Increment / Decrement Counter */}
                      <div className="flex items-center gap-2 bg-default-100 dark:bg-zinc-800 p-1.5 rounded-xl border border-default-200 dark:border-white/10">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item._id,
                              item.quantity,
                              item.quantity - 1,
                            )
                          }
                          disabled={
                            item.quantity <= 1 || updatingItemId === item._id
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-background text-foreground hover:bg-default-200 disabled:opacity-40 transition-all text-xs font-bold"
                          title="Decrease Quantity"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-8 text-center font-bold text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item._id,
                              item.quantity,
                              item.quantity + 1,
                            )
                          }
                          disabled={updatingItemId === item._id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all text-xs font-bold"
                          title="Increase Quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Total Price Display */}
                      <div className="hidden sm:block text-right min-w-[80px]">
                        <span className="text-xs text-default-400 block">
                          Total
                        </span>
                        <span className="font-extrabold text-base text-amber-500">
                          ${itemTotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id, item.title)}
                        disabled={updatingItemId === item._id}
                        className="p-2 text-default-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Remove Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Card>
                );
              })}

              <div className="pt-2">
                <Button
                  as={Link}
                  href="/products"
                  variant="flat"
                  className="text-xs font-semibold"
                >
                  <ArrowLeft size={16} /> Continue Shopping
                </Button>
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="space-y-4">
              <Card className="p-6 border border-default-200 dark:border-white/10 rounded-3xl shadow-sm space-y-5">
                <h3 className="text-lg font-bold text-foreground pb-2 border-b border-default-100 dark:border-white/5">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-default-500">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-foreground">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-default-500">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-foreground">
                      ${shippingFee.toFixed(2)}
                    </span>
                  </div>

                  <hr className="border-default-200 dark:border-white/10 my-2" />
                  <div className="flex justify-between text-base font-extrabold text-foreground pt-1">
                    <span>Total Amount</span>
                    <span className="text-amber-500">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  isLoading={isCheckingOut}
                  disabled={isCheckingOut || cartItems.length === 0}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-950 font-extrabold text-base py-6 rounded-2xl shadow-lg transition-all"
                >
                  <CreditCard size={18} />{" "}
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-default-400 pt-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Secure 256-bit SSL Encrypted Checkout</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}