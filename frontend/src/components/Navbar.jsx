import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <header className="app-header">
      <div className="app-header__brand">ProductHub</div>

      <nav className="app-header__nav">
        <NavLink
          to="/products"
          className={({ isActive }) => `app-header__link ${isActive ? 'is-active' : ''}`}
        >
          All Products
        </NavLink>

        <NavLink
          to="/my-products"
          className={({ isActive }) => `app-header__link ${isActive ? 'is-active' : ''}`}
        >
          My Products
        </NavLink>

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/users"
            className={({ isActive }) => `app-header__link ${isActive ? 'is-active' : ''}`}
          >
            Users
          </NavLink>
        )}
      </nav>

      <div className="app-header__user-info">
        <span className="app-header__user">{user.username}</span>
        <button type="button" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  )
}
