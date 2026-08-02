import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import logo from "../../assets/logo.png";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await API.post(
                "/auth/login",
                formData
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            toast.success("Login Successful!");

            const role = response.data.user.role;

            switch (role) {

                case "citizen":
                    navigate("/citizen/dashboard");
                    break;

                case "systemAdmin":
                    navigate("/system-admin/dashboard");
                    break;

                case "juniorEngineer":
                    navigate("/junior-engineer/dashboard");
                    break;

                case "assistantExecutiveEngineer":
                    navigate("/assistant-executive-engineer/dashboard");
                    break;

                case "executiveEngineer":
                    navigate("/executive-engineer/dashboard");
                    break;

                case "municipalCommissioner":
                    navigate("/municipal-commissioner/dashboard");
                    break;

                default:
                    navigate("/");

            }

        } catch (error) {

            toast.error(
                error.response?.data?.message || "Login Failed"
            );

        }

    };

    return (
      <div className="login-page">
        <div className="login-card">
          {/* Left Section */}

          <div className="login-left">
            <img src={logo} alt="CivicConnect Logo" className="login-logo" />

            <h1 className="brand-logo">
              <span className="brand-initial">C</span>
              <span className="brand-rest">ivic</span>
              <span className="brand-initial">C</span>
              <span className="brand-rest">onnect</span>
            </h1>

            <p>Smart Civic Issue Reporting Portal</p>
          </div>

          {/* Right Section */}

          <div className="login-right">
            <h2>Welcome Back</h2>

            <p className="subtitle">
              Sign in to CivicConnect and continue reporting civic issues.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit">Login to CivicConnect</button>
            </form>

            <p className="register-link">
              New to CivicConnect?
              <Link to="/register"> Create an Account</Link>
            </p>
          </div>
        </div>
      </div>
    );

}

export default Login;