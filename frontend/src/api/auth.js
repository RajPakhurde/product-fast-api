import api from './axios'

// The token is in an httpOnly cookie and cannot be decoded client side, so the
// signed-in user is asked for instead of read out of the JWT.
export async function fetchCurrentUser() {
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch {
    return null // 401 = no valid cookie
  }
}

export async function logout() {
  await api.post('/auth/logout')
}
