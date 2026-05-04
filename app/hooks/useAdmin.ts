import { useState, useCallback } from 'react'
import {
  adminService,
  AdminUser,
  AdminContent,
  AdminQuestionnaire,
  AdminDashboardStats,
  AdminActivity,
} from '@/lib/services/admin.service'

// Hook générique pour les opérations async
export function useAsync<T>(asyncFunction: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}

// === HOOKS DASHBOARD ===
export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsData, activitiesData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(10),
      ])

      setStats(statsData)
      setActivities(activitiesData)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors du chargement du dashboard'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, activities, loading, error, loadDashboard }
}

// === HOOKS UTILISATEURS ===
export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async (params?: Parameters<typeof adminService.getUsers>[0]) => {
    try {
      setLoading(true)
      setError(null)
      const result = await adminService.getUsers(params)
      setUsers(result.users)
      setTotal(result.total)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = useCallback(
    async (userData: Parameters<typeof adminService.createUser>[0]) => {
      const newUser = await adminService.createUser(userData)
      setUsers((prev) => [...prev, newUser])
      return newUser
    },
    [],
  )

  const updateUser = useCallback(async (userId: string, userData: Partial<AdminUser>) => {
    const updatedUser = await adminService.updateUser(userId, userData)
    setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)))
    return updatedUser
  }, [])

  const deleteUser = useCallback(async (userId: string) => {
    await adminService.deleteUser(userId)
    setUsers((prev) => prev.filter((user) => user.id !== userId))
  }, [])

  const toggleUserActive = useCallback(async (userId: string, isActive: boolean) => {
    const updatedUser = await adminService.toggleUserActive(userId, isActive)
    setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)))
    return updatedUser
  }, [])

  const changeUserRole = useCallback(async (userId: string, role: 'USER' | 'ADMIN') => {
    const updatedUser = await adminService.changeUserRole(userId, role)
    setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)))
    return updatedUser
  }, [])

  const bulkUpdateUsers = useCallback(
    async (userIds: string[], action: 'activate' | 'deactivate' | 'delete') => {
      await adminService.bulkUpdateUsers(userIds, action)

      if (action === 'delete') {
        setUsers((prev) => prev.filter((user) => !userIds.includes(user.id)))
      } else {
        const isActive = action === 'activate'
        setUsers((prev) =>
          prev.map((user) => (userIds.includes(user.id) ? { ...user, isActive } : user)),
        )
      }
    },
    [],
  )

  return {
    users,
    total,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    changeUserRole,
    bulkUpdateUsers,
  }
}

// === HOOKS CONTENUS ===
export function useAdminContents() {
  const [contents, setContents] = useState<AdminContent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadContents = useCallback(
    async (params?: Parameters<typeof adminService.getContents>[0]) => {
      try {
        setLoading(true)
        setError(null)
        const result = await adminService.getContents(params)
        setContents(result.contents)
        setTotal(result.total)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors du chargement des contenus'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const createContent = useCallback(async (contentData: Partial<AdminContent>) => {
    const newContent = await adminService.createContent(contentData)
    setContents((prev) => [...prev, newContent])
    return newContent
  }, [])

  const updateContent = useCallback(
    async (contentId: string, contentData: Partial<AdminContent>) => {
      const updatedContent = await adminService.updateContent(contentId, contentData)
      setContents((prev) =>
        prev.map((content) => (content.id === contentId ? updatedContent : content)),
      )
      return updatedContent
    },
    [],
  )

  const deleteContent = useCallback(async (contentId: string) => {
    await adminService.deleteContent(contentId)
    setContents((prev) => prev.filter((content) => content.id !== contentId))
  }, [])

  const duplicateContent = useCallback(async (contentId: string) => {
    const duplicatedContent = await adminService.duplicateContent(contentId)
    setContents((prev) => [...prev, duplicatedContent])
    return duplicatedContent
  }, [])

  const toggleContentActive = useCallback(async (contentId: string, isActive: boolean) => {
    const updatedContent = await adminService.toggleContentActive(contentId, isActive)
    setContents((prev) =>
      prev.map((content) => (content.id === contentId ? updatedContent : content)),
    )
    return updatedContent
  }, [])

  const reorderContent = useCallback(async (contentId: string, newOrder: number) => {
    await adminService.reorderContent(contentId, newOrder)
    setContents((prev) =>
      prev.map((content) => (content.id === contentId ? { ...content, order: newOrder } : content)),
    )
  }, [])

  const bulkUpdateContents = useCallback(
    async (
      contentIds: string[],
      action: 'publish' | 'draft' | 'activate' | 'deactivate' | 'delete',
    ) => {
      await adminService.bulkUpdateContents(contentIds, action)

      if (action === 'delete') {
        setContents((prev) => prev.filter((content) => !contentIds.includes(content.id)))
      } else {
        setContents((prev) =>
          prev.map((content) => {
            if (!contentIds.includes(content.id)) return content

            switch (action) {
              case 'publish':
                return { ...content, status: 'published' as const, publishedAt: new Date() }
              case 'draft':
                return { ...content, status: 'draft' as const }
              case 'activate':
                return { ...content, isActive: true }
              case 'deactivate':
                return { ...content, isActive: false }
              default:
                return content
            }
          }),
        )
      }
    },
    [],
  )

  return {
    contents,
    total,
    loading,
    error,
    loadContents,
    createContent,
    updateContent,
    deleteContent,
    duplicateContent,
    toggleContentActive,
    reorderContent,
    bulkUpdateContents,
  }
}

// === HOOKS QUESTIONNAIRES ===
export function useAdminQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState<AdminQuestionnaire[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadQuestionnaires = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await adminService.getQuestionnaires()
      setQuestionnaires(result)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors du chargement des questionnaires'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createQuestionnaire = useCallback(
    async (questionnaireData: Partial<AdminQuestionnaire>) => {
      const newQuestionnaire = await adminService.createQuestionnaire(questionnaireData)
      setQuestionnaires((prev) => [...prev, newQuestionnaire])
      return newQuestionnaire
    },
    [],
  )

  const updateQuestionnaire = useCallback(
    async (questionnaireId: string, questionnaireData: Partial<AdminQuestionnaire>) => {
      const updatedQuestionnaire = await adminService.updateQuestionnaire(
        questionnaireId,
        questionnaireData,
      )
      setQuestionnaires((prev) =>
        prev.map((q) => (q.id === questionnaireId ? updatedQuestionnaire : q)),
      )
      return updatedQuestionnaire
    },
    [],
  )

  const deleteQuestionnaire = useCallback(async (questionnaireId: string) => {
    await adminService.deleteQuestionnaire(questionnaireId)
    setQuestionnaires((prev) => prev.filter((q) => q.id !== questionnaireId))
  }, [])

  const duplicateQuestionnaire = useCallback(async (questionnaireId: string) => {
    const duplicatedQuestionnaire = await adminService.duplicateQuestionnaire(questionnaireId)
    setQuestionnaires((prev) => [...prev, duplicatedQuestionnaire])
    return duplicatedQuestionnaire
  }, [])

  const toggleQuestionnaireActive = useCallback(
    async (questionnaireId: string, isActive: boolean) => {
      const updatedQuestionnaire = await adminService.toggleQuestionnaireActive(
        questionnaireId,
        isActive,
      )
      setQuestionnaires((prev) =>
        prev.map((q) => (q.id === questionnaireId ? updatedQuestionnaire : q)),
      )
      return updatedQuestionnaire
    },
    [],
  )

  return {
    questionnaires,
    loading,
    error,
    loadQuestionnaires,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    duplicateQuestionnaire,
    toggleQuestionnaireActive,
  }
}

// === HOOKS UTILITAIRES ===
export function useAdminOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkSlugAvailability = useCallback(
    async (slug: string, type: 'content', excludeId?: string) => {
      try {
        setLoading(true)
        setError(null)
        const result = await adminService.checkSlugAvailability(slug, type, excludeId)
        return result.available
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors de la vérification du slug'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true)
      setError(null)
      const result = await adminService.uploadImage(file)
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du téléchargement de l'image"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const exportData = useCallback(
    async (
      type: 'users' | 'contents' | 'questionnaires' | 'responses',
      format: 'csv' | 'json' = 'csv',
    ) => {
      try {
        setLoading(true)
        setError(null)
        const blob = await adminService.exportData(type, format)

        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `cesizen_${type}_${new Date().toISOString().split('T')[0]}.${format}`
        link.click()
        URL.revokeObjectURL(url)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de l'export des données"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    loading,
    error,
    checkSlugAvailability,
    uploadImage,
    exportData,
  }
}
