import { useEffect, useState } from 'react'
import api from '../api/axios'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingUser, setUpdatingUser] = useState(null) // { id: number, field: 'role' | 'google' }

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
            setError(err.response?.data?.detail || err.message || 'Failed to fetch users.')
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

  async function handleRoleChange(userId, newRole) {
    setError('')
    setUpdatingUser({ id: userId, field: 'role' })

    try {
      const { data } = await api.put('/users/role', {
        user_id: userId,
        role: newRole,
      })

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: data.role } : u))
      )
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user role.')
    } finally {
      setUpdatingUser(null)
    }
  }

  async function handleGoogleAuthChange(userId, isEnabled) {
    setError('')
    setUpdatingUser({ id: userId, field: 'google' })

    try {
      const { data } = await api.put('/users/google', {
        user_id: userId,
        google_auth_enabled: isEnabled,
      })

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, google_auth_enabled: data.google_auth_enabled }
            : u
        )
      )
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update Google Auth status.')
    } finally {
      setUpdatingUser(null)
    }
  }

  return (
    <section className="users-page">
      <div className="users-page__header">
        <h1>Users Management</h1>
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
                <th>Google Auth Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isUpdatingRole =
                  updatingUser?.id === user.id && updatingUser?.field === 'role'
                const isUpdatingGoogle =
                  updatingUser?.id === user.id && updatingUser?.field === 'google'

                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className={`users-select users-select--role ${
                          user.role === 'ADMIN' ? 'users-select--admin' : ''
                        }`}
                        value={user.role || 'USER'}
                        disabled={isUpdatingRole}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={`users-select users-select--status ${
                          user.google_auth_enabled ? 'users-select--enabled' : 'users-select--disabled'
                        }`}
                        value={user.google_auth_enabled ? 'true' : 'false'}
                        disabled={isUpdatingGoogle}
                        onChange={(e) =>
                          handleGoogleAuthChange(user.id, e.target.value === 'true')
                        }
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && !error && (
                <tr>
                  <td colSpan="5" className="users-table__empty">
                    No users found.
                  </td>
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
