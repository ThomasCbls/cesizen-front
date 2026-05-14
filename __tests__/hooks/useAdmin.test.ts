import {
  useAdminContents,
  useAdminDashboard,
  useAdminQuestionnaires,
  useAdminUsers,
} from '@/app/hooks/useAdmin'
import { act, renderHook } from '@testing-library/react'

// Mock complet de adminService
jest.mock('@/lib/services/admin.service', () => ({
  adminService: {
    getDashboardStats: jest.fn(),
    getRecentActivity: jest.fn(),
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    toggleUserActive: jest.fn(),
    changeUserRole: jest.fn(),
    bulkUpdateUsers: jest.fn(),
    getContents: jest.fn(),
    createContent: jest.fn(),
    updateContent: jest.fn(),
    deleteContent: jest.fn(),
    duplicateContent: jest.fn(),
    toggleContentActive: jest.fn(),
    reorderContent: jest.fn(),
    bulkUpdateContents: jest.fn(),
    getQuestionnaires: jest.fn(),
    createQuestionnaire: jest.fn(),
    updateQuestionnaire: jest.fn(),
    deleteQuestionnaire: jest.fn(),
    duplicateQuestionnaire: jest.fn(),
    toggleQuestionnaireActive: jest.fn(),
  },
}))

// Import après le mock pour avoir accès aux fonctions mockées
import { adminService } from '@/lib/services/admin.service'
const mockAdminService = adminService as jest.Mocked<typeof adminService>

describe('useAdminDashboard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('démarre avec loading=false, stats=null, activities=[]', () => {
    const { result } = renderHook(() => useAdminDashboard())
    expect(result.current.loading).toBe(false)
    expect(result.current.stats).toBeNull()
    expect(result.current.activities).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('charge les stats et les activités via loadDashboard', async () => {
    const mockStats = {
      totalUsers: 50,
      activeUsers: 45,
      totalContents: 20,
      publishedContents: 15,
      totalQuestionnaires: 5,
      activeQuestionnaires: 4,
      totalDiagnostics: 100,
    }
    const mockActivities = [
      { id: 'a-1', type: 'user_created', description: 'Nouvel utilisateur', timestamp: new Date() },
    ]

    mockAdminService.getDashboardStats.mockResolvedValue(mockStats)
    mockAdminService.getRecentActivity.mockResolvedValue(mockActivities)

    const { result } = renderHook(() => useAdminDashboard())

    await act(async () => {
      await result.current.loadDashboard()
    })

    expect(result.current.stats).toEqual(mockStats)
    expect(result.current.activities).toEqual(mockActivities)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('positionne error quand loadDashboard échoue', async () => {
    mockAdminService.getDashboardStats.mockRejectedValue(new Error('Erreur réseau'))
    mockAdminService.getRecentActivity.mockResolvedValue([])
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useAdminDashboard())

    await act(async () => {
      await result.current.loadDashboard()
    })

    expect(result.current.error).toBe('Erreur réseau')
    expect(result.current.loading).toBe(false)
    jest.restoreAllMocks()
  })
})

describe('useAdminUsers', () => {
  beforeEach(() => jest.clearAllMocks())

  const mockUser = {
    id: 'u-1',
    email: 'jean@example.com',
    prenom: 'Jean',
    nom: 'Dupont',
    role: 'USER' as const,
    isActive: true,
    createdAt: new Date(),
  }

  it('démarre avec users=[], total=0, loading=false', () => {
    const { result } = renderHook(() => useAdminUsers())
    expect(result.current.users).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.loading).toBe(false)
  })

  it('charge les utilisateurs via loadUsers', async () => {
    mockAdminService.getUsers.mockResolvedValue({ users: [mockUser], total: 1 })

    const { result } = renderHook(() => useAdminUsers())

    await act(async () => {
      await result.current.loadUsers()
    })

    expect(result.current.users).toEqual([mockUser])
    expect(result.current.total).toBe(1)
    expect(result.current.loading).toBe(false)
  })

  it('ajoute un utilisateur via createUser', async () => {
    const newUser = { ...mockUser, id: 'u-2', email: 'alice@example.com' }
    mockAdminService.createUser.mockResolvedValue(newUser)
    mockAdminService.getUsers.mockResolvedValue({ users: [mockUser], total: 1 })

    const { result } = renderHook(() => useAdminUsers())

    // Charger d'abord les utilisateurs
    await act(async () => {
      await result.current.loadUsers()
    })

    await act(async () => {
      await result.current.createUser({
        email: 'alice@example.com',
        prenom: 'Alice',
        nom: 'Martin',
        role: 'USER',
        isActive: true,
      })
    })

    expect(result.current.users).toContainEqual(newUser)
  })

  it('supprime un utilisateur via deleteUser', async () => {
    mockAdminService.getUsers.mockResolvedValue({ users: [mockUser], total: 1 })
    mockAdminService.deleteUser.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAdminUsers())

    await act(async () => {
      await result.current.loadUsers()
    })

    await act(async () => {
      await result.current.deleteUser('u-1')
    })

    expect(result.current.users).toEqual([])
  })

  it('positionne error quand loadUsers échoue', async () => {
    mockAdminService.getUsers.mockRejectedValue(new Error('Accès refusé'))

    const { result } = renderHook(() => useAdminUsers())

    await act(async () => {
      await result.current.loadUsers()
    })

    expect(result.current.error).toBe('Accès refusé')
  })
})

describe('useAdminContents', () => {
  beforeEach(() => jest.clearAllMocks())

  const mockContent = {
    id: 'c-1',
    title: 'Mon article',
    slug: 'mon-article',
    type: 'article' as const,
    status: 'published' as const,
    isActive: true,
    content: 'Contenu',
  }

  it('démarre avec contents=[], total=0, loading=false', () => {
    const { result } = renderHook(() => useAdminContents())
    expect(result.current.contents).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.loading).toBe(false)
  })

  it('charge les contenus via loadContents', async () => {
    mockAdminService.getContents.mockResolvedValue({ contents: [mockContent], total: 1 })

    const { result } = renderHook(() => useAdminContents())

    await act(async () => {
      await result.current.loadContents()
    })

    expect(result.current.contents).toEqual([mockContent])
    expect(result.current.total).toBe(1)
  })

  it('supprime un contenu via deleteContent', async () => {
    mockAdminService.getContents.mockResolvedValue({ contents: [mockContent], total: 1 })
    mockAdminService.deleteContent.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAdminContents())

    await act(async () => {
      await result.current.loadContents()
    })

    await act(async () => {
      await result.current.deleteContent('c-1')
    })

    expect(result.current.contents).toEqual([])
  })

  it('positionne error quand loadContents échoue', async () => {
    mockAdminService.getContents.mockRejectedValue(new Error('Erreur serveur'))

    const { result } = renderHook(() => useAdminContents())

    await act(async () => {
      await result.current.loadContents()
    })

    expect(result.current.error).toBe('Erreur serveur')
  })
})

describe('useAdminQuestionnaires', () => {
  beforeEach(() => jest.clearAllMocks())

  const mockQuestionnaire = {
    id: 'q-1',
    title: 'Questionnaire stress',
    description: 'Description',
    category: 'STRESS' as const,
    isActive: true,
    questions: [],
  }

  it('démarre avec questionnaires=[], loading=false', () => {
    const { result } = renderHook(() => useAdminQuestionnaires())
    expect(result.current.questionnaires).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('charge les questionnaires via loadQuestionnaires', async () => {
    mockAdminService.getQuestionnaires.mockResolvedValue([mockQuestionnaire])

    const { result } = renderHook(() => useAdminQuestionnaires())

    await act(async () => {
      await result.current.loadQuestionnaires()
    })

    expect(result.current.questionnaires).toEqual([mockQuestionnaire])
    expect(result.current.loading).toBe(false)
  })

  it('supprime un questionnaire via deleteQuestionnaire', async () => {
    mockAdminService.getQuestionnaires.mockResolvedValue([mockQuestionnaire])
    mockAdminService.deleteQuestionnaire.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAdminQuestionnaires())

    await act(async () => {
      await result.current.loadQuestionnaires()
    })

    await act(async () => {
      await result.current.deleteQuestionnaire('q-1')
    })

    expect(result.current.questionnaires).toEqual([])
  })

  it('positionne error quand loadQuestionnaires échoue', async () => {
    mockAdminService.getQuestionnaires.mockRejectedValue(new Error('Erreur chargement'))

    const { result } = renderHook(() => useAdminQuestionnaires())

    await act(async () => {
      await result.current.loadQuestionnaires()
    })

    expect(result.current.error).toBe('Erreur chargement')
  })
})
