import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
    ClipboardList,
    FolderKanban,
    Clock3,
    BadgeCheck,
    Type,
    FolderOpen,
    CalendarDays
} from "lucide-react";
import "../../styles/dashboard.css";

function Dashboard() {

    const [stats, setStats] = useState({

        total: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        recentComplaints: []

    });

    useEffect(() => {

        fetchDashboard();

    }, []);

    const fetchDashboard = async () => {

        try {

            const response = await API.get("/complaints/dashboard");

            setStats(response.data);

        } catch (error) {

            console.error(error.response?.data || error.message);

        }

    };

    const getStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "status-badge pending";

            case "Assigned":
                return "status-badge assigned";

            case "In Progress":
                return "status-badge progress";

            case "Resolved":
                return "status-badge resolved";

            default:
                return "status-badge";

        }

    };

    return (

        <Layout>

            <div className="dashboard">

                <div className="dashboard-header">

                    <h1 className="dashboard-title">
                        Citizen Dashboard
                    </h1>

                    <p className="dashboard-subtitle">
                        Making Your City Better, One Report at a Time.
                    </p>

                    <p className="dashboard-description">
                        Report civic issues, monitor complaint progress, and contribute towards a cleaner, safer, and smarter community.
                    </p>

                </div>

                <div className="stats-grid">

                    <div className="stat-card">

                        <ClipboardList
                            size={22}
                            strokeWidth={1.8}
                            className="card-icon"
                        />

                        <h3>Total Complaints</h3>

                        <span>{stats.total}</span>

                    </div>

                    <div className="stat-card">

                        <FolderKanban
                            size={22}
                            strokeWidth={1.8}
                            className="card-icon"
                        />

                        <h3>Assigned</h3>

                        <span>{stats.assigned}</span>

                    </div>

                    <div className="stat-card">

                        <Clock3
                            size={22}
                            strokeWidth={1.8}
                            className="card-icon"
                        />

                        <h3>In Progress</h3>

                        <span>{stats.inProgress}</span>

                    </div>

                    <div className="stat-card">

                        <BadgeCheck
                            size={22}
                            strokeWidth={1.8}
                            className="card-icon"
                        />

                        <h3>Resolved</h3>

                        <span>{stats.resolved}</span>

                    </div>

                </div>

                <div className="recent-section">

                    <h2 className="recent-heading">

                        <ClipboardList
                            size={22}
                            strokeWidth={1.8}
                            className="card-icon"
                        />

                        Recent Complaints

                    </h2>

                    <table className="complaint-table">

                        <thead>

                            <tr>

                                <th>
                                    <Type size={16} strokeWidth={2} />
                                    Title
                                </th>

                                <th>
                                    <FolderOpen size={16} strokeWidth={2} />
                                    Category
                                </th>

                                <th>
                                    <BadgeCheck size={16} strokeWidth={2} />
                                    Status
                                </th>

                                <th>
                                    <CalendarDays size={16} strokeWidth={2} />
                                    Date
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                stats.recentComplaints.length === 0 ?

                                    (

                                        <tr>

                                            <td
                                                className="no-data"
                                                colSpan="4"
                                            >
                                                No complaints found.
                                            </td>

                                        </tr>

                                    )

                                    :

                                    (

                                        stats.recentComplaints.map((complaint) => (

                                            <tr key={complaint._id}>

                                                <td>{complaint.title}</td>

                                                <td>{complaint.category}</td>

                                                <td>

                                                    <span className={getStatusClass(complaint.status)}>
                                                        {complaint.status}
                                                    </span>

                                                </td>

                                                <td>

                                                    {new Date(
                                                        complaint.createdAt
                                                    ).toLocaleDateString()}

                                                </td>

                                            </tr>

                                        ))

                                    )

                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </Layout>

    );

}

export default Dashboard;