import { useLogout } from '@/app/hooks/useLogout'
import { act, renderHook } from '@testing-library/react'

// Mock de next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock de apiCall et endpoints
const API_URL = 'http://localhost:3000'

jest.mock('@/app/utils/endpoint', () => ({
  apiCall: jest.fn().mockResolvedValue({}),
  endpoints: {
    auth: {
      logout: `${API_URL}/auth/logout`,
    },
  },
}))

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('access_token', 'tok123')
    localStorage.setItem('user', JSON.stringify({ id: 'u-1' }))
  })

  it('supprime access_token du localStorage après logout', async () => {
    const { result } = renderHook(() => useLogout())

    await act(async () => {
      await result.current.logout()
    })

    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('supprime user du localStorage après logout', async () => {
    const { result } = renderHook(() => useLogout())

    await act(async () => {
      await result.current.logout()
    })

    expect(localStorage.getItem('user')).toBeNull()
  })

  it('redirige vers "/" après logout (jsdom normalise en http://localhost/)', async () => {
    const { result } = renderHook(() => useLogout())

    await act(async () => {
      await result.current.logout()
    })

    // jsdom intercepte window.location.href = '/' et le normalise en 'http://localhost/'
    expect(window.location.href).toBe('http://localhost/')
  })

  it('nettoie le localStorage même si la requête API échoue', async () => {
    const { apiCall } = await import('@/app/utils/endpoint')
    ;(apiCall as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useLogout())

    await act(async () => {
      await result.current.logout()
    })

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    jest.restoreAllMocks()
  })
})
