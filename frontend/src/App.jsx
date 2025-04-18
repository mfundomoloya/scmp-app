import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './pages/VerifyEmail';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  console.log('Rendering App'); // Debug
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/lecturer" element={<LecturerDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;