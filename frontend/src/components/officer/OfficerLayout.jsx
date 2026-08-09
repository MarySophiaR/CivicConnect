import { useState } from "react";
import { useLocation } from "react-router-dom";

import OfficerSidebar from "./OfficerSidebar";
import OfficerNavbar from "./OfficerNavbar";

import { LogOut } from "lucide-react";

import "../../styles/officerComponents.css";


function OfficerLayout({ children }) {

    const location = useLocation();

    const [showLogoutModal, setShowLogoutModal] =
        useState(false);


    /* =========================================
       GET ROLE FROM PATH
    ========================================= */

    const getRoleFromPath = () => {

        const path = location.pathname;


        if (path.startsWith("/junior-engineer")) {
            return "juniorEngineer";
        }


        if (
            path.startsWith(
                "/assistant-executive-engineer"
            )
        ) {
            return "assistantExecutiveEngineer";
        }


        if (
            path.startsWith(
                "/executive-engineer"
            )
        ) {
            return "executiveEngineer";
        }


        if (
            path.startsWith(
                "/municipal-commissioner"
            )
        ) {
            return "municipalCommissioner";
        }


        return "officer";

    };


    const role = getRoleFromPath();


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

        <div className="officer-layout">


            <OfficerNavbar />


            <div className="officer-layout-body">


                {/* =================================
                    SIDEBAR
                ================================= */}

                <OfficerSidebar
                    role={role}
                    setShowLogoutModal={
                        setShowLogoutModal
                    }
                    mobileProfileOnly={false}
                />


                {/* =================================
                    MAIN CONTENT
                ================================= */}

                <main className="officer-main-content">

                    {children}


                    {/* =================================
                        MOBILE DASHBOARD PROFILE
                    ================================= */}

                    {isDashboard && (

                        <div className="officer-mobile-profile-container">

                            <OfficerSidebar
                                role={role}
                                setShowLogoutModal={
                                    setShowLogoutModal
                                }
                                mobileProfileOnly={true}
                            />

                        </div>

                    )}

                </main>

            </div>


            {/* =================================
                LOGOUT CONFIRMATION MODAL
            ================================= */}

            {showLogoutModal && (

                <div className="officer-logout-overlay">

                    <div className="officer-logout-modal">

                        <h3>
                            Logout
                        </h3>


                        <p>
                            Are you sure you want to logout?
                        </p>


                        <div className="officer-logout-buttons">

                            <button
                                type="button"
                                className="officer-cancel-btn"
                                onClick={() =>
                                    setShowLogoutModal(false)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="officer-logout-confirm-btn"
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

export default OfficerLayout;