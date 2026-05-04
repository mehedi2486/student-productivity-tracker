import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Notes } from "./pages/Notes";
import { Assignments } from "./pages/Assignments";
import { AssignmentDetail } from "./pages/AssignmentDetail";
import { StudyTracker } from "./pages/StudyTracker";
import { Layout } from "./components/Layout";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/notes" element={<PrivateRoute><Layout><Notes /></Layout></PrivateRoute>} />
        <Route path="/assignments" element={<PrivateRoute><Layout><Assignments /></Layout></PrivateRoute>} />
        <Route path="/assignments/:id" element={<PrivateRoute><Layout><AssignmentDetail /></Layout></PrivateRoute>} />
        <Route path="/study" element={<PrivateRoute><Layout><StudyTracker /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;