import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { LogOut } from "lucide-react";
import "../styles/layout.css";

function Layout({ children }) {

    const navigate = useNavigate();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

    };

    return (
      <div className="layout">
        <Navbar />

        <div className="layout-body">
          <Sidebar setShowLogoutModal={setShowLogoutModal} />

          <main className="main-content">{children}</main>
        </div>

        {showLogoutModal && (
          <div className="logout-overlay">
            <div className="logout-modal">
              <h3>Logout</h3>

              <p>Are you sure you want to logout?</p>

              <div className="logout-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>

                <button className="logout-confirm-btn" onClick={handleLogout}>
                  <LogOut size={16} strokeWidth={2} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

}

export default Layout;