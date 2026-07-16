"use server";

import { serverMutation } from "../core/server";
import { getUserSession } from "../core/session";

/**
 * Creates a Stripe checkout session via server mutation
 */
export const createCheckoutSession = async (checkoutData) => {
  // Fetch current user session on the server
  const user = await getUserSession();

  return serverMutation("/api/create-checkout-session", {
    ...checkoutData,
    userId: user?.id || checkoutData?.userId,
    userEmail: user?.email || checkoutData?.userEmail,
  });
};