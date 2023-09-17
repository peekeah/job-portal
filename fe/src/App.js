import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/dashboard";
import AppliedJobs from "./pages/applied-job";
import PostedJobs from "./pages/posted-jobs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* student routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applied-jobs" element={<AppliedJobs />} />
      
        {/* company routes */}
        <Route path="/posted-jobs" element={<PostedJobs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
