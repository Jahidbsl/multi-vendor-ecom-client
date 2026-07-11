"use server";

import { serverMutation } from "../core/server";

export const submitApplicationForVendor = async (vendorData) => {
  return serverMutation("/api/vendor-request", vendorData);
};