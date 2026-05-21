import { apiClient } from '../api-client-v2'

// ============================================================
// TYPES BRUTS DE L'API (snake_case, nommage backend)
// ============================================================

export interface ApiUtilisateur {
  id_utilisateur: string
  nom: string
  prenom: string
  email: string
  role: 'user' | 'admin'
  est_actif: boolean
  date_inscription: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  admins: number
  users: number
  recentRegistrations: number
}

export interface ApiInformation {
  id_information: number
  titre: string
  contenu: string
  type_contenu: string
  slug?: string
  est_actif: boolean
  ordre_affichage: number
  date_creation: string
  date_modification: string
}

// ============================================================
// TYPES UI (mappés depuis les types bruts, utilisés par les composants)
// ============================================================

export interface AdminUser {
  id: string
  email: string
  prenom: string
  nom: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: Date
}

export interface AdminContent {
  id: string
  title: string
  slug: string
  type: 'page' | 'article' | 'menu'
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
  author?: { prenom: string; nom: string }
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
  createur_id?: string
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
  [key: string]: unknown
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

// ============================================================
// MAPPERS API → UI
// ============================================================

function mapUtilisateur(api: ApiUtilisateur): AdminUser {
  return {
    id: api.id_utilisateur,
    email: api.email,
    prenom: api.prenom,
    nom: api.nom,
    role: api.role.toUpperCase() as 'USER' | 'ADMIN',
    isActive: api.est_actif,
    createdAt: new Date(api.date_inscription),
  }
}

function mapInformation(api: ApiInformation): AdminContent {
  return {
    id: String(api.id_information),
    title: api.titre,
    slug: api.slug ?? '',
    type: api.type_contenu as 'page' | 'article' | 'menu',
    status: api.est_actif ? 'published' : 'archived',
    isActive: api.est_actif,
    content: api.contenu,
    order: api.ordre_affichage,
    createdAt: api.date_creation ? new Date(api.date_creation) : new Date(),
    updatedAt: api.date_modification ? new Date(api.date_modification) : new Date(),
  }
}

// Service Admin
class AdminService {
  // === DASHBOARD ===
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return apiClient.get<AdminDashboardStats>('/admin/dashboard')
  }

  async getRecentActivity(limit = 10): Promise<AdminActivity[]> {
    try {
      return apiClient.get<AdminActivity[]>(`/admin/activity?limit=${limit}`)
    } catch {
      return []
    }
  }

  // === UTILISATEURS ===
  async getUsers(): Promise<{ users: AdminUser[]; total: number }> {
    const raw = await apiClient.get<
      ApiUtilisateur[] | { data: ApiUtilisateur[] } | { utilisateurs: ApiUtilisateur[] }
    >('/admin/utilisateurs')
    let arr: ApiUtilisateur[]
    if (Array.isArray(raw)) arr = raw
    else if ('data' in raw && Array.isArray((raw as { data: unknown }).data))
      arr = (raw as { data: ApiUtilisateur[] }).data
    else if (
      'utilisateurs' in raw &&
      Array.isArray((raw as { utilisateurs: unknown }).utilisateurs)
    )
      arr = (raw as { utilisateurs: ApiUtilisateur[] }).utilisateurs
    else arr = []
    const users = arr.map(mapUtilisateur)
    return { users, total: users.length }
  }

  async getUserStats(): Promise<UserStats> {
    return apiClient.get<UserStats>('/admin/utilisateurs/stats')
  }

  async toggleUserActive(userId: string, isActive: boolean): Promise<AdminUser> {
    const endpoint = isActive
      ? `/admin/utilisateurs/${userId}/activate`
      : `/admin/utilisateurs/${userId}/deactivate`
    const data = await apiClient.patch<ApiUtilisateur>(endpoint)
    return mapUtilisateur(data)
  }

  async changeUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<AdminUser> {
    const data = await apiClient.patch<ApiUtilisateur>(`/admin/utilisateurs/${userId}/role`, {
      role: role.toLowerCase(),
    })

    // Si le backend retourne 204 No Content, retourner un objet minimal
    if (!data) {
      return {
        id: userId,
        email: '',
        prenom: '',
        nom: '',
        role,
        isActive: true,
        createdAt: new Date(),
      }
    }

    return mapUtilisateur(data)
  }

  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete(`/admin/utilisateurs/${userId}`)
  }

  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    const body = {
      email: userData.email,
      prenom: userData.prenom,
      nom: userData.nom,
      role: userData.role?.toLowerCase(),
      est_actif: userData.isActive ?? true,
    }
    const data = await apiClient.post<ApiUtilisateur>('/admin/utilisateurs', body)
    return mapUtilisateur(data)
  }

  async updateUser(userId: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    const body = {
      email: userData.email,
      prenom: userData.prenom,
      nom: userData.nom,
      role: userData.role?.toLowerCase(),
      est_actif: userData.isActive,
    }
    const data = await apiClient.patch<ApiUtilisateur>(`/admin/utilisateurs/${userId}`, body)

    // Si le backend retourne 204 No Content, construire l'objet depuis userData
    if (!data) {
      return {
        id: userId,
        email: userData.email!,
        prenom: userData.prenom!,
        nom: userData.nom!,
        role: (userData.role || 'USER') as 'USER' | 'ADMIN',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: new Date(),
      }
    }

    return mapUtilisateur(data)
  }

  async bulkUpdateUsers(
    userIds: string[],
    action: 'activate' | 'deactivate' | 'delete',
  ): Promise<void> {
    await Promise.all(
      userIds.map((id) => {
        if (action === 'activate') return this.toggleUserActive(id, true)
        if (action === 'deactivate') return this.toggleUserActive(id, false)
        return this.deleteUser(id)
      }),
    )
  }

  // === INFORMATIONS ===
  async getPublicContents(): Promise<AdminContent[]> {
    const raw = await apiClient.getPublic<
      ApiInformation[] | { data: ApiInformation[] } | { informations: ApiInformation[] }
    >('/informations')
    let arr: ApiInformation[]
    if (Array.isArray(raw)) arr = raw
    else if ('data' in raw && Array.isArray((raw as { data: unknown }).data))
      arr = (raw as { data: ApiInformation[] }).data
    else if (
      'informations' in raw &&
      Array.isArray((raw as { informations: unknown }).informations)
    )
      arr = (raw as { informations: ApiInformation[] }).informations
    else arr = []
    return arr.map(mapInformation)
  }

  async getContents(params?: {
    type?: string
  }): Promise<{ contents: AdminContent[]; total: number }> {
    const query = params?.type ? `?type=${params.type}` : ''
    const raw = await apiClient.get<
      ApiInformation[] | { data: ApiInformation[] } | { informations: ApiInformation[] }
    >(`/admin/informations${query}`)
    let arr: ApiInformation[]
    if (Array.isArray(raw)) arr = raw
    else if ('data' in raw && Array.isArray((raw as { data: unknown }).data))
      arr = (raw as { data: ApiInformation[] }).data
    else if (
      'informations' in raw &&
      Array.isArray((raw as { informations: unknown }).informations)
    )
      arr = (raw as { informations: ApiInformation[] }).informations
    else arr = []
    const contents = arr.map(mapInformation)
    return { contents, total: contents.length }
  }

  async createContent(contentData: Partial<AdminContent>): Promise<AdminContent> {
    const body = {
      titre: contentData.title,
      contenu: contentData.content,
      type_contenu: contentData.type,
      slug: contentData.slug,
      est_actif: contentData.isActive ?? true,
      ordre_affichage: contentData.order ?? 0,
    }
    const data = await apiClient.post<ApiInformation>('/admin/informations', body)
    return mapInformation(data)
  }

  async updateContent(
    contentId: string,
    contentData: Partial<AdminContent>,
  ): Promise<AdminContent> {
    const body = {
      titre: contentData.title,
      contenu: contentData.content,
      type_contenu: contentData.type,
      slug: contentData.slug,
      est_actif: contentData.isActive,
      ordre_affichage: contentData.order,
    }
    const data = await apiClient.patch<ApiInformation>(`/admin/informations/${contentId}`, body)
    return mapInformation(data)
  }

  async toggleContentActive(contentId: string, isActive: boolean): Promise<AdminContent> {
    if (!isActive) {
      const data = await apiClient.patch<ApiInformation>(
        `/admin/informations/${contentId}/deactivate`,
      )
      return mapInformation(data)
    }
    const data = await apiClient.patch<ApiInformation>(`/admin/informations/${contentId}`, {
      est_actif: true,
    })
    return mapInformation(data)
  }

  async deleteContent(contentId: string): Promise<void> {
    return apiClient.delete(`/admin/informations/${contentId}`)
  }

  async duplicateContent(contentId: string): Promise<AdminContent> {
    const original = await apiClient.get<ApiInformation>(`/admin/informations/${contentId}`)
    const body = {
      titre: `${original.titre} (Copie)`,
      contenu: original.contenu,
      type_contenu: original.type_contenu,
      slug: original.slug ? `${original.slug}-copie` : undefined,
      est_actif: false,
      ordre_affichage: original.ordre_affichage,
    }
    const data = await apiClient.post<ApiInformation>('/admin/informations', body)
    return mapInformation(data)
  }

  async reorderContent(contentId: string, newOrder: number): Promise<void> {
    await apiClient.patch(`/admin/informations/${contentId}`, { ordre_affichage: newOrder })
  }

  async bulkUpdateContents(
    contentIds: string[],
    action: 'publish' | 'draft' | 'activate' | 'deactivate' | 'delete',
  ): Promise<void> {
    await Promise.all(
      contentIds.map((id) => {
        if (action === 'delete') return this.deleteContent(id)
        if (action === 'activate') return this.toggleContentActive(id, true)
        if (action === 'deactivate') return this.toggleContentActive(id, false)
        if (action === 'publish') return this.updateContent(id, { status: 'published' })
        if (action === 'draft') return this.updateContent(id, { status: 'draft' })
        return Promise.resolve()
      }),
    )
  }

  // === QUESTIONNAIRES ===
  async getQuestionnaires(): Promise<AdminQuestionnaire[]> {
    const data = await apiClient.get<
      | AdminQuestionnaire[]
      | { data: AdminQuestionnaire[] }
      | { questionnaires: AdminQuestionnaire[] }
    >('/admin/questionnaires')
    if (Array.isArray(data)) return data
    if ('data' in data && Array.isArray((data as { data: unknown }).data))
      return (data as { data: AdminQuestionnaire[] }).data
    if (
      'questionnaires' in data &&
      Array.isArray((data as { questionnaires: unknown }).questionnaires)
    )
      return (data as { questionnaires: AdminQuestionnaire[] }).questionnaires
    return []
  }

  async getQuestionnaireWithQuestions(questionnaireId: string): Promise<AdminQuestionnaire> {
    const [questionnaire, questions] = await Promise.all([
      apiClient.getPublic<AdminQuestionnaire>(`/questionnaires/${questionnaireId}`),
      apiClient.get<AdminQuestion[]>(`/admin/questionnaires/${questionnaireId}/questions`),
    ])
    return { ...questionnaire, questions }
  }

  async createQuestionnaire(
    questionnaireData: Partial<AdminQuestionnaire>,
  ): Promise<AdminQuestionnaire> {
    return apiClient.post<AdminQuestionnaire>('/questionnaires', questionnaireData)
  }

  async updateQuestionnaire(
    questionnaireId: string,
    questionnaireData: Partial<AdminQuestionnaire>,
  ): Promise<AdminQuestionnaire> {
    return apiClient.put<AdminQuestionnaire>(
      `/questionnaires/${questionnaireId}`,
      questionnaireData,
    )
  }

  async deleteQuestionnaire(questionnaireId: string): Promise<void> {
    return apiClient.delete(`/questionnaires/${questionnaireId}`)
  }

  async toggleQuestionnaireActive(
    questionnaireId: string,
    isActive: boolean,
  ): Promise<AdminQuestionnaire> {
    return apiClient.put<AdminQuestionnaire>(`/questionnaires/${questionnaireId}`, { isActive })
  }

  async duplicateQuestionnaire(questionnaireId: string): Promise<AdminQuestionnaire> {
    const original = await this.getQuestionnaireWithQuestions(questionnaireId)
    return this.createQuestionnaire({
      title: `${original.title} (Copie)`,
      description: original.description,
      category: original.category,
      isActive: false,
      questions: original.questions,
    })
  }

  async checkSlugAvailability(
    slug: string,
    type: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    const query = excludeId ? `?excludeId=${excludeId}` : ''
    try {
      await apiClient.getPublic(`/informations/slug/${slug}${query}`)
      return { available: false }
    } catch {
      return { available: true }
    }
  }

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<{ url: string }>('/admin/upload', formData)
  }

  async exportData(
    type: 'users' | 'contents' | 'questionnaires' | 'responses',
    format: 'csv' | 'json' = 'csv',
  ): Promise<Blob> {
    return apiClient.get<Blob>(`/admin/export/${type}?format=${format}`)
  }
}

// Instance exportée du service
export const adminService = new AdminService()
