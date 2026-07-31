import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Support from './pages/Support'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Refund from './pages/Refund'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import Pricing from './pages/Pricing'
import PostProperty from './pages/PostProperty'
import MyListings from './pages/MyListings'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminListings from './pages/Admin/ManageListings'
import AdminInquiries from './pages/Admin/Inquiries'
import AdminAnalytics from './pages/Admin/Analytics'
import AdminSubscriptions from './pages/Admin/Subscriptions'
import ProtectedRoute from './components/ui/ProtectedRoute'
import ScrollToTop from './components/ui/ScrollToTop'
import CookieConsent from './components/ui/CookieConsent'
import AIChatbot from './components/ui/AIChatbot'
import NotFound from './pages/NotFound'

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe)

  // Rehydrate the user session on every page load so isAuthenticated
  // and the user object are always up-to-date from the server.
  useEffect(() => {
    if (localStorage.getItem('bp_token')) fetchMe()
  }, [])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/help" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/post-property" element={<PostProperty />} />
        <Route path="/edit-property/:id" element={<PostProperty />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/listings" element={<ProtectedRoute adminOnly><AdminListings /></ProtectedRoute>} />
        <Route path="/admin/inquiries" element={<ProtectedRoute adminOnly><AdminInquiries /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/subscriptions" element={<ProtectedRoute adminOnly><AdminSubscriptions /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <CookieConsent />
      <AIChatbot />
    </BrowserRouter>
  )
}
