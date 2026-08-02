import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import CitizenDashboard from "../pages/citizen/Dashboard";
import CreateComplaint from "../pages/citizen/CreateComplaint";
import MyComplaints from "../pages/citizen/MyComplaints";
import EditComplaint from "../pages/citizen/EditComplaint";
import ComplaintDetails from "../pages/citizen/ComplaintDetails";
import SystemAdminDashboard from "../pages/systemAdmin/Dashboard";
import JuniorEngineerDashboard from "../pages/juniorEngineer/Dashboard";
import AssistantExecutiveEngineerDashboard from "../pages/assistantExecutiveEngineer/Dashboard";
import ExecutiveEngineerDashboard from "../pages/executiveEngineer/Dashboard";
import MunicipalCommissionerDashboard from "../pages/municipalCommissioner/Dashboard";

function AppRoutes() {
    return (
      <BrowserRouter>
        <Routes>
          {/* Authentication */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen */}
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />

          <Route
            path="/citizen/create-complaint"
            element={<CreateComplaint />}
          />

          <Route path="/citizen/my-complaints" element={<MyComplaints />} />

          <Route
            path="/citizen/complaint/edit/:id"
            element={<EditComplaint />}
          />

          <Route path="/citizen/complaint/:id" element={<ComplaintDetails />} />

          {/* System Administrator */}
          <Route
            path="/system-admin/dashboard"
            element={<SystemAdminDashboard />}
          />

          {/* Junior Engineer */}
          <Route
            path="/junior-engineer/dashboard"
            element={<JuniorEngineerDashboard />}
          />

          {/* Assistant Executive Engineer */}
          <Route
            path="/assistant-executive-engineer/dashboard"
            element={<AssistantExecutiveEngineerDashboard />}
          />

          {/* Executive Engineer */}
          <Route
            path="/executive-engineer/dashboard"
            element={<ExecutiveEngineerDashboard />}
          />

          {/* Municipal Commissioner */}
          <Route
            path="/municipal-commissioner/dashboard"
            element={<MunicipalCommissionerDashboard />}
          />
        </Routes>
      </BrowserRouter>
    );
}

export default AppRoutes;