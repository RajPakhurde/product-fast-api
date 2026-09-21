import { useState } from 'react'
import api from '../api/axios'

function Login({ onLoggedIn, onShowRegister, notice }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      // The API replies with Set-Cookie (httpOnly) plus the user in the body;
      // there is no token for us to store.
      const { data } = await api.post('/auth/login', { email, password })
      onLoggedIn?.(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>Login</h1>

      {notice && <p className="login__notice">{notice}</p>}

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
          required
        />
      </label>

      {error && <p className="login__error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="login__switch">
        Don&apos;t have an account?{' '}
        <button type="button" className="link" onClick={onShowRegister}>
          Create new account
        </button>
      </p>
    </form>
  )
}

export default Login
