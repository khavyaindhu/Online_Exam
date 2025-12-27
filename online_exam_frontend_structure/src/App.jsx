import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import DataManager from './components/DataManager'
import defaultUsers from './data/users.json'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const storedUsers = localStorage.getItem('examUsers')
    if (!storedUsers) {
      localStorage.setItem('examUsers', JSON.stringify(defaultUsers))
    }

    const loggedUser = localStorage.getItem('currentUser')
    if (loggedUser) {
      setCurrentUser(JSON.parse(loggedUser))
    }
  }, [])

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  const handleSwitchToRegister = () => {
    setShowRegister(true)
  }

  const handleBackToLogin = () => {
    setShowRegister(false)
  }

  // Show Register Page
  if (showRegister && !currentUser) {
    return (
      <>
        <Register 
          onRegisterSuccess={handleBackToLogin} 
          onBackToLogin={handleBackToLogin}
        />
        <DataManager />
      </>
    )
  }

  // Show Login Page
  if (!currentUser) {
    return (
      <>
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
        <DataManager />
      </>
    )
  }

  // Show Role-Based Dashboard
  if (currentUser.role === 'admin') {
    return (
      <>
        <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
        <DataManager />
      </>
    )
  }

  if (currentUser.role === 'teacher') {
    return (
      <>
        <TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />
        <DataManager />
      </>
    )
  }

  if (currentUser.role === 'student') {
    return (
      <>
        <StudentDashboard currentUser={currentUser} onLogout={handleLogout} />
        <DataManager />
      </>
    )
  }

  // Fallback
  return (
    <div style={{ 
      padding: '50px',
      textAlign: 'center',
      minHeight: '100vh',
      background: '#1a202c',
      color: 'white'
    }}>
      <h2>Invalid Role</h2>
      <button onClick={handleLogout} style={{
        padding: '10px 20px',
        marginTop: '20px',
        cursor: 'pointer'
      }}>
        Logout
      </button>
    </div>
  )
}