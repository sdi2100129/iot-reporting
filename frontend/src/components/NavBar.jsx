import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <div>
          MENU
          <Link to="/sensors">Sensors</Link>
          <Link to="/readings">Readings</Link>
        </div>
    );
}