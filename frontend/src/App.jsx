import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import { fetchCurrentUser, logout } from './api/auth'
import './App.css'

function App() {
  // Swap this for react-router once more than three screens exist.
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showRegister, setShowRegister] = useState(false)
  const [notice, setNotice] = useState('')

  // The session lives in an httpOnly cookie we cannot read, so ask the API
  // whether that cookie is still valid.
  useEffect(() => {
    let cancelled = false

    fetchCurrentUser().then((currentUser) => {
      if (cancelled) return
      setUser(currentUser)
      setCheckingSession(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    await logout()
    setUser(null)
  }

  function handleRegistered() {
    setShowRegister(false)
    setNotice('Account created — please sign in.')
  }

  if (checkingSession) return <p className="app-loading">Loading…</p>

  if (!user) {
    return showRegister ? (
      <Register
        onRegistered={handleRegistered}
        onShowLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLoggedIn={setUser}
        onShowRegister={() => {
          setNotice('')
          setShowRegister(true)
        }}
        notice={notice}
      />
    )
  }

  return (
    <>
      <header className="app-header">
        <span className="app-header__user">{user.username}</span>
        <button onClick={handleLogout}>Log out</button>
      </header>
      <Products currentUser={user} />
    </>
  )
}

export default App
