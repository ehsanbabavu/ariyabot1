export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function createAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
