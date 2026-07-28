export default async function sitemap() {
  const baseUrl = "https://multi-vendor-ecom-client.vercel.app";

  let dynamicProductPages = [];
  let dynamicCategoryPages = [];
  let dynamicVendorPages = [];

  // 1. Fetch Products Safely
  try {
    const productRes = await fetch("https://multi-vendor-ecom-server.vercel.app/api/products");
    if (productRes.ok) {
      const products = await productRes.json();
      dynamicProductPages = products.map((product) => ({
        url: `${baseUrl}/products/${product._id || product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch products for sitemap");
  }

  // 2. Fetch Categories Safely
  try {
    const categoryRes = await fetch("https://multi-vendor-ecom-server.vercel.app/api/categories");
    if (categoryRes.ok) {
      const categories = await categoryRes.json();
      dynamicCategoryPages = categories.map((category) => ({
        url: `${baseUrl}/categories/${category.slug || category._id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch categories for sitemap");
  }

  // 3. Fetch Vendors Safely
  try {
    const vendorRes = await fetch("https://multi-vendor-ecom-server.vercel.app/api/vendors");
    if (vendorRes.ok) {
      const vendors = await vendorRes.json();
      dynamicVendorPages = vendors.map((vendor) => ({
        url: `${baseUrl}/vendors/${vendor.slug || vendor._id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch vendors for sitemap");
  }

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vendors`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  return [
    ...staticPages,
    ...dynamicCategoryPages,
    ...dynamicVendorPages,
    ...dynamicProductPages,
  ];
}