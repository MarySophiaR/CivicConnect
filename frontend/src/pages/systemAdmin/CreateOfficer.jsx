import "../../styles/systemAdmin.css";

import CreateOfficerForm from "../../components/systemAdmin/CreateOfficerForm";

import { UserPlus } from "lucide-react";

function CreateOfficer() {

    return (

        <div className="system-admin-page">

            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="system-admin-header">

                <div className="system-admin-create-header">

                    <div className="create-officer-header-icon">

                        <UserPlus
                            size={24}
                            strokeWidth={2}
                        />

                    </div>

                    <div className="system-admin-create-header-content">

                        <h1>
                            Create Officer Account
                        </h1>

                        <p>
                            Create a new CivicConnect officer account and
                            assign the appropriate role.
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================
                CREATE OFFICER FORM
            ================================= */}

            <div className="system-admin-form-section">

                <CreateOfficerForm />

            </div>

        </div>

    );

}

export default CreateOfficer;