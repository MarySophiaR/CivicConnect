import "../../styles/officerComponents.css";
import logo from "../../assets/logo.png";

import OfficerNotification from "./OfficerNotification";

function OfficerNavbar() {

    return (

        <nav className="officer-navbar">

            <div className="officer-navbar-left">

                <img
                    src={logo}
                    alt="CivicConnect Logo"
                    className="officer-navbar-logo"
                />

                <h1 className="brand-logo-navbar">
                    CivicConnect
                </h1>

            </div>


            <div className="officer-navbar-right">

                <OfficerNotification />

            </div>

        </nav>

    );

}

export default OfficerNavbar;