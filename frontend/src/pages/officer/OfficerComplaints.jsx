import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import OfficerLayout from "../../components/officer/OfficerLayout";
import OfficerComplaintCard from "../../components/officer/ComplaintCard";
import API from "../../api/axios";

import { ClipboardList } from "lucide-react";

import "../../styles/officerComponents.css";


function OfficerComplaints({ role: propRole }) {

    const navigate = useNavigate();

    /* =========================================================
       STATE
    ========================================================= */

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState("all");


    /* =========================================================
       GET ROLE NAME
    ========================================================= */

    const getRoleName = () => {

        let currentRole = propRole;


        if (!currentRole) {

            try {

                const storedUser =
                    JSON.parse(
                        localStorage.getItem("user") || "{}"
                    );

                currentRole =
                    storedUser.role ||
                    storedUser.designation ||
                    "";

            } catch (error) {

                console.error(
                    "Error reading user role:",
                    error
                );

            }
        }


        const normalizedRole =
            String(currentRole)
                .toLowerCase()
                .replace(/[\s_-]+/g, "");


        switch (normalizedRole) {

            case "juniorengineer":
            case "je":
                return "Junior Engineer";

            case "assistantexecutiveengineer":
            case "aee":
                return "Assistant Executive Engineer";

            case "executiveengineer":
            case "ee":
                return "Executive Engineer";

            case "municipalcommissioner":
            case "mc":
                return "Municipal Commissioner";

            default:
                return currentRole || "Officer";
        }
    };


    const roleName = getRoleName();


    /* =========================================================
       FETCH COMPLAINTS
    ========================================================= */

    useEffect(() => {
        fetchComplaints();
    }, []);


    const fetchComplaints = async () => {

        try {

            setLoading(true);


            const response =
                await API.get("/complaints/all");


            setComplaints(
                response.data?.complaints || []
            );


        } catch (error) {

            console.error(
                "Officer complaints error:",
                error.response?.data ||
                error.message
            );


            setComplaints([]);

        } finally {

            setLoading(false);
        }
    };


    /* =========================================================
       VIEW PARTICULAR COMPLAINT
    ========================================================= */

    const handleViewDetails = (complaintId) => {

        if (!complaintId) {

            console.error(
                "Complaint ID is missing."
            );

            return;
        }


        navigate(`${complaintId}`);
    };


    /* =========================================================
       NORMALIZE STATUS
    ========================================================= */

    const getComplaintStatus = (complaint) => {

        return String(
            complaint?.status || ""
        )
            .toLowerCase()
            .trim()
            .replace(/[\s_-]+/g, "-");
    };


    /* =========================================================
       FILTER COMPLAINTS
    ========================================================= */

    const filteredComplaints =
        activeStatus === "all"
            ? complaints
            : complaints.filter(
                (complaint) =>
                    getComplaintStatus(complaint) ===
                    activeStatus
            );


    /* =========================================================
       STATUS COUNTS
    ========================================================= */

    const getStatusCount = (status) => {

        if (status === "all") {
            return complaints.length;
        }


        return complaints.filter(
            (complaint) =>
                getComplaintStatus(complaint) === status
        ).length;
    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <OfficerLayout role={propRole}>

                <div className="officer-page-container">

                    <div className="officer-dashboard-loading">
                        Loading complaints...
                    </div>

                </div>

            </OfficerLayout>
        );
    }


    /* =========================================================
       PAGE
    ========================================================= */

    return (

        <OfficerLayout role={propRole}>

            {/* SAME PAGE CONTAINER AS DASHBOARD */}

            <div className="officer-page-container">

                {/* =================================
                    PAGE HEADER
                ================================= */}

                <header className="officer-page-header">

                    <h1>
                        {roleName} Complaints
                    </h1>

                    <p>
                        View and manage complaints assigned to you.
                    </p>

                </header>


                {/* =================================
                    COMPLAINTS SECTION
                ================================= */}

                <section className="officer-complaints-section">


                    {/* =================================
                        SECTION HEADER
                    ================================= */}

                    <div className="officer-section-header">

                        <div className="officer-section-title">

                            <ClipboardList
                                size={26}
                                strokeWidth={2}
                                aria-hidden="true"
                            />

                            <h2>
                                Complaints
                            </h2>

                        </div>

                    </div>


                    {/* =================================
                        STATUS FILTERS
                    ================================= */}

                    <div
                        className="officer-complaint-status-filters"
                        role="tablist"
                        aria-label="Complaint status filters"
                    >


                        {/* ALL */}

                        <button
                            type="button"
                            className={`officer-status-filter-button ${
                                activeStatus === "all"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setActiveStatus("all")
                            }
                            role="tab"
                            aria-selected={
                                activeStatus === "all"
                            }
                        >

                            <span>
                                All
                            </span>

                            <span className="officer-status-filter-count">
                                {getStatusCount("all")}
                            </span>

                        </button>


                        {/* ASSIGNED */}

                        <button
                            type="button"
                            className={`officer-status-filter-button ${
                                activeStatus === "assigned"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setActiveStatus("assigned")
                            }
                            role="tab"
                            aria-selected={
                                activeStatus === "assigned"
                            }
                        >

                            <span>
                                Assigned
                            </span>

                            <span className="officer-status-filter-count">
                                {getStatusCount("assigned")}
                            </span>

                        </button>


                        {/* IN PROGRESS */}

                        <button
                            type="button"
                            className={`officer-status-filter-button ${
                                activeStatus === "in-progress"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setActiveStatus("in-progress")
                            }
                            role="tab"
                            aria-selected={
                                activeStatus === "in-progress"
                            }
                        >

                            <span>
                                In Progress
                            </span>

                            <span className="officer-status-filter-count">
                                {getStatusCount("in-progress")}
                            </span>

                        </button>


                        {/* RESOLVED */}

                        <button
                            type="button"
                            className={`officer-status-filter-button ${
                                activeStatus === "resolved"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setActiveStatus("resolved")
                            }
                            role="tab"
                            aria-selected={
                                activeStatus === "resolved"
                            }
                        >

                            <span>
                                Resolved
                            </span>

                            <span className="officer-status-filter-count">
                                {getStatusCount("resolved")}
                            </span>

                        </button>

                    </div>


                    {/* =================================
                        EMPTY STATE / GRID
                    ================================= */}

                    {filteredComplaints.length === 0 ? (

                        <div className="officer-empty-state">

                            <ClipboardList
                                size={44}
                                strokeWidth={1.6}
                                aria-hidden="true"
                            />

                            <h3>
                                No complaints found
                            </h3>

                            <p>

                                {activeStatus === "all"
                                    ? "There are currently no complaints assigned to you."
                                    : `There are currently no ${
                                        activeStatus ===
                                        "in-progress"
                                            ? "in-progress"
                                            : activeStatus
                                    } complaints.`}

                            </p>

                        </div>

                    ) : (

                        <div className="officer-complaints-grid">

                            {filteredComplaints.map(
                                (complaint) => (

                                    <OfficerComplaintCard
                                        key={complaint._id}
                                        complaint={complaint}
                                        onViewDetails={
                                            handleViewDetails
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>

            </div>

        </OfficerLayout>
    );
}


export default OfficerComplaints;