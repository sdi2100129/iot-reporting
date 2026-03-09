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

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 < Date.now(); // exp is in seconds, Date.now() in ms
    } catch {
        return true; // if decode fails, treat as expired
    }
}

export function getScopes() {
  try {
    return JSON.parse(localStorage.getItem(SCOPES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function hasScope(scope) {
  return getScopes().includes(scope);
}

export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearAuth(); // clean up the stale token automatically
    return false;
  }
  return true;
}