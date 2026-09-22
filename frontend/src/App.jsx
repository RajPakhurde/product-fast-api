import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Users from './pages/Users'
import { fetchCurrentUser, logout } from './api/auth'
import './App.css'

function App() {
  // Swap this for react-router once more than three screens exist.
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showRegister, setShowRegister] = useState(false)
  const [notice, setNotice] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'my' | 'users'

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
        <div className="app-header__brand">ProductHub</div>

        <nav className="app-header__nav">
          <button
            type="button"
            className={`app-header__link ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Products
          </button>
          <button
            type="button"
            className={`app-header__link ${activeTab === 'my' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Products
          </button>
          {user?.role === 'ADMIN' && (
            <button
              type="button"
              className={`app-header__link ${activeTab === 'users' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          )}
        </nav>

        <div className="app-header__user-info">
          <span className="app-header__user">{user.username}</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'users' && user?.role === 'ADMIN' ? (
          <Users />
        ) : (
          <Products currentUser={user} filter={activeTab} />
        )}
      </main>
    </>
  )
}

export default App
