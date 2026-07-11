"use server";



const baseurl = process.env.NEXT_PUBLIC_BASE_URL;


export const serverFetch = async (path) => {
  try {
    const res = await fetch(`${baseurl}${path}`);
    
  
    if (!res.ok) {
      console.error(`Fetch failed with status: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Server fetch runtime error:", error);
    return null;
  }
};

export const serverMutation = async (path, data) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  console.log("URL:", url);
  console.log("Status:", res.status);
  console.log("Content-Type:", res.headers.get("content-type"));
  console.log("Body:", text);

  if (!res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Expected JSON but got:\n${text}`);
  }

  return JSON.parse(text);
};