import Navbar from './components/Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import MyEvents from './pages/MyEvents'
import MyRSVPs from './pages/MyRSVPs'
import Venues from './pages/Venues'
import CreateVenue from './pages/CreateVenue'
import EditVenue from './pages/EditVenue'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/venues" element={<Venues />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/create-event" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/edit-event/:id" element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            } />
            <Route path="/my-events" element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            } />
            <Route path="/my-rsvps" element={
              <ProtectedRoute>
                <MyRSVPs />
              </ProtectedRoute>
            } />
            <Route path="/create-venue" element={
              <ProtectedRoute>
                <CreateVenue />
              </ProtectedRoute>
            } />
            <Route path="/edit-venue/:id" element={
              <ProtectedRoute>
                <EditVenue />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}