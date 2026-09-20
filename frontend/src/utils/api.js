import {
  getAccessToken,
  clearAuth,
} from "./auth";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

export async function apiFetch(
  endpoint,
  options = {}
) {
  const token =
    getAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  if (
    options.body &&
    typeof options.body !==
      "string"
  ) {
    headers["Content-Type"] =
      "application/json";

    options.body =
      JSON.stringify(options.body);
  }

  const response =
    await fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

  /*
   * Unauthorized / expired JWT
   */
  if (response.status === 401) {
    clearAuth();

    window.location.href =
      "/portal/login";

    throw new Error(
      "Your session has expired. Please login again."
    );
  }

  /*
   * Forbidden
   */
  if (response.status === 403) {
    throw new Error(
      "You do not have permission to perform this action."
    );
  }

  return response;
}