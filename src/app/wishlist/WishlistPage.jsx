"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

export default function WishlistPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const userId = session?.user?.id;

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const fetchWishlist = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/wishlist`);
      const data = await res.json();
      
      if (data.success) {
        setWishlistProducts(data.data);
      } else {
        setError(data.message || "Failed to load wishlist items.");
      }
    } catch (err) {
      setError("Failed to load wishlist items.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    } else if (!sessionLoading) {
      setLoading(false);
    }
  }, [userId, sessionLoading]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${productId}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (data.success) {
        setWishlistProducts((prev) => prev.filter((item) => item._id !== productId));
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (err) {
      console.error("Error removing from wishlist", err);
    }
  };

  const handleAddToCart = async (product) => {
    if (isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.image,
          vendorId: product.vendorId,
          quantity: 1,
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Item added to cart!");
      }
    } catch (err) {
      console.error("Error adding to cart", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm tracking-wide">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 mb-6">Please log in to view and manage your wishlist.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] px-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-neutral-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Wishlist</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage your saved items and add them to cart</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 w-fit">
          Total Items: <span className="text-indigo-400 font-bold">{wishlistProducts.length}</span>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-800 text-center px-4">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center text-2xl mb-4 text-gray-400">
            🛍️
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm max-w-sm">Explore our store and save your favorite items to view them here later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistProducts.map((product) => (
            <Card key={product._id} className="flex flex-col justify-between overflow-hidden shadow-xl border border-neutral-800 rounded-2xl bg-neutral-900 text-white hover:border-neutral-700 transition-all duration-300">
              <Card.Header className="p-0 relative">
                <div className="relative h-72 w-full bg-neutral-950 overflow-hidden">
                  <Image
                    src={product.image || "https://via.placeholder.com/300"}
                    alt={product.title || "Product image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="absolute top-3 right-3 z-10 bg-neutral-900/80 hover:bg-neutral-900 backdrop-blur-md text-red-500 p-2.5 rounded-full shadow-lg transition transform hover:scale-110 active:scale-95"
                    title="Remove from wishlist"
                  >
                    ❤️
                  </button>
                </div>
              </Card.Header>

              <Card.Content className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md font-semibold inline-block mb-3">
                    {product.category || "General"}
                  </span>
                  <Card.Title className="font-bold text-white text-lg line-clamp-1 hover:text-indigo-400 transition-colors">
                    {product.title}
                  </Card.Title>
                  <Card.Description className="text-neutral-400 text-sm line-clamp-2 mt-2 leading-relaxed">
                    {product.description || "No description available for this product."}
                  </Card.Description>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-extrabold text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded">In Stock</span>
                  ) : (
                    <span className="text-xs text-red-400 font-medium bg-red-500/10 px-2.5 py-1 rounded">Out of Stock</span>
                  )}
                </div>
              </Card.Content>

              <Card.Footer className="p-6 pt-0 bg-transparent border-t-0">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isAddingToCart}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-3.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50"
                >
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}