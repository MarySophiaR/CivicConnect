import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import {
    LayoutDashboard,
    FilePlus2,
    ClipboardList,
    LogOut
} from "lucide-react";

import "../../styles/sidebar.css";


function Sidebar({
    mobileProfileOnly = false
}) {

    const navigate = useNavigate();
    const location = useLocation();

    const [showMenu, setShowMenu] = useState(false);

    const [showLogoutModal, setShowLogoutModal] =
        useState(false);

    const menuRef = useRef(null);


    /* =========================================
       GET CURRENT USER
    ========================================= */

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );


    /* =========================================
       CLOSE PROFILE MENU WHEN CLICKING OUTSIDE
    ========================================= */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {

                setShowMenu(false);

            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    /* =========================================
       OPEN LOGOUT CONFIRMATION
    ========================================= */

    const handleLogoutClick = (event) => {

        event.stopPropagation();

        setShowMenu(false);

        setShowLogoutModal(true);

    };


    /* =========================================
       CANCEL LOGOUT
    ========================================= */

    const handleCancelLogout = () => {

        setShowLogoutModal(false);

    };


    /* =========================================
       CONFIRM LOGOUT
    ========================================= */

    const handleConfirmLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setShowLogoutModal(false);

        navigate("/");

    };


    /* =========================================
       PROFILE SECTION
    ========================================= */

    const profileSection = (

        <div
            className="sidebar-profile"
            ref={menuRef}
        >

            {/* =====================================
                PROFILE POPUP
            ===================================== */}

            {showMenu && (

                <div className="profile-menu">

                    <button
                        type="button"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                        onClick={handleLogoutClick}
                    >

                        <LogOut
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            )}


            {/* =====================================
                PROFILE CARD
            ===================================== */}

            <div
                className="profile-card"
                onClick={() =>
                    setShowMenu((previous) =>
                        !previous
                    )
                }
            >

                <div className="profile-avatar">

                    {user?.name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}

                </div>


                <div>

                    <h4>
                        {user?.name || "User"}
                    </h4>

                    <p>
                        Citizen
                    </p>

                </div>

            </div>

        </div>

    );


    /* =========================================
       LOGOUT CONFIRMATION MODAL
       
       Kept inside Sidebar so it does not depend
       on Layout state/props.
    ========================================= */

    const logoutModal = (

        showLogoutModal && (

            <div
                className="logout-overlay"
                onClick={handleCancelLogout}
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
                            onClick={handleCancelLogout}
                        >

                            Cancel

                        </button>


                        {/* =========================
                            CONFIRM LOGOUT
                        ========================= */}

                        <button
                            type="button"
                            className="logout-confirm-btn"
                            onClick={handleConfirmLogout}
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

        )

    );


    /* =========================================
       MOBILE PROFILE ONLY
       
       Used only at the bottom of dashboard.
       No navigation.
    ========================================= */

    if (mobileProfileOnly) {

        return (

            <>
                <div className="mobile-profile-only">

                    {profileSection}

                </div>

                {logoutModal}
            </>

        );

    }


    /* =========================================
       NORMAL SIDEBAR
       
       Desktop:
       Navigation + Profile

       Mobile:
       Navigation
    ========================================= */

    return (

        <>

            <aside className="sidebar">

                {/* =====================================
                    NAVIGATION
                ===================================== */}

                <nav className="sidebar-menu">

                    <NavLink
                        to="/citizen/dashboard"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >

                        <LayoutDashboard
                            size={18}
                            strokeWidth={2}
                            className="sidebar-icon"
                        />

                        Dashboard

                    </NavLink>


                    <NavLink
                        to="/citizen/create-complaint"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >

                        <FilePlus2
                            size={18}
                            strokeWidth={2}
                            className="sidebar-icon"
                        />

                        Report Complaint

                    </NavLink>


                    <NavLink
                        to="/citizen/my-complaints"
                        className={`sidebar-link ${location.pathname.includes("/citizen/my-complaints") || location.pathname.includes("/citizen/complaint/") ? "active" : ""}`}
                    >

                        <ClipboardList
                            size={18}
                            strokeWidth={2}
                            className="sidebar-icon"
                        />

                        My Complaints

                    </NavLink>

                </nav>


                {/* =====================================
                    DESKTOP PROFILE
                ===================================== */}

                {profileSection}

            </aside>


            {logoutModal}

        </>

    );

}


export default Sidebar;