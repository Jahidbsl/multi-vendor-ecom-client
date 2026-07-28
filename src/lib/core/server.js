"use server";

import { headers } from "next/headers";
import { getUserToken } from "./session";

const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

// Helper to construct headers with Bearer Token and Cookies
const getHeaders = async (hasBody = false) => {
  let token = null;
  try {
    token = await getUserToken();
  } catch (e) {
    console.error("Error getting user token:", e);
  }

  // Next.js headers theke browser er cookie gulo anchi
  const cookieStore = await headers();
  const cookieHeader = cookieStore.get("cookie") || "";

  const reqHeaders = {};
  
  if (hasBody) {
    reqHeaders["Content-Type"] = "application/json";
  }

  // Cookie forward korchi jate backend-er verifyToken middleware session peye jay
  if (cookieHeader) {
    reqHeaders["Cookie"] = cookieHeader;
  }

  // Bearer token thakle tao add korchi
  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  return reqHeaders;
};

export const serverFetch = async (path) => {
  try {
    const headers = await getHeaders(false);
    const res = await fetch(`${baseurl}${path}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Fetch failed with status: ${res.status} for path: ${path}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Server fetch runtime error:", error);
    return { success: false, data: [] };
  }
};

export const serverMutation = async (path, data) => {
  const url = `${baseurl}${path}`;
  const headers = await getHeaders(true);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Expected JSON but got:\n${text}`);
  }

  return JSON.parse(text);
};

export const serverPatch = async (path, data) => {
  const url = `${baseurl}${path}`;
  const headers = await getHeaders(true);

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Expected JSON but got:\n${text}`);
  }

  return JSON.parse(text);
};

export const serverDelete = async (path, data) => {
  const url = `${baseurl}${path}`;
  const headers = await getHeaders(!!data);

  const res = await fetch(url, {
    method: "DELETE",
    headers,
    ...(data && { body: JSON.stringify(data) }),
  });

  const text = await res.text();

  if (res.status === 204 || !text) {
    return { success: true };
  }

  if (!res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Expected JSON but got:\n${text}`);
  }

  return JSON.parse(text);
};