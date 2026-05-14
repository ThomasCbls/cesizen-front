import UserSettingPage from '@/app/user-setting/UserSetting/UserSettingPage'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock des dépendances
jest.mock('@/app/hooks/useUser', () => ({
  useUser: () => ({
    user: {
      id: 'u-1',
      email: 'jean@example.com',
      prenom: 'Jean',
      nom: 'Dupont',
    },
    setUser: jest.fn(),
  }),
}))

const mockApiCall = jest.fn()
jest.mock('@/app/utils/endpoint', () => ({
  apiCall: (...args: unknown[]) => mockApiCall(...args),
  endpoints: {
    users: {
      update: (id: string) => `http://localhost:3000/utilisateurs/${id}`,
    },
  },
}))

// Mock next/link pour éviter les erreurs de router
jest.mock('next/link', () => {
  const Link = ({ children }: { children: React.ReactNode }) => <>{children}</>
  Link.displayName = 'Link'
  return Link
})

describe('UserSettingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockApiCall.mockResolvedValue({})
  })

  it('affiche le titre "Paramètres du compte"', () => {
    render(<UserSettingPage />)
    expect(screen.getByText('Paramètres du compte')).toBeInTheDocument()
  })

  it('affiche les champs Prénom et Nom pré-remplis', () => {
    render(<UserSettingPage />)
    expect(screen.getByDisplayValue('Jean')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument()
  })

  it("affiche l'email pré-rempli", () => {
    render(<UserSettingPage />)
    expect(screen.getByDisplayValue('jean@example.com')).toBeInTheDocument()
  })

  // TU-005 : Réinitialisation / changement de mot de passe
  it('affiche les champs de changement de mot de passe', () => {
    render(<UserSettingPage />)
    // Les champs mot de passe (current, new, confirm) doivent être présents
    const passwordInputs = screen.getAllByDisplayValue('')
    // Il doit y avoir au moins 3 champs mot de passe vides
    expect(passwordInputs.length).toBeGreaterThanOrEqual(3)
  })

  it("affiche un message d'erreur quand les nouveaux mots de passe ne correspondent pas", async () => {
    render(<UserSettingPage />)

    // Trouver tous les champs de type password
    const passwordFields = screen.getAllByLabelText(/mot de passe|password/i, { exact: false })

    // Remplir les champs : current, new, confirm (différents)
    if (passwordFields.length >= 3) {
      fireEvent.change(passwordFields[0], { target: { value: 'ancien123' } })
      fireEvent.change(passwordFields[1], { target: { value: 'nouveau123' } })
      fireEvent.change(passwordFields[2], { target: { value: 'different456' } })
    }

    // Cliquer sur le bouton de changement de mot de passe
    const changePasswordBtn = screen.getByRole('button', {
      name: /modifier|changer|mot de passe/i,
    })
    await act(async () => {
      fireEvent.click(changePasswordBtn)
    })

    expect(screen.getAllByText(/ne correspondent pas/i)[0]).toBeInTheDocument()
  })

  it('appelle apiCall pour sauvegarder les modifications du profil', async () => {
    render(<UserSettingPage />)

    const saveProfileBtn = screen.getAllByRole('button', { name: /enregistrer|sauvegarder/i })[0]
    await act(async () => {
      fireEvent.click(saveProfileBtn)
    })

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledWith(
        expect.stringContaining('/utilisateurs/u-1'),
        'PATCH',
        expect.objectContaining({ prenom: 'Jean', nom: 'Dupont' }),
      )
    })
  })

  it('affiche un message de succès après sauvegarde réussie', async () => {
    mockApiCall.mockResolvedValue({})
    render(<UserSettingPage />)

    const saveBtn = screen.getAllByRole('button', { name: /enregistrer|sauvegarder/i })[0]
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(screen.getByText(/succès|mis à jour/i)).toBeInTheDocument()
    })
  })
})
