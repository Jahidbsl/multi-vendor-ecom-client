"use server";

import { serverMutation, serverPatch } from "../core/server";

export const submitApplicationForVendor = async (vendorData) => {
  return serverMutation("/api/vendor-request", vendorData);
};



export const AdminUpdateVendorRequestStatus = async (id, status) => {
  return serverPatch(`/api/vendor-requests/${id}/status`, { status });

}


export const AdminUpdateVendorStatus = async (id, status) => {
  return serverPatch(`/api/vendors/${id}/status`, { status });
};

