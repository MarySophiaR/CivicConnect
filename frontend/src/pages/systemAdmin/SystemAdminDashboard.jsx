import "../../styles/systemAdmin.css";

import AdminDashboardCards
    from "../../components/systemAdmin/AdminDashboardCards";

import {
    useEffect,
    useState
} from "react";

import API from "../../api/axios";

import {
    toast
} from "react-toastify";


function SystemAdminDashboard() {

    /* =====================================================
       MUNICIPALITY
    ===================================================== */

    const [municipality, setMunicipality] =
        useState("");


    /* =====================================================
       OFFICER COUNTS
    ===================================================== */

    const [counts, setCounts] = useState({

        totalOfficers: 0,

        juniorEngineer: 0,

        assistantExecutiveEngineer: 0,

        executiveEngineer: 0,

        municipalCommissioner: 0,

        activeOfficers: 0,

        inactiveOfficers: 0

    });


    const [loading, setLoading] =
        useState(true);


    /* =====================================================
       FETCH OFFICER COUNTS
    ===================================================== */

    const fetchOfficerCounts = async () => {

        try {

            setLoading(true);

            const response =
                await API.get(
                    "/system-admin/officer-counts"
                );


            /* =================================================
               OFFICER COUNTS
            ================================================= */

            setCounts({

                totalOfficers:
                    response.data?.totalOfficers || 0,

                juniorEngineer:
                    response.data?.juniorEngineer || 0,

                assistantExecutiveEngineer:
                    response.data?.assistantExecutiveEngineer || 0,

                executiveEngineer:
                    response.data?.executiveEngineer || 0,

                municipalCommissioner:
                    response.data?.municipalCommissioner || 0,

                activeOfficers:
                    response.data?.activeOfficers || 0,

                inactiveOfficers:
                    response.data?.inactiveOfficers || 0

            });

        }

        catch (error) {

            console.error(
                "Officer Count Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load officer statistics."
            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    useEffect(() => {

        /* =================================================
           GET LOGGED-IN SYSTEM ADMINISTRATOR
        ================================================= */

        try {

            const storedUser =
                JSON.parse(
                    localStorage.getItem("user")
                );


            const municipalities =
                storedUser?.municipalities;


            /* =================================================
               GET MUNICIPALITY
            ================================================= */

            if (
                Array.isArray(municipalities) &&
                municipalities.length > 0
            ) {

                setMunicipality(
                    municipalities[0]
                );

            }

            else {

                setMunicipality(
                    "Municipality"
                );

            }

        }

        catch (error) {

            console.error(
                "System Admin User Data Error:",
                error
            );

            setMunicipality(
                "Municipality"
            );

        }


        /* =================================================
           FETCH OFFICER STATISTICS
        ================================================= */

        fetchOfficerCounts();

    }, []);


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="system-admin-page">


            {/* =================================================
               PAGE HEADER
            ================================================= */}

            <section className="system-admin-dashboard-header">

                <div className="system-admin-dashboard-header-content">

                    <h1>
                        System Administrator Dashboard
                    </h1>


                    <h2>
                        {municipality} Municipality
                    </h2>


                    <p>
                        Manage CivicConnect officer accounts
                        and monitor the administrative structure
                        of the system.
                    </p>

                </div>

            </section>


            {/* =================================================
               DASHBOARD STATISTICS
            ================================================= */}

            <section className="system-admin-statistics">

                <AdminDashboardCards
                    counts={counts}
                    loading={loading}
                />

            </section>


        </div>

    );

}


export default SystemAdminDashboard;