import { useEffect, useState } from "react";
import OfficerLayout from "../../components/officer/OfficerLayout";
import API from "../../api/axios";

import {
    ClipboardList,
    FolderKanban,
    Clock3,
    BadgeCheck,
    Type,
    FolderOpen,
    UserRound,
    CalendarDays
} from "lucide-react";

import "../../styles/officerDashboard.css";


function OfficerDashboard({ role: propRole }) {

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        total: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0
    });


    /* =========================================
       GET CURRENT USER ROLE
    ========================================= */

    const getCurrentRole = () => {

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

        return currentRole;
    };


    /* =========================================
       ROLE NAME FOR DISPLAY
    ========================================= */

    const getRoleName = () => {

        const currentRole = getCurrentRole();

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


    /* =========================================
       GET DASHBOARD API ENDPOINT
    ========================================= */

    const getDashboardEndpoint = () => {

        const currentRole = getCurrentRole();

        const normalizedRole =
            String(currentRole)
                .toLowerCase()
                .replace(/[\s_-]+/g, "");

        switch (normalizedRole) {

            case "juniorengineer":
            case "je":
                return "/dashboard/junior-engineer";

            case "assistantexecutiveengineer":
            case "aee":
                return "/dashboard/assistant-executive-engineer";

            case "executiveengineer":
            case "ee":
                return "/dashboard/executive-engineer";

            case "municipalcommissioner":
            case "mc":
                return "/dashboard/municipal-commissioner";

            default:
                return null;
        }
    };


    /* =========================================
       FETCH DASHBOARD DATA
    ========================================= */

    useEffect(() => {
        fetchDashboardData();
    }, []);


    const fetchDashboardData = async () => {

        try {

            setLoading(true);


            /* =================================
               1. GET DASHBOARD ENDPOINT
            ================================= */

            const dashboardEndpoint =
                getDashboardEndpoint();


            if (!dashboardEndpoint) {

                console.error(
                    "Unable to determine dashboard endpoint."
                );

                return;
            }


            console.log(
                "Dashboard endpoint:",
                dashboardEndpoint
            );


            /* =================================
               2. FETCH COUNTS
            ================================= */

            const dashboardResponse =
                await API.get(dashboardEndpoint);

            const dashboardData =
                dashboardResponse.data;


            console.log(
                "Dashboard API response:",
                dashboardData
            );


            /* =================================
               3. STORE COUNTS
            ================================= */

            setStats({

                total:
                    dashboardData.totalComplaints ?? 0,

                assigned:
                    dashboardData.assigned ?? 0,

                inProgress:
                    dashboardData.inProgress ?? 0,

                resolved:
                    dashboardData.resolved ?? 0
            });


            /* =================================
               4. FETCH COMPLAINTS
            ================================= */

            const complaintsResponse =
                await API.get("/complaints/all");

            const complaintsData =
                complaintsResponse.data;


            console.log(
                "Complaints API response:",
                complaintsData
            );


            setComplaints(
                complaintsData.complaints || []
            );


        } catch (error) {

            console.error(
                "Officer dashboard error:",
                error.response?.data ||
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    /* =========================================
       DATE FORMAT
    ========================================= */

    const formatDate = (date) => {

        if (!date) return "—";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    };


    /* =========================================
       STATUS CLASS
    ========================================= */

    const getStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "status-pending";

            case "Assigned":
                return "status-assigned";

            case "In Progress":
                return "status-in-progress";

            case "Escalated":
                return "status-escalated";

            case "Resolved":
                return "status-resolved";

            default:
                return "status-default";
        }
    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (
            <OfficerLayout role={propRole}>

                <div className="officer-page-container">

                    <div className="officer-dashboard-loading">
                        Loading dashboard...
                    </div>

                </div>

            </OfficerLayout>
        );
    }


    /* =========================================
       DASHBOARD
    ========================================= */

    return (

        <OfficerLayout role={propRole}>


            <div className="officer-page-container">

                {/* =================================
                    PAGE HEADER
                ================================= */}

                <header className="officer-page-header">

                    <h1>
                        {roleName} Dashboard
                    </h1>

                    <p>
                        Monitor and manage assigned civic complaints.
                    </p>

                </header>


                {/* =================================
                    STATISTICS
                ================================= */}

                <div className="officer-stat-grid">


                    {/* TOTAL COMPLAINTS */}

                    <div className="officer-stat-card">

                        <ClipboardList
                            size={22}
                            strokeWidth={1.8}
                            className="officer-card-icon"
                        />

                        <h3>
                            Total Complaints
                        </h3>

                        <span>
                            {stats.total}
                        </span>

                    </div>


                    {/* ASSIGNED */}

                    <div className="officer-stat-card">

                        <FolderKanban
                            size={22}
                            strokeWidth={1.8}
                            className="officer-card-icon"
                        />

                        <h3>
                            Assigned
                        </h3>

                        <span>
                            {stats.assigned}
                        </span>

                    </div>


                    {/* IN PROGRESS */}

                    <div className="officer-stat-card">

                        <Clock3
                            size={22}
                            strokeWidth={1.8}
                            className="officer-card-icon"
                        />

                        <h3>
                            In Progress
                        </h3>

                        <span>
                            {stats.inProgress}
                        </span>

                    </div>


                    {/* RESOLVED */}

                    <div className="officer-stat-card">

                        <BadgeCheck
                            size={22}
                            strokeWidth={1.8}
                            className="officer-card-icon"
                        />

                        <h3>
                            Resolved
                        </h3>

                        <span>
                            {stats.resolved}
                        </span>

                    </div>

                </div>


                {/* =================================
                    COMPLAINTS
                ================================= */}

                <section className="officer-dashboard-complaints-section">

                    <h2 className="officer-section-heading">

                        <ClipboardList
                            size={22}
                            strokeWidth={1.8}
                            className="officer-card-icon"
                        />

                        Complaints

                    </h2>


                    {/* =================================
                        EMPTY STATE
                    ================================= */}

                    {complaints.length === 0 ? (

                        <div className="officer-empty-state">

                            <h3>
                                No complaints found
                            </h3>

                            <p>
                                There are currently no complaints
                                available for your level.
                            </p>

                        </div>

                    ) : (

                        /* =================================
                           COMPLAINT TABLE
                        ================================= */

                        <div className="officer-complaint-table-wrapper">

                            <table className="officer-complaint-table">

                                <thead>

                                    <tr>

                                        {/* TITLE */}

                                        <th>

                                            <Type
                                                size={16}
                                                strokeWidth={2}
                                            />

                                            Title

                                        </th>


                                        {/* CATEGORY */}

                                        <th>

                                            <FolderOpen
                                                size={16}
                                                strokeWidth={2}
                                            />

                                            Category

                                        </th>


                                        {/* STATUS */}

                                        <th>

                                            <BadgeCheck
                                                size={16}
                                                strokeWidth={2}
                                            />

                                            Status

                                        </th>


                                        {/* ASSIGNED TO */}

                                        <th>

                                            <UserRound
                                                size={16}
                                                strokeWidth={2}
                                            />

                                            Assigned To

                                        </th>


                                        {/* DATE */}

                                        <th>

                                            <CalendarDays
                                                size={16}
                                                strokeWidth={2}
                                            />

                                            Reported On

                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {complaints.map(
                                        (complaint) => (

                                            <tr
                                                key={complaint._id}
                                            >

                                                {/* TITLE */}

                                                <td>

                                                    <strong>
                                                        {complaint.title}
                                                    </strong>

                                                </td>


                                                {/* CATEGORY */}

                                                <td>
                                                    {complaint.category}
                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`officer-status-badge ${getStatusClass(
                                                            complaint.status
                                                        )}`}
                                                    >
                                                        {complaint.status}
                                                    </span>

                                                </td>


                                                {/* ASSIGNED TO */}

                                                <td>

                                                    {complaint.assignedTo?.name ||
                                                        "Not assigned"}

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    {formatDate(
                                                        complaint.createdAt
                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>

        </OfficerLayout>
    );
}


export default OfficerDashboard;