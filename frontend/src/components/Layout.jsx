import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import { LogOut } from "lucide-react";

import "../styles/layout.css";


function Layout({ children }) {

    const navigate = useNavigate();

    const location = useLocation();


    /* =========================================
       LOGOUT MODAL STATE
    ========================================= */

    const [showLogoutModal, setShowLogoutModal] =
        useState(false);


    /* =========================================
       CONFIRM LOGOUT
    ========================================= */

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setShowLogoutModal(false);

        navigate("/");

    };


    /* =========================================
       DASHBOARD CHECK
       
       Mobile profile should appear ONLY
       on the citizen dashboard.
    ========================================= */

    const isDashboard =
        location.pathname === "/citizen/dashboard";


    return (

        <div className="layout">

            {/* =====================================
                NAVBAR
            ===================================== */}

            <Navbar />


            <div className="layout-body">

                {/* =====================================
                    MAIN SIDEBAR

                    Desktop:
                    Navigation + Profile

                    Mobile:
                    Navigation only
                ===================================== */}

                <Sidebar
                    setShowLogoutModal={
                        setShowLogoutModal
                    }

                    mobileProfileOnly={false}
                />


                {/* =====================================
                    MAIN CONTENT
                ===================================== */}

                <main className="main-content">

                    {children}


                    {/* =================================
                        MOBILE DASHBOARD PROFILE

                        ONLY on citizen dashboard.
                    ================================= */}

                    {isDashboard && (

                        <div className="mobile-profile-container">

                            <Sidebar
                                setShowLogoutModal={
                                    setShowLogoutModal
                                }

                                mobileProfileOnly={true}
                            />

                        </div>

                    )}

                </main>

            </div>


            {/* =========================================
                MAIN LOGOUT CONFIRMATION MODAL

                This is the ONLY logout confirmation
                modal in the citizen layout.

                Works for:
                - Desktop profile
                - Mobile dashboard profile
            ========================================= */}

            {showLogoutModal && (

                <div
                    className="logout-overlay"
                    onClick={() =>
                        setShowLogoutModal(false)
                    }
                >

                    <div
                        className="logout-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <h3>
                            Logout
                        </h3>


                        <p>
                            Are you sure you want
                            to logout?
                        </p>


                        <div className="logout-buttons">

                            {/* =========================
                                CANCEL
                            ========================= */}

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() =>
                                    setShowLogoutModal(false)
                                }
                            >

                                Cancel

                            </button>


                            {/* =========================
                                CONFIRM LOGOUT
                            ========================= */}

                            <button
                                type="button"
                                className="logout-confirm-btn"
                                onClick={handleLogout}
                            >

                                <LogOut
                                    size={16}
                                    strokeWidth={2}
                                />

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