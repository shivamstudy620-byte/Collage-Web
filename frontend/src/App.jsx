import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import ChairmanPrincipal from './pages/ChairmanPrincipal';
import Courses from './pages/Courses';
import Notices from './pages/Notices';
import NoticeDetail from './pages/NoticeDetail';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ManageNotices from './pages/admin/ManageNotices';
import ManageCourses from './pages/admin/ManageCourses';
import ManageGallery from './pages/admin/ManageGallery';
import ChangePassword from './pages/admin/ChangePassword';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isAdminRoute && <TopBar />}
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow-1">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/leadership" element={<ChairmanPrincipal />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/notices/:id" element={<NoticeDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/notices" element={<ProtectedRoute><ManageNotices /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute><ManageCourses /></ProtectedRoute>} />
        <Route path="/admin/gallery" element={<ProtectedRoute><ManageGallery /></ProtectedRoute>} />
        <Route path="/admin/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
