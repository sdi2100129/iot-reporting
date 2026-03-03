const TOKEN_KEY = "access_token";
const SCOPES_KEY = "scopes";

// Save the access token to browser memory so it can stay loged in between page refreshes. 
export function saveAuth({ access_token, scopes = [] }) {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(SCOPES_KEY, JSON.stringify(scopes));
  // Triger a custom browser event to notify the rest of the app about the login state change
  window.dispatchEvent(new Event("auth:changed"));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SCOPES_KEY);
  window.dispatchEvent(new Event("auth:changed"));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getScopes() {
  try {
    return JSON.parse(localStorage.getItem(SCOPES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}