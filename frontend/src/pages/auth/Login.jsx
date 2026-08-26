import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";

function Login() {

    const navigate = useNavigate();

    const [accountType, setAccountType] = useState("citizen");

    const [formData, setFormData] = useState({
        email: "",
        employeeId: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleAccountTypeChange = (type) => {

        setAccountType(type);

        setFormData({
            email: "",
            employeeId: "",
            password: ""
        });

        setShowPassword(false);
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const loginData =
              accountType === "citizen"
                ? {
                    accountType: "citizen",
                    email: formData.email,
                    password: formData.password,
                  }
                : {
                    accountType: "officer",
                    employeeId: formData.employeeId,
                    password: formData.password,
                  };

            const response = await API.post(
                "/auth/login",
                loginData
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

                    <img
                        src={logo}
                        alt="CivicConnect Logo"
                        className="login-logo"
                    />

                    <h1 className="brand-logo">

                        <span className="brand-initial">C</span>
                        <span className="brand-rest">ivic</span>
                        <span className="brand-initial">C</span>
                        <span className="brand-rest">onnect</span>

                    </h1>

                    <p>
                        Smart Civic Issue Reporting Portal
                    </p>

                </div>

                {/* Right Section */}

                <div className="login-right">

                    <h2>Welcome Back</h2>

                    <p className="subtitle">
                        Sign in to CivicConnect and continue reporting civic issues.
                    </p>

                    {/* Citizen / Officer Selection */}

                    <div className="account-type-selector">

                        <button
                            type="button"
                            className={
                                accountType === "citizen"
                                    ? "account-type-button active"
                                    : "account-type-button"
                            }
                            onClick={() =>
                                handleAccountTypeChange("citizen")
                            }
                        >
                            Citizen
                        </button>

                        <button
                            type="button"
                            className={
                                accountType === "officer"
                                    ? "account-type-button active"
                                    : "account-type-button"
                            }
                            onClick={() =>
                                handleAccountTypeChange("officer")
                            }
                        >
                            Officer
                        </button>

                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Citizen Email */}

                        {accountType === "citizen" && (

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

                        )}

                        {/* Officer Employee ID */}

                        {accountType === "officer" && (

                            <div className="input-group">

                                <label>Employee ID</label>

                                <input
                                    type="text"
                                    name="employeeId"
                                    placeholder="Enter your employee ID"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        )}

                        {/* Password */}

                        <div className="input-group">

                            <label>Password</label>

                            <div className="password-input-wrapper">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
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
                                            ? "Show password"
                                            : "Hide password"
                                    }
                                >

                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}

                                </button>

                            </div>

                        </div>

                        <button type="submit">

                            {accountType === "citizen"
                                ? "Login to CivicConnect"
                                : "Login as Officer"}

                        </button>

                    </form>

                    <p className="register-link">

                        New to CivicConnect?

                        <Link to="/register">
                            {" "}Create an Account
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;