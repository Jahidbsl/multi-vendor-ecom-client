export default async function sitemap() {
  const baseUrl = "https://multi-vendor-ecom-client.vercel.app";

  let dynamicProductPages = [];
  let dynamicCategoryPages = [];
  let dynamicVendorPages = [];

  try {
    const productRes = await fetch("https://multi-vendor-ecom-server.vercel.app/api/products");
    const products = await productRes.json();

    dynamicProductPages = products.map((product) => ({
      url: `${baseUrl}/products/${product._id || product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRes = await fetch("https://multi-vendor-ecom-server.vercel.app/api/categories");
    const categories = await categoryRes.json();

    dynamicCategoryPages = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug || category._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const vendorRes = await fetch("https://multi-vendor-ecom-server.vercel.app/api/vendors");
    const vendors = await vendorRes.json();

    dynamicVendorPages = vendors.map((vendor) => ({
      url: `${baseUrl}/vendors/${vendor.slug || vendor._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Sitemap generation error:", error);
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