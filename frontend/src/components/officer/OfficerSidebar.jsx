import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import {
    LayoutDashboard,
    ClipboardList,
    LogOut
} from "lucide-react";

import "../../styles/officerComponents.css";


function OfficerSidebar({
    role,
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
       ROLE
    ========================================= */

    const getRoleName = () => {

        switch (role) {

            case "juniorEngineer":
                return "Junior Engineer";


            case "assistantExecutiveEngineer":
                return "Assistant Executive Engineer";


            case "executiveEngineer":
                return "Executive Engineer";


            case "municipalCommissioner":
                return "Municipal Commissioner";


            default:
                return "Officer";

        }

    };


    const getRolePath = () => {

        switch (role) {

            case "juniorEngineer":
                return "junior-engineer";


            case "assistantExecutiveEngineer":
                return "assistant-executive-engineer";


            case "executiveEngineer":
                return "executive-engineer";


            case "municipalCommissioner":
                return "municipal-commissioner";


            default:
                return "junior-engineer";

        }

    };


    const roleName = getRoleName();

    const rolePath = getRolePath();


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
       PROFILE SECTION
    ========================================= */

    const profileSection = (

        <div
            className="officer-sidebar-profile"
            ref={menuRef}
        >

            {/* ================================
                PROFILE MENU
            ================================= */}

            {showMenu && (

                <div className="officer-profile-menu">

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


            {/* ================================
                PROFILE CARD
            ================================= */}

            <div
                className="officer-profile-card"
                onClick={() =>
                    setShowMenu((previous) => !previous)
                }
            >

                <div className="officer-profile-avatar">

                    {user?.name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}

                </div>


                <div className="officer-profile-info">

                    <h4>
                        {user?.name || "Officer"}
                    </h4>

                    <p>
                        {roleName}
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

            <div className="officer-mobile-profile-only">

                {profileSection}

            </div>

        );

    }


    /* =========================================
       NORMAL SIDEBAR
    ========================================= */

    return (

        <aside className="officer-sidebar">


            {/* =================================
                NAVIGATION
            ================================= */}

            <nav className="officer-sidebar-nav">


                {/* ================================
                    DASHBOARD
                ================================= */}

                <NavLink
                    to={`/${rolePath}/dashboard`}
                    className="officer-nav-link"
                >

                    <LayoutDashboard
                        size={18}
                        strokeWidth={2}
                    />

                    Dashboard

                </NavLink>


                {/* ================================
                    COMPLAINTS
                ================================= */}

                <NavLink
                    to={`/${rolePath}/complaints`}
                    className="officer-nav-link"
                >

                    <ClipboardList
                        size={18}
                        strokeWidth={2}
                    />

                    Complaints

                </NavLink>


            </nav>


            {/* =================================
                DESKTOP PROFILE
            ================================= */}

            {profileSection}


        </aside>

    );

}


export default OfficerSidebar;