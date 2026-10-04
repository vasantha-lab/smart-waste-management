import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    localStorage.getItem("user")
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  const userData=user ?
  JSON.parse(user) : null;

  return (
    <nav className="navbar">
      <h2>Smart Waste Management</h2>

      <div className="navbar-menu">
        <Link to="/municipality">Municipality</Link>
        <Link to="/user">User</Link>

        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/signup">Sign Up</Link>}
        
        {userData && <span>Welcome,
          {userData.name}</span>}

        {user && (
          <button onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;