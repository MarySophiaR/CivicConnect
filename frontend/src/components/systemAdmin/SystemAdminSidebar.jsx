import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import {
    LayoutDashboard,
    Users,
    LogOut
} from "lucide-react";

import "../../styles/systemAdminComponents.css";

function SystemAdminSidebar({
    setShowLogoutModal,
    mobileProfileOnly = false
}) {

    const [showMenu, setShowMenu] = useState(false);

    const menuRef = useRef(null);


    /* =========================================
       USER
    ========================================= */

    let user = {};

    try {

        user = JSON.parse(
            localStorage.getItem("user") || "{}"
        );

    } catch (error) {

        console.error(
            "Error reading user from localStorage:",
            error
        );

    }


    /* =========================================
       CLOSE PROFILE MENU
       WHEN CLICKING OUTSIDE
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
       GET USER INITIALS
    ========================================= */

    const getInitials = () => {

        if (!user?.name) {

            return "SA";

        }

        return user.name
            .split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    };


    /* =========================================
       PROFILE SECTION

       Account Settings removed.
       Only Logout remains.
    ========================================= */

    const profileSection = (

        <div
            className="system-admin-sidebar-profile"
            ref={menuRef}
        >

            {/* =================================
                PROFILE MENU
            ================================= */}

            {showMenu && (

                <div className="system-admin-profile-menu">

                    {/* =============================
                        LOGOUT
                    ============================= */}

                    <button
                        type="button"
                        onClick={() => {

                            setShowMenu(false);

                            setShowLogoutModal(true);

                        }}
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


            {/* =================================
                PROFILE CARD
            ================================= */}

            <div
                className="system-admin-profile-card"
                onClick={() =>
                    setShowMenu(
                        (previous) => !previous
                    )
                }
            >

                <div className="system-admin-profile-avatar">

                    {getInitials()}

                </div>


                <div className="system-admin-profile-info">

                    <h4>
                        {user?.name ||
                            "System Administrator"}
                    </h4>

                    <p>
                        System Administrator
                    </p>

                </div>

            </div>

        </div>

    );


    /* =========================================
       MOBILE PROFILE ONLY
    ========================================= */

    if (mobileProfileOnly) {

        return (

            <div className="system-admin-mobile-profile-only">

                {profileSection}

            </div>

        );

    }


    /* =========================================
       NORMAL SIDEBAR
    ========================================= */

    return (

        <aside className="system-admin-sidebar">

            {/* =================================
                NAVIGATION
            ================================= */}

            <nav className="system-admin-sidebar-nav">

                {/* =============================
                    DASHBOARD
                ============================= */}

                <NavLink
                    to="/system-admin/dashboard"
                    className="system-admin-nav-link"
                >

                    <LayoutDashboard
                        size={19}
                        strokeWidth={2}
                    />

                    <span>
                        Dashboard
                    </span>

                </NavLink>


                {/* =============================
                    OFFICERS
                ============================= */}

                <NavLink
                    to="/system-admin/officers"
                    className="system-admin-nav-link"
                >

                    <Users
                        size={19}
                        strokeWidth={2}
                    />

                    <span>
                        Officers
                    </span>

                </NavLink>

            </nav>


            {/* =================================
                PROFILE / LOGOUT
            ================================= */}

            {profileSection}

        </aside>

    );

}

export default SystemAdminSidebar;