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
  type: string
  status: string
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
  category: string
  isActive: boolean
  questions: AdminQuestion[]
  createdAt: Date
  updatedAt: Date
  createur_id?: string
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
    type: api.type_contenu,
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
    return mapUtilisateur(data)
  }

  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete(`/admin/utilisateurs/${userId}`)
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
}

// Instance exportée du service
export const adminService = new AdminService()
