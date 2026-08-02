import "../styles/navbar.css";
import logo from "../assets/logo.png";

function Navbar() {

    return (
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="CivicConnect Logo" className="navbar-logo" />

          <h1 className="brand-logo-navbar">
            <span className="brand-initial">C</span>
            <span className="brand-rest">ivic</span>
            <span className="brand-initial">C</span>
            <span className="brand-rest">onnect</span>
          </h1>
        </div>
      </nav>
    );

}

export default Navbar;