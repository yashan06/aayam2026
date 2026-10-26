import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Eager load Home for instant initial page render
import Home from './pages/Home';

// Lazy load secondary pages to dramatically reduce initial bundle size & load time
const Events = lazy(() => import('./pages/Events'));
const Team = lazy(() => import('./pages/Team'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VolunteerForm = lazy(() => import('./pages/VolunteerForm'));

export default function App() {
  const location = useLocation();

  // Hide standard header & footer on standalone auth & admin pages
  const isStandalonePage = ['/login', '/signup', '/admin'].includes(location.pathname);

  return (
    <div className="app-root">
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
