import { useUser } from '@/app/hooks/useUser'
import type { User } from '@/types'
import { act, renderHook } from '@testing-library/react'

const makeUser = (): User => ({
  id: 'u-1',
  email: 'jean@example.com',
  prenom: 'Jean',
  nom: 'Dupont',
  role: 'USER',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
})

describe('useUser', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retourne null et isLoading=false quand localStorage est vide', () => {
    const { result } = renderHook(() => useUser())

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('charge le user depuis localStorage', () => {
    const user = makeUser()
    localStorage.setItem('user', JSON.stringify(user))

    const { result } = renderHook(() => useUser())

    expect(result.current.user).toEqual(user)
    expect(result.current.userId).toBe('u-1')
    expect(result.current.isLoading).toBe(false)
  })

  it("expose l'id de l'utilisateur via userId", () => {
    localStorage.setItem('user', JSON.stringify(makeUser()))

    const { result } = renderHook(() => useUser())

    expect(result.current.userId).toBe('u-1')
  })

  it('retourne userId=undefined quand aucun user en localStorage', () => {
    const { result } = renderHook(() => useUser())

    expect(result.current.userId).toBeUndefined()
  })

  it('permet de mettre à jour le user via setUser', () => {
    const { result } = renderHook(() => useUser())

    act(() => {
      result.current.setUser(makeUser())
    })

    expect(result.current.user?.email).toBe('jean@example.com')
  })
})
