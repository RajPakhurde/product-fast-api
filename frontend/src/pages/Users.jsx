import { useEffect, useState } from 'react'
import api from '../api/axios'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchUsers() {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get('/users')
        if (!cancelled) {
          setUsers(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 403) {
            setError('Access denied: You need ADMIN privileges to view users.')
          } else {
            setError(err.message || 'Failed to fetch users.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUsers()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="users-page">
      <div className="users-page__header">
        <h1>Users List</h1>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading users…</p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'ADMIN' ? 'role-badge--admin' : ''}`}>
                      {user.role || 'USER'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !error && (
                <tr>
                  <td colSpan="4" className="users-table__empty">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Users
