import api from './client'
import type { AuthResponse } from '../types'

export function login(data: { email: string; password: string }) {
  return api.post<AuthResponse>('/auth/login', data).then((r) => r.data)
}
