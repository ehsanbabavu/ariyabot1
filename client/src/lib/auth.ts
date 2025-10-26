export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function createAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  // فقط برای درخواست‌هایی که FormData نیستند، Content-Type را تنظیم کن
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
