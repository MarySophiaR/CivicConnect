import { useEffect, useMemo, useRef, useState } from "react";

import {
    Search,
    Filter,
    ToggleLeft,
    ChevronDown,
    UserCheck,
    UserX,
    Loader2
} from "lucide-react";

import { toast } from "react-toastify";

import API from "../../api/axios";

import OfficerStatusModal from "./OfficerStatusModal";

import "../../styles/systemAdminComponents.css";


/* =========================================
    CUSTOM FILTER DROPDOWN

    Replaces the native <select> for the role
    and status filters. A native <select>'s
    open options list is rendered by the
    device's operating system on many mobile
    browsers (not by the page's own HTML/CSS),
    so its width/position cannot be controlled
    with CSS. This renders the same look and
    behaviour using plain DOM elements instead,
    so the dropdown always stays inside the
    page and can never overflow the viewport.

    Same value/onChange contract as a native
    select — swapping this in does not change
    filtering behaviour anywhere else.
========================================= */

function FilterDropdown({
    icon,
    value,
    options,
    onChange,
    ariaLabel
}) {

    const [isOpen, setIsOpen] =
        useState(false);

    const wrapperRef =
        useRef(null);


    /* =====================================
        CLOSE ON OUTSIDE CLICK
    ===================================== */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {

                setIsOpen(false);

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


    /* =====================================
        CLOSE ON ESCAPE
    ===================================== */

    useEffect(() => {

        const handleKeyDown = (event) => {

            if (event.key === "Escape") {

                setIsOpen(false);

            }

        };

        if (isOpen) {

            document.addEventListener(
                "keydown",
                handleKeyDown
            );

        }

        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [isOpen]);


    const selectedOption =
        options.find(
            (option) => option.value === value
        );


    return (

        <div
            className="officer-filter-wrapper officer-custom-dropdown"
            ref={wrapperRef}
        >

            {icon}

            <button
                type="button"
                className="officer-custom-dropdown-trigger"
                onClick={() =>
                    setIsOpen((previous) => !previous)
                }
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
            >

                <span>
                    {selectedOption
                        ? selectedOption.label
                        : ""}
                </span>

                <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className={
                        isOpen
                            ? "officer-custom-dropdown-chevron open"
                            : "officer-custom-dropdown-chevron"
                    }
                />

            </button>

            {isOpen && (

                <ul
                    className="officer-custom-dropdown-menu"
                    role="listbox"
                >

                    {options.map((option) => (

                        <li
                            key={option.value}
                            role="option"
                            aria-selected={
                                option.value === value
                            }
                            className={
                                option.value === value
                                    ? "officer-custom-dropdown-option selected"
                                    : "officer-custom-dropdown-option"
                            }
                            onClick={() => {

                                onChange(option.value);

                                setIsOpen(false);

                            }}
                        >

                            {option.label}

                        </li>

                    ))}

                </ul>

            )}

        </div>

    );

}


function OfficerList({ onStatusChanged }) {

    /* =========================================
        STATE
    ========================================= */

    const [officers, setOfficers] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedOfficer, setSelectedOfficer] =
        useState(null);


    /* =========================================
        OFFICER ROLES
    ========================================= */

    const officerRoles = [

        {
            value: "juniorEngineer",
            label: "Junior Engineer"
        },

        {
            value: "assistantExecutiveEngineer",
            label: "Assistant Executive Engineer"
        },

        {
            value: "executiveEngineer",
            label: "Executive Engineer"
        },

        {
            value: "municipalCommissioner",
            label: "Municipal Commissioner"
        }

    ];


    /* =========================================
        ROLE FILTER OPTIONS
    ========================================= */

    const roleFilterOptions = [

        {
            value: "all",
            label: "All Roles"
        },

        ...officerRoles

    ];


    /* =========================================
        STATUS FILTER OPTIONS
    ========================================= */

    const statusFilterOptions = [

        {
            value: "all",
            label: "All Status"
        },

        {
            value: "active",
            label: "Active"
        },

        {
            value: "inactive",
            label: "Inactive"
        }

    ];


    /* =========================================
        ROLE DISPLAY NAME
    ========================================= */

    const getRoleName = (role) => {

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
                return role || "Officer";

        }

    };


    /* =========================================
        FETCH OFFICERS
    ========================================= */

    const fetchOfficers = async () => {

        try {

            setLoading(true);

            const response = await API.get(
                "/system-admin/officers"
            );

            setOfficers(
                response.data?.officers || []
            );

        } catch (error) {

            console.error(
                "Officer List Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load officers."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================
        LOAD OFFICERS
    ========================================= */

    useEffect(() => {

        fetchOfficers();

    }, []);


    /* =========================================
        FILTER OFFICERS
    ========================================= */

    const filteredOfficers = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();


        return officers.filter((officer) => {

            /* ================================
                SEARCH
            ================================= */

            const matchesSearch =
                !searchValue ||

                officer.name
                    ?.toLowerCase()
                    .includes(searchValue) ||

                officer.email
                    ?.toLowerCase()
                    .includes(searchValue);


            /* ================================
                ROLE FILTER
            ================================= */

            const matchesRole =
                roleFilter === "all" ||
                officer.role === roleFilter;


            /* ================================
                STATUS FILTER
            ================================= */

            const matchesStatus =

                statusFilter === "all" ||

                (
                    statusFilter === "active" &&
                    officer.isActive === true
                ) ||

                (
                    statusFilter === "inactive" &&
                    officer.isActive === false
                );


            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );

        });

    }, [
        officers,
        search,
        roleFilter,
        statusFilter
    ]);


    /* =========================================
        STATUS CHANGE (FIXED FOR IMMEDIATE UI UPDATE)
    ========================================= */

    const handleStatusUpdated = (updatedOfficerData) => {

        // Unwrap response if officer object is nested inside payload
        const updatedOfficer = updatedOfficerData?.officer || updatedOfficerData;

        // Fallback target ID: use selectedOfficer's ID if backend response lacks _id
        const targetId = updatedOfficer?._id || selectedOfficer?._id;

        if (targetId) {

            setOfficers((previousOfficers) =>

                previousOfficers.map((officer) => {

                    if (officer._id === targetId) {

                        // If updated status is explicitly returned, use it; otherwise toggle current status
                        const newIsActive =
                            typeof updatedOfficer?.isActive === "boolean"
                                ? updatedOfficer.isActive
                                : !officer.isActive;

                        return {
                            ...officer,
                            ...(updatedOfficer || {}),
                            isActive: newIsActive
                        };

                    }

                    return officer;

                })

            );

        }

        /* Close modal immediately */
        setSelectedOfficer(null);

        /* Notify parent dashboard */
        if (onStatusChanged) {
            onStatusChanged();
        }

    };


    /* =========================================
        RENDER
    ========================================= */

    return (

        <div className="officer-list-container">


            {/* =================================
                LIST HEADER
            ================================= */}

            <div className="officer-list-header">

                <div className="officer-list-heading">

                    <h2>
                        Officers
                    </h2>

                </div>


                <div className="officer-list-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        {officers.length}
                    </strong>

                </div>

            </div>


            {/* =================================
                FILTER BAR
            ================================= */}

            <div className="officer-list-filters">


                {/* ================================
                    SEARCH
                ================================= */}

                <div className="officer-search-wrapper">

                    <Search
                        size={18}
                        strokeWidth={1.8}
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search by name or email"
                    />

                </div>


                {/* ================================
                    ROLE FILTER
                ================================= */}

                <FilterDropdown
                    icon={
                        <Filter
                            size={17}
                            strokeWidth={1.8}
                        />
                    }
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={roleFilterOptions}
                    ariaLabel="Filter by role"
                />


                {/* ================================
                    STATUS FILTER
                ================================= */}

                <FilterDropdown
                    
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusFilterOptions}
                    ariaLabel="Filter by status"
                />

            </div>


            {/* =================================
                CONTENT
            ================================= */}

            {loading ? (

                <div className="officer-list-state">

                    <Loader2
                        size={26}
                        className="system-admin-spinner"
                    />

                    <p>
                        Loading officers...
                    </p>

                </div>

            ) : filteredOfficers.length === 0 ? (

                <div className="officer-list-state">

                    <UserX
                        size={30}
                        strokeWidth={1.7}
                    />

                    <h3>
                        No officers found
                    </h3>

                    <p>
                        No officer accounts match
                        the current search or filters.
                    </p>

                </div>

            ) : (

                <div className="officer-table-wrapper">

                    <table className="officer-table">

                        <thead>

                            <tr>

                                <th>
                                    Officer
                                </th>

                                <th>
                                    Role
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Created
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredOfficers.map(
                                (officer) => (

                                    <tr
                                        key={officer._id}
                                    >


                                        {/* ================================
                                            OFFICER
                                        ================================= */}

                                        <td>

                                            <div className="officer-table-user">

                                                <div className="officer-table-avatar">

                                                    {officer.name
                                                        ?.split(" ")
                                                        .filter(Boolean)
                                                        .map(
                                                            (word) =>
                                                                word[0]
                                                        )
                                                        .join("")
                                                        .toUpperCase()}

                                                </div>


                                                <div className="officer-table-user-details">

                                                    <strong>
                                                        {officer.name}
                                                    </strong>

                                                    <span>
                                                        {officer.email}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* ================================
                                            ROLE
                                        ================================= */}

                                        <td>

                                            <span className="officer-role-badge">

                                                {getRoleName(
                                                    officer.role
                                                )}

                                            </span>

                                        </td>


                                        {/* ================================
                                            STATUS
                                        ================================= */}

                                        <td>

                                            {officer.isActive ? (

                                                <span className="officer-status-badge active">

                                                    <UserCheck
                                                        size={14}
                                                        strokeWidth={2}
                                                    />

                                                    Active

                                                </span>

                                            ) : (

                                                <span className="officer-status-badge inactive">

                                                    <UserX
                                                        size={14}
                                                        strokeWidth={2}
                                                    />

                                                    Inactive

                                                </span>

                                            )}

                                        </td>


                                        {/* ================================
                                            CREATED
                                        ================================= */}

                                        <td>

                                            <span className="officer-created-date">

                                                {officer.createdAt

                                                    ? new Date(
                                                        officer.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                        }
                                                    )

                                                    : "—"}

                                            </span>

                                        </td>


                                        {/* ================================
                                            ACTION
                                        ================================= */}

                                        <td>

                                            <button
                                                type="button"

                                                className={
                                                    officer.isActive
                                                        ? "officer-deactivate-btn"
                                                        : "officer-activate-btn"
                                                }

                                                onClick={() =>
                                                    setSelectedOfficer(
                                                        officer
                                                    )
                                                }
                                            >

                                                {officer.isActive ? (

                                                    <>

                                                        <UserX
                                                            size={15}
                                                        />

                                                        Deactivate

                                                    </>

                                                ) : (

                                                    <>

                                                        <UserCheck
                                                            size={15}
                                                        />

                                                        Activate

                                                    </>

                                                )}

                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* =================================
                STATUS MODAL
            ================================= */}

            {selectedOfficer && (

                <OfficerStatusModal

                    officer={selectedOfficer}

                    onClose={() =>
                        setSelectedOfficer(null)
                    }

                    onStatusUpdated={
                        handleStatusUpdated
                    }

                />

            )}

        </div>

    );

}


export default OfficerList;