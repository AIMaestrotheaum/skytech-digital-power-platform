export function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
}

export function getUserRole() {
  return (
    localStorage.getItem("role") ||
    sessionStorage.getItem("role")
  );
}

export function getUserEmail() {
  return (
    localStorage.getItem("user_email") ||
    sessionStorage.getItem("user_email")
  );
}

export function clearAuth() {
  /*
   * Clear authentication data
   */
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_email");

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("user_email");

  /*
   * Clear selected records
   */
  sessionStorage.removeItem(
    "selected_lead_id"
  );

  sessionStorage.removeItem(
    "selected_quote_id"
  );

  sessionStorage.removeItem(
    "selected_amc_id"
  );

  sessionStorage.removeItem(
    "selected_amc_detail"
  );

  sessionStorage.removeItem(
    "selected_service_request_id"
  );
}

export function logout() {
  clearAuth();

  window.location.href =
    "/portal/login";
}