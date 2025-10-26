import { getAuthHeaders } from "./auth";

export async function uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>) {
  const formData = new FormData();
  formData.append("file", file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {};
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("خطا در آپلود فایل");
  }

  return response.json();
}
