import "../../styles/systemAdminComponents.css";

import logo from "../../assets/logo.png";

function SystemAdminNavbar() {

    return (

        <nav className="system-admin-navbar">


            {/* =================================
                LEFT SIDE
            ================================= */}

            <div className="system-admin-navbar-left">

                <img
                    src={logo}
                    alt="CivicConnect Logo"
                    className="system-admin-navbar-logo"
                />


                <h1 className="brand-logo-navbar">

                    CivicConnect

                </h1>

            </div>


        </nav>

    );

}

export default SystemAdminNavbar;