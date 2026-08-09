import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

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
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

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

                    <img
                        src={logo}
                        alt="CivicConnect Logo"
                        className="register-logo"
                    />

                    <h1 className="brand-logo">

                        <span className="brand-initial">
                            CivicConnect
                        </span>

                    </h1>

                    <p>
                        Smart Civic Issue Reporting Portal
                    </p>

                </div>

                {/* Right Section */}

                <div className="register-right">

                    <h2>Create Your Account</h2>

                    <p className="subtitle">
                        Join CivicConnect and help build a cleaner, safer, and smarter
                        community.
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
                                required
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
                                required
                            />

                        </div>

                        <div className="input-group">

                            <label>Password</label>

                            <div className="password-input-wrapper">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <Eye size={20} />
                                    ) : (
                                        <EyeOff size={20} />
                                    )}
                                </button>

                            </div>

                        </div>

                        <button type="submit">
                            Create Account
                        </button>

                    </form>

                    <p className="login-link">
                        Already a CivicConnect member?
                        <Link to="/"> Sign In</Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;