"use server";

import { serverMutation } from "../core/server";

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// export async function (reviewData) {
//   try {
//     const res = await fetch(`${BASE_URL}/api/reviewRoutes`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(reviewData),
//     });

//     const data = await res.json();
//     return data;
//   } catch (error) {
//     console.error("Error submitting review:", error);
//     return { success: false, message: "Server connection failed" };
//   }
// }



export const createReview = async (reviewData) => {
  return serverMutation("/api/reviewRoutes", reviewData);
};