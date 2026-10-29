import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Eager load core user-facing pages for instant navigation without route-transition spinners
import Home from './pages/Home';
import Team from './pages/Team';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VolunteerForm from './pages/VolunteerForm';

// Lazy load heavy admin portal only
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  const location = useLocation();

  // Hide standard header & footer on standalone auth & admin pages
  const isStandalonePage = ['/login', '/signup', '/admin'].includes(location.pathname);

  return (
    <div className="app-root">
      <ScrollToTop />
      {!isStandalonePage && <Navbar />}
      
      <Suspense fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/team" element={<Team />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/volunteer-form" element={<VolunteerForm />} />
          <Route path="/volunteer-registration" element={<VolunteerForm />} />
        </Routes>
      </Suspense>

      {!isStandalonePage && <Footer />}
    </div>
  );
}
