import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  LogOut
} from "lucide-react";
import "../styles/sidebar.css";

function Sidebar({ setShowLogoutModal }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <NavLink to="/citizen/dashboard" className="sidebar-link">
          <LayoutDashboard
            size={18}
            strokeWidth={2}
            className="sidebar-icon"
          />
          Dashboard
        </NavLink>

        <NavLink to="/citizen/create-complaint" className="sidebar-link">
          <FilePlus2 size={18} strokeWidth={2} className="sidebar-icon" />
          Report Complaint
        </NavLink>

        <NavLink to="/citizen/my-complaints" className="sidebar-link">
          <ClipboardList size={18} strokeWidth={2} className="sidebar-icon" />
          My Complaints
        </NavLink>
      </nav>

      {/* Profile Section */}
      <div className="sidebar-profile" ref={menuRef}>
        {showMenu && (
          <div className="profile-menu">
            <button
              onClick={() => {
                setShowMenu(false);
                setShowLogoutModal(true);
              }}
            >
              <LogOut size={18} strokeWidth={1.8} />
              <span>Logout</span>
            </button>
          </div>
        )}

        <div className="profile-card" onClick={() => setShowMenu(!showMenu)}>
          <div className="profile-avatar">
            {user?.name
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </div>

          <div>
            <h4>{user?.name}</h4>
            <p>Citizen</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;