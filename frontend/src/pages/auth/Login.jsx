import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";

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

            // Store Token
            localStorage.setItem(
                "token",
                response.data.token
            );

            // Store User Details
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

                    <div className="logo-placeholder">
                        Logo
                    </div>

                    <h1>Smart Civic Issue Detection System</h1>

                    <p>
                        Report civic issues easily and help improve your city.
                    </p>

                </div>

                {/* Right Section */}

                <div className="login-right">

                    <h2>Welcome Back</h2>

                    <p className="subtitle">
                        Sign in to continue
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
                            />

                        </div>

                        <button type="submit">
                            Login
                        </button>

                    </form>

                    <p className="register-link">
                        Don't have an account?
                        <Link to="/register"> Register</Link>
                    </p>

                </div>

            </div>

        </div>

    );

}

export default Login;