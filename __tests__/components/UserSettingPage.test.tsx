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
    auth: {
      changePassword: 'http://localhost:3000/auth/change-password',
    },
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

    const passwordFields = screen.getAllByLabelText(/mot de passe/i, { exact: false })
    if (passwordFields.length >= 3) {
      fireEvent.change(passwordFields[0], { target: { value: 'ancien123' } })
      fireEvent.change(passwordFields[1], { target: { value: 'NouveauMotDePasse123!' } })
      fireEvent.change(passwordFields[2], { target: { value: 'different456' } })
    }

    await waitFor(() => {
      expect(screen.getByText(/ne correspondent pas/i)).toBeInTheDocument()
    })
  })

  it('affiche une erreur de validation si le mot de passe est trop court', async () => {
    render(<UserSettingPage />)

    const newPasswordField = screen.getByLabelText('Nouveau mot de passe')
    await act(async () => {
      fireEvent.change(newPasswordField, { target: { value: 'court' } })
    })

    await waitFor(() => {
      expect(
        screen.getByText('Le mot de passe doit contenir au minimum 12 caractères'),
      ).toBeInTheDocument()
    })
  })

  it("affiche l'indicateur de force du mot de passe", async () => {
    render(<UserSettingPage />)

    const newPasswordField = screen.getByLabelText('Nouveau mot de passe')
    fireEvent.change(newPasswordField, { target: { value: 'NouveauMotDePasse123!' } })

    await waitFor(() => {
      expect(screen.getByText(/Force du mot de passe/i)).toBeInTheDocument()
    })
  })

  it('désactive le bouton si les erreurs de validation existent', async () => {
    render(<UserSettingPage />)

    const currentPasswordField = screen.getByLabelText('Mot de passe actuel')
    const newPasswordField = screen.getByLabelText('Nouveau mot de passe')
    const updateButton = screen.getByRole('button', { name: /Mettre à jour le mot de passe/i })

    fireEvent.change(currentPasswordField, { target: { value: 'ancien123' } })
    fireEvent.change(newPasswordField, { target: { value: 'court' } })

    await waitFor(() => {
      expect(updateButton).toBeDisabled()
    })
  })

  it("appelle l'endpoint change-password avec le bon corps", async () => {
    render(<UserSettingPage />)

    const currentField = screen.getByLabelText('Mot de passe actuel')
    const newField = screen.getByLabelText('Nouveau mot de passe')
    const confirmField = screen.getByLabelText('Confirmer le nouveau mot de passe')

    fireEvent.change(currentField, { target: { value: 'AncienMotDePasse1!' } })
    fireEvent.change(newField, { target: { value: 'NouveauMotDePasse1!' } })
    fireEvent.change(confirmField, { target: { value: 'NouveauMotDePasse1!' } })

    const updateButton = screen.getByRole('button', { name: /Mettre à jour le mot de passe/i })
    await act(async () => {
      fireEvent.click(updateButton)
    })

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledWith(
        'http://localhost:3000/auth/change-password',
        'POST',
        {
          oldPassword: 'AncienMotDePasse1!',
          newPassword: 'NouveauMotDePasse1!',
          confirmPassword: 'NouveauMotDePasse1!',
        },
      )
    })
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
