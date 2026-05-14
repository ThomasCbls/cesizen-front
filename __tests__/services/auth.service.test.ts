import { apiClient } from '@/lib/api-client-v2'
import { AuthService } from '@/lib/services/auth.service'
import type { LoginRequest, LoginResponse, User } from '@/types'

// On mocke le client API pour ne pas faire de vraies requêtes HTTP
jest.mock('@/lib/api-client-v2', () => ({
  apiClient: {
    postPublic: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'test@example.com',
  prenom: 'Jean',
  nom: 'Dupont',
  role: 'USER',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('normalizeUser', () => {
    it('met le rôle en majuscules quand il est en minuscules', () => {
      const user = makeUser({ role: 'user' as User['role'] })
      const result = AuthService.normalizeUser(user)
      expect(result.role).toBe('USER')
    })

    it('conserve le rôle ADMIN déjà en majuscules', () => {
      const user = makeUser({ role: 'ADMIN' })
      const result = AuthService.normalizeUser(user)
      expect(result.role).toBe('ADMIN')
    })

    it("ne modifie pas les autres propriétés de l'utilisateur", () => {
      const user = makeUser()
      const result = AuthService.normalizeUser(user)
      expect(result.email).toBe('test@example.com')
      expect(result.prenom).toBe('Jean')
      expect(result.nom).toBe('Dupont')
    })

    it('gère un rôle undefined sans erreur', () => {
      const user = makeUser({ role: undefined })
      const result = AuthService.normalizeUser(user)
      expect(result.role).toBeUndefined()
    })
  })

  describe('login', () => {
    it('appelle apiClient.postPublic avec les bonnes données', async () => {
      const credentials: LoginRequest = { email: 'test@example.com', password: 'secret' }
      const serverResponse: LoginResponse = {
        access_token: 'tok123',
        user: makeUser({ role: 'user' as User['role'] }),
      }
      mockApiClient.postPublic.mockResolvedValue(serverResponse)

      const result = await AuthService.login(credentials)

      expect(mockApiClient.postPublic).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result.user.role).toBe('USER')
      expect(result.access_token).toBe('tok123')
    })

    it("propage l'erreur quand les identifiants sont incorrects", async () => {
      const credentials: LoginRequest = { email: 'test@example.com', password: 'mauvais' }
      mockApiClient.postPublic.mockRejectedValue(new Error('Unauthorized'))

      await expect(AuthService.login(credentials)).rejects.toThrow('Unauthorized')
      expect(mockApiClient.postPublic).toHaveBeenCalledWith('/auth/login', credentials)
    })
  })

  describe('logout', () => {
    it('appelle apiClient.post sur /auth/logout', async () => {
      mockApiClient.post.mockResolvedValue({ success: true })

      const result = await AuthService.logout()

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout')
      expect(result.success).toBe(true)
    })
  })

  describe('getProfile', () => {
    it('retourne un utilisateur avec le rôle normalisé', async () => {
      mockApiClient.get.mockResolvedValue(makeUser({ role: 'admin' as User['role'] }))

      const result = await AuthService.getProfile()

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/profile')
      expect(result.role).toBe('ADMIN')
    })
  })

  describe('verifyToken', () => {
    it("retourne valid:true avec l'utilisateur si le token est valide", async () => {
      const user = makeUser()
      mockApiClient.get.mockResolvedValue(user)

      const result = await AuthService.verifyToken()

      expect(result.valid).toBe(true)
      expect(result.user).toBeDefined()
    })

    it('retourne valid:false si le profil lève une exception', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Unauthorized'))

      const result = await AuthService.verifyToken()

      expect(result.valid).toBe(false)
      expect(result.user).toBeUndefined()
    })
  })
})
