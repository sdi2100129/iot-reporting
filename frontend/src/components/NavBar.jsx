import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import AuthModal from "./AuthModal";
import { isLoggedIn } from "../Auth";
import { UserRound, LogIn } from "lucide-react";
import { useEffect, useState } from "react";


export default function NavBar() {
  // To control whether the authentication modal is visible
  const [authOpen, setAuthOpen] = useState(false);
  const [logged, setLogged] = useState(isLoggedIn());
  

  // Listen for authentication changes to update the UI (e.g. show login/logout state)
  useEffect(() => {
    const sync = () => setLogged(isLoggedIn());
    // When mounts, start listening for a custom browser event called auth:changed
    window.addEventListener("auth:changed", sync);
    // When unmounts, clean up the event listener
    return () => window.removeEventListener("auth:changed", sync);
  }, []);


  return (

    <div className="w-full h-20 bg-purple-800 flex items-center px-6 shadow-md fixed top-0 left-0 z-50">
      
      {/* Logo */}
      <Link to="/" className="mr-10">
          <img 
            src={logo}
            alt="Logo"
            className="h-14 rounded-md w-auto"
        />
      </Link>
 
      {/* Menu buttons */}
      <div className="flex gap-4 items-center">
        <NavLink
            to="/sensors"
            className={({ isActive }) =>
                `px-4 py-2 rounded-md font-semibold text-lg transition
                ${isActive
                ? "bg-purple-600 text-white"
                : "bg-purple-800 text-white hover:bg-purple-700"}`
            }
        >
          Sensors
        </NavLink>

        <NavLink
          to="/readings"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md text-lg font-semibold transition
            ${isActive
                ? "bg-purple-600 text-white"
                : "bg-purple-800 text-white hover:bg-purple-700"}`
          }
        >
          Readings
        </NavLink>

        <NavLink
            to="/metrics"
            className={({ isActive }) =>
                `px-4 py-2 rounded-md font-semibold text-lg transition
                ${isActive
                ? "bg-purple-600 text-white"
                : "bg-purple-800 text-white hover:bg-purple-700"}`
            }
        >
          Metrics
        </NavLink>

        <NavLink
            to="/charts"
            className={({ isActive }) =>
                `px-4 py-2 rounded-md font-semibold text-lg transition
                ${isActive
                ? "bg-purple-600 text-white"
                : "bg-purple-800 text-white hover:bg-purple-700"}`
            }
        >
          Charts
        </NavLink>

      </div>

      {/* Push icon to the right */}
      <button
        onClick={() => setAuthOpen(true)}
        title={logged ? "Account" : "Login"}
        className="px-4 py-2 rounded-full !bg-purple-800 hover:bg-purple-700 flex items-center justify-center text-white text-xl"
      >
        {logged ? <UserRound /> : <LogIn />}
      </button>
    

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

    </div>
  );
}
