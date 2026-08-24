import { apiClient } from '@/lib/api-client'
import { loginResponseSchema, userResponseSchema, type LoginInput } from './schemas'

/** Names the Sanctum token so users can tell sessions apart when revoking them. */
const DEVICE_NAME = 'ZCMC MSWD Web'

export const authApi = {
  async login(input: LoginInput) {
    const { data } = await apiClient.post('/login', { ...input, device_name: DEVICE_NAME })
    return loginResponseSchema.parse(data)
  },

  async me() {
    const { data } = await apiClient.get('/me')
    return userResponseSchema.parse(data)
  },

  async logout() {
    await apiClient.post('/logout')
  },
}
