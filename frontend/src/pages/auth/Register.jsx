import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
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

            const response = await API.post("/auth/register", formData);

            // Store Token
            localStorage.setItem("token", response.data.token);

            // Store User
            localStorage.setItem("user", JSON.stringify(response.data.user));

            toast.success(response.data.message);

            setTimeout(() => {
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
            }, 1000);

        } catch (error) {

            toast.error(
                error.response?.data?.message || "Registration Failed"
            );

        }

    };

    return (

        <div className="register-page">

            <div className="register-card">

                {/* Left Section */}

                <div className="register-left">

                    <div className="logo-placeholder">
                        Logo
                    </div>

                    <h1>Smart Civic Issue Detection System</h1>

                    <p>
                        Join our platform to report civic issues and help build a cleaner,
                        safer and smarter city.
                    </p>

                </div>

                {/* Right Section */}

                <div className="register-right">

                    <h2>Create Account</h2>

                    <p className="subtitle">
                        Register to continue
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">

                            <label>Full Name</label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                            />

                        </div>

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
                            Register
                        </button>

                    </form>

                    <p className="login-link">
                        Already have an account?
                        <Link to="/"> Login</Link>
                    </p>

                </div>

            </div>

        </div>

    );

}

export default Register;