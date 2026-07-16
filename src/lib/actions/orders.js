"use server";

import {  serverPatch } from "../core/server";

/**
 * Server action to update vendor order status
 */
export async function updateOrderStatus({ orderId, status }) {
  return serverPatch(`/api/vendor/orders/${orderId}`, {
    method: "PATCH",
    status,
  });
}