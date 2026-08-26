import "../../styles/navbar.css";
import logo from "../../assets/logo.png";

import OfficerNotification from "../officer/OfficerNotification";

function citizenNavbar() {

    return (

        <nav className="citizen-navbar">

            <div className="citizen-navbar-left">

                <img
                    src={logo}
                    alt="CivicConnect Logo"
                    className="citizen-navbar-logo"
                />

                <h1 className="brand-logo-navbar">
                    CivicConnect
                </h1>

            </div>


            <div className="citizen-navbar-right">

                <OfficerNotification />

            </div>

        </nav>

    );

}

export default citizenNavbar;