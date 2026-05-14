import { apiClient } from '@/lib/api-client-v2'
import type { ApiInformation, ApiUtilisateur } from '@/lib/services/admin.service'
import { adminService } from '@/lib/services/admin.service'

jest.mock('@/lib/api-client-v2', () => ({
  apiClient: {
    get: jest.fn(),
    getPublic: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// ─── Helpers fixtures ──────────────────────────────────────────────────────

const makeApiUser = (overrides: Partial<ApiUtilisateur> = {}): ApiUtilisateur => ({
  id_utilisateur: 'u-1',
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean@example.com',
  role: 'user',
  est_actif: true,
  date_inscription: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

const makeApiInformation = (overrides: Partial<ApiInformation> = {}): ApiInformation => ({
  id_information: 1,
  titre: 'Gérer son stress',
  contenu: "Contenu de l'article",
  type_contenu: 'article',
  slug: 'gerer-son-stress',
  est_actif: true,
  ordre_affichage: 1,
  date_creation: '2025-01-01T00:00:00.000Z',
  date_modification: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

// ─── Tests mappers (via getUsers / getPublicContents) ──────────────────────

describe('AdminService — mapper mapUtilisateur', () => {
  afterEach(() => jest.clearAllMocks())

  it('mappe correctement un ApiUtilisateur en AdminUser', async () => {
    mockApiClient.get.mockResolvedValue([makeApiUser()])

    const { users } = await adminService.getUsers()
    const user = users[0]

    expect(user.id).toBe('u-1')
    expect(user.email).toBe('jean@example.com')
    expect(user.prenom).toBe('Jean')
    expect(user.nom).toBe('Dupont')
    expect(user.role).toBe('USER') // normalisé en majuscule
    expect(user.isActive).toBe(true)
    expect(user.createdAt).toBeInstanceOf(Date)
  })

  it('normalise le rôle admin en ADMIN', async () => {
    mockApiClient.get.mockResolvedValue([makeApiUser({ role: 'admin' })])

    const { users } = await adminService.getUsers()
    expect(users[0].role).toBe('ADMIN')
  })

  it('gère une réponse tableau vide', async () => {
    mockApiClient.get.mockResolvedValue([])

    const { users, total } = await adminService.getUsers()
    expect(users).toHaveLength(0)
    expect(total).toBe(0)
  })

  it('gère une réponse enveloppée dans { utilisateurs: [...] }', async () => {
    mockApiClient.get.mockResolvedValue({ utilisateurs: [makeApiUser()] })

    const { users } = await adminService.getUsers()
    expect(users).toHaveLength(1)
  })

  it('gère une réponse enveloppée dans { data: [...] }', async () => {
    mockApiClient.get.mockResolvedValue({ data: [makeApiUser()] })

    const { users } = await adminService.getUsers()
    expect(users).toHaveLength(1)
  })
})

describe('AdminService — mapper mapInformation', () => {
  afterEach(() => jest.clearAllMocks())

  it('mappe correctement une ApiInformation en AdminContent', async () => {
    mockApiClient.getPublic.mockResolvedValue([makeApiInformation()])

    const contents = await adminService.getPublicContents()
    const c = contents[0]

    expect(c.id).toBe('1')
    expect(c.title).toBe('Gérer son stress')
    expect(c.type).toBe('article')
    expect(c.isActive).toBe(true)
    expect(c.status).toBe('published')
    expect(c.createdAt).toBeInstanceOf(Date)
  })

  it('mappe est_actif=false en status archived', async () => {
    mockApiClient.getPublic.mockResolvedValue([makeApiInformation({ est_actif: false })])

    const contents = await adminService.getPublicContents()
    expect(contents[0].status).toBe('archived')
    expect(contents[0].isActive).toBe(false)
  })
})

// ─── Tests méthodes du service ─────────────────────────────────────────────

describe('AdminService — toggleUserActive', () => {
  afterEach(() => jest.clearAllMocks())

  it('appelle /activate quand isActive est true', async () => {
    mockApiClient.patch.mockResolvedValue(makeApiUser({ est_actif: true }))

    await adminService.toggleUserActive('u-1', true)

    expect(mockApiClient.patch).toHaveBeenCalledWith('/admin/utilisateurs/u-1/activate')
  })

  it('appelle /deactivate quand isActive est false', async () => {
    mockApiClient.patch.mockResolvedValue(makeApiUser({ est_actif: false }))

    await adminService.toggleUserActive('u-1', false)

    expect(mockApiClient.patch).toHaveBeenCalledWith('/admin/utilisateurs/u-1/deactivate')
  })
})

describe('AdminService — changeUserRole', () => {
  afterEach(() => jest.clearAllMocks())

  it('envoie le rôle en minuscules au backend', async () => {
    mockApiClient.patch.mockResolvedValue(makeApiUser({ role: 'admin' }))

    await adminService.changeUserRole('u-1', 'ADMIN')

    expect(mockApiClient.patch).toHaveBeenCalledWith('/admin/utilisateurs/u-1/role', {
      role: 'admin',
    })
  })
})

describe('AdminService — deleteUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('appelle le bon endpoint de suppression', async () => {
    mockApiClient.delete.mockResolvedValue(undefined)

    await adminService.deleteUser('u-99')

    expect(mockApiClient.delete).toHaveBeenCalledWith('/admin/utilisateurs/u-99')
  })
})
