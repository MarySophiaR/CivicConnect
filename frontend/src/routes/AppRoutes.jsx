import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import CitizenDashboard from "../pages/citizen/Dashboard";
import CreateComplaint from "../pages/citizen/CreateComplaint";
import MyComplaints from "../pages/citizen/MyComplaints";
import EditComplaint from "../pages/citizen/EditComplaint";
import ComplaintDetails from "../pages/citizen/ComplaintDetails";

import OfficerDashboard from "../pages/officer/OfficerDashboard";
import OfficerComplaints from "../pages/officer/OfficerComplaints";
import OfficerComplaintDetails from "../pages/officer/OfficerComplaintDetails";

import SystemAdminDashboard from "../pages/systemAdmin/Dashboard";


function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =================================
            AUTHENTICATION
        ================================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================
            CITIZEN
        ================================= */}

        <Route
          path="/citizen/dashboard"
          element={<CitizenDashboard />}
        />

        <Route
          path="/citizen/create-complaint"
          element={<CreateComplaint />}
        />

        <Route
          path="/citizen/my-complaints"
          element={<MyComplaints />}
        />

        <Route
          path="/citizen/complaint/edit/:id"
          element={<EditComplaint />}
        />

        <Route
          path="/citizen/complaint/:id"
          element={<ComplaintDetails />}
        />


        {/* =================================
            SYSTEM ADMINISTRATOR
        ================================= */}

        <Route
          path="/system-admin/dashboard"
          element={<SystemAdminDashboard />}
        />


        {/* =================================
            OFFICER DASHBOARDS
        ================================= */}

        <Route
          path="/junior-engineer/dashboard"
          element={<OfficerDashboard />}
        />

        <Route
          path="/assistant-executive-engineer/dashboard"
          element={<OfficerDashboard />}
        />

        <Route
          path="/executive-engineer/dashboard"
          element={<OfficerDashboard />}
        />

        <Route
          path="/municipal-commissioner/dashboard"
          element={<OfficerDashboard />}
        />


        {/* =================================
            OFFICER COMPLAINTS
        ================================= */}

        <Route
          path="/junior-engineer/complaints"
          element={<OfficerComplaints />}
        />

        <Route
          path="/assistant-executive-engineer/complaints"
          element={<OfficerComplaints />}
        />

        <Route
          path="/executive-engineer/complaints"
          element={<OfficerComplaints />}
        />

        <Route
          path="/municipal-commissioner/complaints"
          element={<OfficerComplaints />}
        />


        {/* =================================
            ROLE-SPECIFIC COMPLAINT DETAILS
        ================================= */}

        <Route
          path="/junior-engineer/complaints/:id"
          element={<OfficerComplaintDetails />}
        />

        <Route
          path="/assistant-executive-engineer/complaints/:id"
          element={<OfficerComplaintDetails />}
        />

        <Route
          path="/executive-engineer/complaints/:id"
          element={<OfficerComplaintDetails />}
        />

        <Route
          path="/municipal-commissioner/complaints/:id"
          element={<OfficerComplaintDetails />}
        />


      </Routes>

    </BrowserRouter>

  );

}


export default AppRoutes;