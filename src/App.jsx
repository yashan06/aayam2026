import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Events from './pages/Events';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VolunteerForm from './pages/VolunteerForm';

export default function App() {
  const location = useLocation();

  // Hide standard header & footer on standalone auth & admin pages
  const isStandalonePage = ['/login', '/signup', '/admin'].includes(location.pathname);

  return (
    <div class="app-root">
      {!isStandalonePage && <Navbar />}
      
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

      {!isStandalonePage && <Footer />}
    </div>
  );
}
