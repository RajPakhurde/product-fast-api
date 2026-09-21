import { useState } from 'react'
import api from '../api/axios'

function Register({ onRegistered, onShowLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      // /auth/register returns the new user, not a token — the caller sends
      // us back to the login form to sign in.
      await api.post('/auth/register', { username, email, password })
      onRegistered?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>Create account</h1>

      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>

      {error && <p className="login__error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="login__switch">
        Already have an account?{' '}
        <button type="button" className="link" onClick={onShowLogin}>
          Sign in
        </button>
      </p>
    </form>
  )
}

export default Register
