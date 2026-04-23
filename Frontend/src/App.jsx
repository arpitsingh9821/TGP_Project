import { BrowserRouter as Router, Routes, Route, Form } from 'react-router-dom';
import Home from './components/HomeSection/Home.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import SignupApplicant from './components/Signup Pages/SignupApplicant.jsx';
import SignupAppcomm from './components/Signup Pages/SignupAppcomm.jsx';
import SignupDiscomm from './components/Signup Pages/SignupDiscomm.jsx';
import SignupAdmin from './components/Signup Pages/SignupAdmin.jsx';
import Login from './components/Dashboards/Login Page/LoginPage.jsx';
import { useAuth } from "../context/authContext.jsx";
import AppcntDash from "./components/Dashboards/ApplicantDashboard/AppcntDash.jsx";
import DiscommDash from './components/Dashboards/DiscommDashboard/DiscommDash.jsx';
import AdminDash from './components/Dashboards/Admin Dashboard/AdminDash.jsx';
import AppcomDash from './components/Dashboards/Appcom Dashboard/AppcomDash.jsx';
import ApplicationForm from './components/Dashboards/Application/ApplicationForm.jsx';
import ApplicationDetail from './components/Dashboards/Appcom Dashboard/AppcomDetail.jsx';
function App() {
  const { isAuthenticated, userData } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes — Anyone Can Access */}
        <Route path="/" element={<Home />} />        
        <Route path="/signup/applicant" element={<SignupApplicant />} />
        <Route path="/signup/appcomm" element={<SignupAppcomm />} />
        <Route path="/signup/discomm" element={<SignupDiscomm />} />
        <Route path="/signup/admin" element={<SignupAdmin />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Application" element={isAuthenticated ? <ApplicationForm/> : <Login/>} />
        
        {/* ✅ Corrected Route Protection */}
        <Route path="/Login/AppcntDash" element={isAuthenticated ? <AppcntDash /> : <Login />} />
        <Route path="/Login/DiscommDash" element={isAuthenticated ? <DiscommDash /> : <Login />} />
        <Route path="/Login/AdminDash" element={isAuthenticated ? <AdminDash /> : <Login />} />
        <Route path="/Login/AppcomDash"
            element={
                isAuthenticated && userData?.role === 'appcomm' 
                ? <AppcomDash /> 
                : <Login />
            }
         />
        <Route path="/Login/AppcomDash/application/:uid" element={isAuthenticated ? <ApplicationDetail /> : <Login />} />
        <Route path="*" element={<div className="text-center p-20 text-2xl">404 - Page Not Found </div>} />

      </Routes>
    </Router>
  );
}

export default App;
