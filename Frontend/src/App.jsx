import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/HomeSection/Home.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import SignupApplicant from './components/Signup Pages/SignupApplicant.jsx';
import SignupAppcomm from './components/Signup Pages/SignupAppcomm.jsx';
import SignupDiscomm from './components/Signup Pages/SignupDiscomm.jsx';
import SignupAdmin from './components/Signup Pages/SignupAdmin.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup/applicant" element={<SignupApplicant />} />
        <Route path="/signup/appcomm" element={<SignupAppcomm />} />
        <Route path="/signup/discomm" element={<SignupDiscomm />} />
        <Route path="/signup/admin" element={<SignupAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
