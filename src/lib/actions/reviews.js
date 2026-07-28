"use server";

import { serverMutation } from "../core/server";





export const createReview = async (reviewData) => {
  return serverMutation("/api/reviewRoutes", reviewData);
};