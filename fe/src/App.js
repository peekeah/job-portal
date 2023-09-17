import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/dashboard";
import AppliedJobs from "./pages/applied-job";
import PostedJobs from "./pages/posted-jobs";
import AppliedCandidates from './pages/applied-candidates';
import PostJob from "./pages/post-job";
import Profile from "./pages/profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />



        {/* student routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/applied-jobs" element={<AppliedJobs />} />
      
        {/* company routes */}
        <Route path="/posted-jobs" element={<PostedJobs />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/applied-students/:id" element={<AppliedCandidates />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
