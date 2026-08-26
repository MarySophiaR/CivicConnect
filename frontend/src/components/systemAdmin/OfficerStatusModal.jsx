import { useState } from "react";

import {
    UserCheck,
    UserX,
    X,
    AlertTriangle,
    Loader2
} from "lucide-react";

import { toast } from "react-toastify";

import API from "../../api/axios";

import "../../styles/systemAdminComponents.css";


function OfficerStatusModal({
    officer,
    onClose,
    onStatusUpdated
}) {

    /* =========================================
       STATE
    ========================================= */

    const [loading, setLoading] =
        useState(false);


    /* =========================================
       DETERMINE CURRENT STATUS
    ========================================= */

    const isCurrentlyActive =
        officer?.isActive === true;


    /* =========================================
       ROLE NAME
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
                return "Officer";

        }

    };


    /* =========================================
       HANDLE STATUS CHANGE
    ========================================= */

    const handleStatusChange = async () => {

        if (!officer?._id) {

            toast.error(
                "Officer information is missing."
            );

            return;

        }


        try {

            setLoading(true);


            /*
             * Use the correct backend route.
             *
             * Active officer:
             *     PATCH /officers/:id/deactivate
             *
             * Inactive officer:
             *     PATCH /officers/:id/activate
             *
             * Only isActive is changed.
             * Officer data and complaint history
             * remain untouched.
             */

            const endpoint =
                isCurrentlyActive
                    ? `/system-admin/officers/${officer._id}/deactivate`
                    : `/system-admin/officers/${officer._id}/activate`;


            const response =
                await API.patch(endpoint);


            const updatedOfficer =
                response.data?.officer;


            /* =================================
               SUCCESS MESSAGE
            ================================= */

            toast.success(
                response.data?.message ||
                (
                    isCurrentlyActive
                        ? "Officer deactivated successfully."
                        : "Officer activated successfully."
                )
            );


            /* =================================
               UPDATE OFFICER LIST
            ================================= */

            if (updatedOfficer) {

                onStatusUpdated(
                    updatedOfficer
                );

            } else {

                onClose();

            }


        } catch (error) {

            console.error(
                "Officer Status Error:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                (
                    isCurrentlyActive
                        ? "Failed to deactivate officer."
                        : "Failed to activate officer."
                )
            );


        } finally {

            setLoading(false);

        }

    };


    /* =========================================
       SAFETY CHECK
    ========================================= */

    if (!officer) {

        return null;

    }


    /* =========================================
       GET OFFICER INITIALS
    ========================================= */

    const initials =
        officer.name
            ?.split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() ||
        "OF";


    /* =========================================
       RENDER
    ========================================= */

    return (

        <div
            className="system-admin-modal-overlay"
            onMouseDown={(event) => {

                /*
                 * Clicking outside the card
                 * closes the confirmation.
                 */

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    if (!loading) {

                        onClose();

                    }

                }

            }}
        >

            <div
                className="system-admin-status-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="officer-status-title"
            >


                {/* =================================
                    CLOSE BUTTON
                ================================= */}

                <button
                    type="button"
                    className="system-admin-modal-close"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close"
                >

                    <X
                        size={20}
                        strokeWidth={1.8}
                    />

                </button>


                {/* =================================
                    STATUS ICON
                ================================= */}

                <div
                    className={
                        isCurrentlyActive
                            ? "system-admin-status-modal-icon deactivate"
                            : "system-admin-status-modal-icon activate"
                    }
                >

                    {isCurrentlyActive ? (

                        <UserX
                            size={25}
                            strokeWidth={1.8}
                        />

                    ) : (

                        <UserCheck
                            size={25}
                            strokeWidth={1.8}
                        />

                    )}

                </div>


                {/* =================================
                    TITLE
                ================================= */}

                <h2 id="officer-status-title">

                    {isCurrentlyActive
                        ? "Deactivate Officer?"
                        : "Activate Officer?"
                    }

                </h2>


                {/* =================================
                    OFFICER INFORMATION
                ================================= */}

                <div className="system-admin-modal-officer">

                    <div className="system-admin-modal-avatar">

                        {initials}

                    </div>


                    <div>

                        <strong>
                            {officer.name}
                        </strong>

                        <span>
                            {officer.email}
                        </span>

                        <small>
                            {getRoleName(
                                officer.role
                            )}
                        </small>

                    </div>

                </div>


                {/* =================================
                    WARNING / INFORMATION
                ================================= */}

                <div
                    className={
                        isCurrentlyActive
                            ? "system-admin-status-message warning"
                            : "system-admin-status-message information"
                    }
                >

                    <AlertTriangle
                        size={18}
                        strokeWidth={1.8}
                    />


                    <p>

                        {isCurrentlyActive ? (

                            <>
                                This officer will no longer be
                                able to log in to CivicConnect.
                                Their existing complaint history
                                will remain intact.
                            </>

                        ) : (

                            <>
                                This officer will be able to log
                                in to CivicConnect again and
                                continue using their assigned
                                responsibilities.
                            </>

                        )}

                    </p>

                </div>


                {/* =================================
                    ACTION BUTTONS
                ================================= */}

                <div className="system-admin-modal-actions">


                    {/* =============================
                        CANCEL
                    ============================= */}

                    <button
                        type="button"
                        className="system-admin-modal-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >

                        Cancel

                    </button>


                    {/* =============================
                        ACTIVATE / DEACTIVATE
                    ============================= */}

                    <button
                        type="button"
                        className={
                            isCurrentlyActive
                                ? "system-admin-modal-deactivate"
                                : "system-admin-modal-activate"
                        }
                        onClick={handleStatusChange}
                        disabled={loading}
                    >

                        {loading ? (

                            <>

                                <Loader2
                                    size={17}
                                    className="system-admin-spinner"
                                />

                                {isCurrentlyActive
                                    ? "Deactivating..."
                                    : "Activating..."
                                }

                            </>

                        ) : (

                            <>

                                {isCurrentlyActive ? (

                                    <UserX
                                        size={17}
                                        strokeWidth={2}
                                    />

                                ) : (

                                    <UserCheck
                                        size={17}
                                        strokeWidth={2}
                                    />

                                )}

                                {isCurrentlyActive
                                    ? "Deactivate"
                                    : "Activate"
                                }

                            </>

                        )}

                    </button>

                </div>

            </div>

        </div>

    );

}


export default OfficerStatusModal;