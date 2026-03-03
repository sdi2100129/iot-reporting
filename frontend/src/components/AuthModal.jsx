import { useEffect, useState } from "react";
import api from "../api";
import { clearAuth, isLoggedIn, saveAuth } from "../Auth";

export default function AuthModal({ open, onClose }) {
  const [tab, setTab] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [logged, setLogged] = useState(isLoggedIn());


  useEffect(() => {
    function sync() {
      setLogged(isLoggedIn());
    }
    window.addEventListener("auth:changed", sync);
    return () => window.removeEventListener("auth:changed", sync);
  }, []);

  // Hide the modal when open is false
  if (!open) return null;

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");

    if (!username || !password) {
      setErr("Username and password are required.");
      return;
    }
    try {
      // OAuth2PasswordRequestForm => x-www-form-urlencoded
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);

      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Backend returns: access_token, token_type, scopes
      saveAuth(res.data);
      onClose();
    } catch (e2) {
      const detail =
        e2?.response?.data?.detail ||          // normal axios error
        e2?.response?.data ||                 
        e2?.response?.detail ||               // your wrapped object cases
        e2?.response?.data?.message ||
        "Login failed";

      setErr(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErr("");
    
    if (!username || !password) {
      setErr("Username and password are required.");
      return;
    }
    try {
      await api.post("/auth/register", { username, password });
      // after register, auto-login
      await handleLogin(e);
    } catch (e2) {
      const detail =
        e2?.response?.data?.detail ||
        e2?.response?.data ||
        e2?.response?.detail ||
        e2?.response?.data?.message ||
        e2?.response?.response?.data?.detail ||  
        e2?.response?.response?.data ||
        "Register failed";

      setErr(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  }

  function handleLogout() {
    clearAuth();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[380px] rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">

          <h2 className="text-lg font-bold text-purple-800">
            {logged ? "Account" : tab === "login" ? "Login" : "Register"}
          </h2>

          <button
            onClick={onClose}
            className=" bg-transparent
                        text-gray-400 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        {logged ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-700">You are logged in.</p>

            <button
              onClick={handleLogout}
              className="w-full rounded-md !bg-purple-800 px-4 py-2 text-white hover:bg-purple-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setTab("login")}
                className={`flex-1 rounded-md px-3 py-2 ${
                  tab === "login"
                    ? "!bg-purple-700 text-white"
                    : "!bg-purple-800 !text-white"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => setTab("register")}
                className={`flex-1 rounded-md px-3 py-2 ${
                  tab === "register"
                    ? "!bg-purple-700 text-white"
                    : "!bg-purple-800 !text-white"
                }`}
              >
                Register
              </button>
            </div>

            <form
              onSubmit={tab === "login" ? handleLogin : handleRegister}
              className="mt-4 space-y-3"
            >
              <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <br/>

              <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              /> 

              <br/>

              <button className="w-full rounded-md !bg-purple-800 px-4 py-2 text-white hover:bg-purple-700">
                {tab === "login" ? "Login" : "Create account"}
              </button>

              <br/>

              {err && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}