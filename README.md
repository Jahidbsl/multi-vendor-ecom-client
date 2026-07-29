# ShopVerse - Multi-Vendor E-Commerce Platform

A feature-rich, modern multi-vendor e-commerce platform built with Next.js App Router, designed to provide seamless shopping experiences, multi-vendor operations, and robust administrative control.

🌐 **Live Demo:** [https://multi-vendor-ecom-client.vercel.app](https://multi-vendor-ecom-client.vercel.app)

---

## 🛠️ Tech Stack

This project is built using modern web development technologies:

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **UI Component Library:** [HeroUI](https://www.heroui.com/)
* **Icons:** [@gravity-ui/icons](https://gravity-ui.com/icons) & [React Icons](https://react-icons.github.io/react-icons/)
* **Notifications:** [React Toastify](https://fkhadra.github.io/react-toastify/)
* **Animations:** LottieFiles
* **Authentication:** [Better Auth](https://www.better-auth.com/) (with custom Admin plugin integration & Session Token Verification)
* **Payments:** Stripe Payment Gateway

---

## ✨ Key Features

* **Multi-Role Dashboards:** Fully functional, dedicated dashboards for **Admins** and **Vendors** to oversee business metrics, manage products, and handle orders.
* **Dynamic Homepage Customization:** Admin-controlled dynamic discount banners, feature cards, top-selling products, and top vendor showcases.
* **Advanced Financial System:** Comprehensive profit earning calculations for both admins and vendors, complete with secure withdrawal requests and management.
* **Optimized Performance:** Server-side pagination for large product catalogs to ensure blazing-fast loading speeds.
* **Secure Authentication & Session Security:** Credentials-based secure login alongside **Google Social Login** powered by Better Auth, featuring robust session token verification for route protection and role-based access control.
* **Stripe Checkout:** Seamless and secure payment processing for customers.
* **SEO & Discoverability:** Fully optimized metadata, robots configuration, and automated dynamic sitemap (`/sitemap.xml`) integrated with **Google Search Console**.

---

## ⚙️ Backend Deployment & Cold Start Behavior (Render Free Tier)

**Issue / Problem:**
When hosting the backend server on **Render's Free Tier**, the server automatically spins down (goes to "sleep") after 15 minutes of inactivity. As a result, when a user tries to access the application or navigate to a different page after a period of inactivity, the initial API request may experience a delay of 30 to 50 seconds while the server wakes up from its idle state.

**Solution / Workaround:**
To mitigate this cold start latency and ensure continuous uptime, the following measures have been implemented:

* **Uptime Monitoring & Keep-Alive:** A scheduled cron job (configured via **cron-job.org** or **UptimeRobot**) sends automated HTTP requests to the backend endpoint every minute (`1-minute interval`).
* **Active State Maintenance:** This constant pinging keeps the server active and responsive, preventing it from spinning down and ensuring seamless navigation across all application pages without noticeable loading delays.

---

## 🔐 Password Requirements

When registering for an account, your password must meet the following validation criteria:

* **Minimum Length:** 8 characters
* **Maximum Length:** Unlimited
* **Uppercase Letter:** At least one uppercase letter (`A-Z`)
* **Number:** At least one numerical digit (`0-9`)
* **Confirmation:** The *Confirm Password* field must match the *Password* field exactly.

### Password Validation Examples

| Password | Valid? | Reason |
| --- | --- | --- |
| `pass123` | ❌ | Missing an uppercase letter |
| `PASSWORD` | ❌ | Missing a number |
| `Password123` | ✅ | Meets all criteria |
| `MySecurePass2026!` | ✅ | Meets all criteria |

---

## 🧪 Admin Test Credentials

To explore the admin features and dashboard management experience instantly, use the following credentials:

* **Email:** `admin@gmail.com`
* **Password:** `Password@1`