import { useState } from "react";
import { useLocation } from "react-router-dom";

import SystemAdminSidebar from "./SystemAdminSidebar";
import SystemAdminNavbar from "./SystemAdminNavbar";

import {
    LogOut
} from "lucide-react";

import "../../styles/systemAdminComponents.css";

function SystemAdminLayout({ children }) {

    const location = useLocation();


    /* =========================================
       MODAL STATES
    ========================================= */

    const [showLogoutModal, setShowLogoutModal] =
        useState(false);


    /* =========================================
       DASHBOARD
    ========================================= */

    const isDashboard =
        location.pathname.endsWith("/dashboard");


    /* =========================================
       LOGOUT
    ========================================= */

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href = "/";

    };


    return (

        <div className="system-admin-layout">


            {/* =========================================
               NAVBAR
            ========================================= */}

            <SystemAdminNavbar />


            {/* =========================================
               LAYOUT BODY
            ========================================= */}

            <div className="system-admin-layout-body">


                {/* =====================================
                   SIDEBAR
                ===================================== */}

                <SystemAdminSidebar

                    setShowLogoutModal={
                        setShowLogoutModal
                    }

                    mobileProfileOnly={false}

                />


                {/* =====================================
                   MAIN CONTENT
                ===================================== */}

                <main className="system-admin-main-content">

                    {children}


                    {/* =================================
                       MOBILE PROFILE
                    ================================= */}

                    {isDashboard && (

                        <div
                            className="
                                system-admin-mobile-profile-container
                            "
                        >

                            <SystemAdminSidebar

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
               LOGOUT CONFIRMATION MODAL
            ========================================= */}

            {showLogoutModal && (

                <div
                    className="
                        system-admin-logout-overlay
                    "
                >

                    <div
                        className="
                            system-admin-logout-modal
                        "
                    >


                        {/* =================================
                           TITLE
                        ================================= */}

                        <h3>
                            Logout
                        </h3>


                        {/* =================================
                           MESSAGE
                        ================================= */}

                        <p>
                            Are you sure you want to logout?
                        </p>


                        {/* =================================
                           BUTTONS
                        ================================= */}

                        <div
                            className="
                                system-admin-logout-buttons
                            "
                        >


                            {/* =============================
                                CANCEL
                            ============================= */}

                            <button

                                type="button"

                                className="
                                    system-admin-cancel-btn
                                "

                                onClick={() =>
                                    setShowLogoutModal(false)
                                }

                            >

                                Cancel

                            </button>


                            {/* =============================
                                CONFIRM LOGOUT
                            ============================= */}

                            <button

                                type="button"

                                className="
                                    system-admin-logout-confirm-btn
                                "

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

export default SystemAdminLayout;