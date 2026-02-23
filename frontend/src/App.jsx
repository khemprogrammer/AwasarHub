import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import JobPost from './pages/JobPost'
import UserProfile from './pages/UserProfile'
import PublicProfile from './pages/PublicProfile'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-4">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/feed" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          } />
          <Route path="/jobs/new" element={
            <PrivateRoute>
              <JobPost />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
          <Route path="/profile/:username" element={
            <PrivateRoute>
              <PublicProfile />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
