import "../../styles/systemAdmin.css";

import { useNavigate } from "react-router-dom";

import {
    ArrowLeft
} from "lucide-react";

import OfficerList from "../../components/systemAdmin/OfficerList";

function Officers() {

    const navigate = useNavigate();


    /* =================================
       RENDER
    ================================= */

    return (

        <div className="system-admin-page">


            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="system-admin-header">


                <div className="system-admin-header-left">


                    {/* =================================
                        BACK TO DASHBOARD
                    ================================= */}

                    <button
                        type="button"
                        className="system-admin-back-button"
                        onClick={() =>
                            navigate(
                                "/system-admin/dashboard"
                            )
                        }
                    >

                        <ArrowLeft
                            size={18}
                            strokeWidth={2}
                        />

                        <span>
                            Back to Dashboard
                        </span>

                    </button>


                    {/* =================================
                        PAGE TITLE
                    ================================= */}

                    <div className="system-admin-title-block">

                        <h1>
                            Officer Management
                        </h1>

                        <p>
                            View and manage all CivicConnect
                            officer accounts.
                        </p>

                    </div>


                </div>


            </div>


            {/* =================================
                OFFICER LIST
            ================================= */}

            <div className="system-admin-content-section">

                <OfficerList />

            </div>


        </div>

    );

}

export default Officers;