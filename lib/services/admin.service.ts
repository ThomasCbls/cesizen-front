import { apiClient } from '../api-client-v2'

// Types pour les API admin
export interface AdminUser {
  id: string
  email: string
  prenom: string
  nom: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface AdminContent {
  id: string
  title: string
  slug: string
  type: 'page' | 'article' | 'menu'
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
  author: {
    prenom: string
    nom: string
  }
  excerpt?: string
  content: string
  order?: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface AdminQuestionnaire {
  id: string
  title: string
  description: string
  category: 'STRESS' | 'ANXIETY' | 'BURNOUT'
  isActive: boolean
  questions: AdminQuestion[]
  createdAt: Date
  updatedAt: Date
  stats?: {
    totalResponses: number
    avgScore: number
    lastResponseAt?: Date
  }
}

export interface AdminQuestion {
  id: string
  text: string
  order: number
  options: AdminQuestionOption[]
}

export interface AdminQuestionOption {
  id: string
  text: string
  score: number
}

export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  totalDiagnostics: number
  totalContent: number
  newUsersThisWeek: number
  diagnosticsThisWeek: number
}

export interface AdminActivity {
  id: string
  type: 'user_registration' | 'diagnostic_completed' | 'content_created' | 'questionnaire_updated'
  description: string
  timestamp: Date
  user?: {
    prenom: string
    nom: string
  }
}

// Service Admin
class AdminService {
  // === DASHBOARD ===
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return apiClient.get<AdminDashboardStats>('/admin/dashboard/stats')
  }

  async getRecentActivity(limit = 10): Promise<AdminActivity[]> {
    return apiClient.get<AdminActivity[]>(`/admin/dashboard/activity?limit=${limit}`)
  }

  // === GESTION UTILISATEURS ===
  async getUsers(params?: {
    search?: string
    role?: 'all' | 'USER' | 'ADMIN'
    status?: 'all' | 'active' | 'inactive'
    page?: number
    limit?: number
  }): Promise<{ users: AdminUser[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.set('search', params.search)
    if (params?.role && params.role !== 'all') queryParams.set('role', params.role)
    if (params?.status && params.status !== 'all') queryParams.set('status', params.status)
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())

    return apiClient.get<{ users: AdminUser[]; total: number }>(`/admin/users?${queryParams}`)
  }

  async createUser(userData: Partial<AdminUser> & { password: string }): Promise<AdminUser> {
    return apiClient.post<AdminUser>('/admin/users', userData)
  }

  async updateUser(userId: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    return apiClient.put<AdminUser>(`/admin/users/${userId}`, userData)
  }

  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete(`/admin/users/${userId}`)
  }

  async toggleUserActive(userId: string, isActive: boolean): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`/admin/users/${userId}/status`, { isActive })
  }

  async changeUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`/admin/users/${userId}/role`, { role })
  }

  async bulkUpdateUsers(
    userIds: string[],
    action: 'activate' | 'deactivate' | 'delete',
  ): Promise<void> {
    return apiClient.post('/admin/users/bulk', { userIds, action })
  }

  // === GESTION CONTENUS ===
  async getContents(params?: {
    search?: string
    type?: 'all' | 'page' | 'article' | 'menu'
    status?: 'all' | 'draft' | 'published' | 'archived'
    active?: 'all' | 'active' | 'inactive'
    page?: number
    limit?: number
  }): Promise<{ contents: AdminContent[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.set('search', params.search)
    if (params?.type && params.type !== 'all') queryParams.set('type', params.type)
    if (params?.status && params.status !== 'all') queryParams.set('status', params.status)
    if (params?.active && params.active !== 'all') queryParams.set('active', params.active)
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())

    return apiClient.get<{ contents: AdminContent[]; total: number }>(
      `/admin/contents?${queryParams}`,
    )
  }

  async createContent(contentData: Partial<AdminContent>): Promise<AdminContent> {
    return apiClient.post<AdminContent>('/admin/contents', contentData)
  }

  async updateContent(
    contentId: string,
    contentData: Partial<AdminContent>,
  ): Promise<AdminContent> {
    return apiClient.put<AdminContent>(`/admin/contents/${contentId}`, contentData)
  }

  async deleteContent(contentId: string): Promise<void> {
    return apiClient.delete(`/admin/contents/${contentId}`)
  }

  async duplicateContent(contentId: string): Promise<AdminContent> {
    return apiClient.post<AdminContent>(`/admin/contents/${contentId}/duplicate`)
  }

  async toggleContentActive(contentId: string, isActive: boolean): Promise<AdminContent> {
    return apiClient.patch<AdminContent>(`/admin/contents/${contentId}/status`, { isActive })
  }

  async reorderContent(contentId: string, newOrder: number): Promise<void> {
    return apiClient.patch(`/admin/contents/${contentId}/order`, { order: newOrder })
  }

  async bulkUpdateContents(
    contentIds: string[],
    action: 'publish' | 'draft' | 'activate' | 'deactivate' | 'delete',
  ): Promise<void> {
    return apiClient.post('/admin/contents/bulk', { contentIds, action })
  }

  // === GESTION QUESTIONNAIRES ===
  async getQuestionnaires(): Promise<AdminQuestionnaire[]> {
    return apiClient.get<AdminQuestionnaire[]>('/admin/questionnaires')
  }

  async createQuestionnaire(
    questionnaireData: Partial<AdminQuestionnaire>,
  ): Promise<AdminQuestionnaire> {
    return apiClient.post<AdminQuestionnaire>('/admin/questionnaires', questionnaireData)
  }

  async updateQuestionnaire(
    questionnaireId: string,
    questionnaireData: Partial<AdminQuestionnaire>,
  ): Promise<AdminQuestionnaire> {
    return apiClient.put<AdminQuestionnaire>(
      `/admin/questionnaires/${questionnaireId}`,
      questionnaireData,
    )
  }

  async deleteQuestionnaire(questionnaireId: string): Promise<void> {
    return apiClient.delete(`/admin/questionnaires/${questionnaireId}`)
  }

  async duplicateQuestionnaire(questionnaireId: string): Promise<AdminQuestionnaire> {
    return apiClient.post<AdminQuestionnaire>(`/admin/questionnaires/${questionnaireId}/duplicate`)
  }

  async toggleQuestionnaireActive(
    questionnaireId: string,
    isActive: boolean,
  ): Promise<AdminQuestionnaire> {
    return apiClient.patch<AdminQuestionnaire>(`/admin/questionnaires/${questionnaireId}/status`, {
      isActive,
    })
  }

  async getQuestionnaireStats(questionnaireId: string): Promise<{
    totalResponses: number
    avgScore: number
    scoreDistribution: { range: string; count: number }[]
    responsesOverTime: { date: string; count: number }[]
  }> {
    return apiClient.get(`/admin/questionnaires/${questionnaireId}/stats`)
  }

  // === UTILITAIRES ===
  async checkSlugAvailability(
    slug: string,
    type: 'content',
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    const params = new URLSearchParams({ slug, type })
    if (excludeId) params.set('excludeId', excludeId)
    return apiClient.get<{ available: boolean }>(`/admin/check-slug?${params}`)
  }

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.post<{ url: string; filename: string }>('/admin/upload/image', formData)
  }

  // === LOGS ET SURVEILLANCE ===
  async getSystemLogs(params?: {
    level?: 'info' | 'warn' | 'error'
    from?: Date
    to?: Date
    limit?: number
  }): Promise<
    {
      id: string
      timestamp: Date
      level: string
      message: string
      context?: Record<string, unknown>
    }[]
  > {
    const queryParams = new URLSearchParams()
    if (params?.level) queryParams.set('level', params.level)
    if (params?.from) queryParams.set('from', params.from.toISOString())
    if (params?.to) queryParams.set('to', params.to.toISOString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())

    return apiClient.get(`/admin/logs?${queryParams}`)
  }

  async exportData(
    type: 'users' | 'contents' | 'questionnaires' | 'responses',
    format: 'csv' | 'json' = 'csv',
  ): Promise<Blob> {
    return apiClient.get(`/admin/export/${type}?format=${format}`, {
      responseType: 'blob',
    })
  }
}

// Instance exportée du service
export const adminService = new AdminService()
