import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.png";


export default function NavBar() {
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
      <div className="flex gap-4">
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
      </div>
    </div>
  );
}
