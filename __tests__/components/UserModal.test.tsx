import UserModal from '@/app/admin/components/UserModal'
import { fireEvent, render, screen } from '@testing-library/react'

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn(),
  loading: false,
}

const existingUser = {
  id: 'u-1',
  email: 'jean.dupont@example.com',
  prenom: 'Jean',
  nom: 'Dupont',
  role: 'USER' as const,
  isActive: true,
}

describe('UserModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche le titre "Nouvel utilisateur" en mode création', () => {
    render(<UserModal {...baseProps} />)
    expect(screen.getByText('Nouvel utilisateur')).toBeInTheDocument()
  })

  it('affiche le titre "Modifier l\'utilisateur" en mode édition', () => {
    render(<UserModal {...baseProps} user={existingUser} />)
    expect(screen.getByText("Modifier l'utilisateur")).toBeInTheDocument()
  })

  it('affiche les champs Prénom, Nom, Email', () => {
    render(<UserModal {...baseProps} />)
    expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Nom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
  })

  it('affiche le champ Mot de passe en mode création', () => {
    render(<UserModal {...baseProps} />)
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument()
  })

  it('pré-remplit les champs en mode édition', () => {
    render(<UserModal {...baseProps} user={existingUser} />)
    expect(screen.getByDisplayValue('Jean')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument()
  })

  it("affiche un message d'info en mode création", () => {
    render(<UserModal {...baseProps} />)
    expect(
      screen.getByText(/Un email de bienvenue sera automatiquement envoyé/i),
    ).toBeInTheDocument()
  })

  it('appelle onClose quand le bouton Annuler est cliqué', () => {
    render(<UserModal {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }))
    expect(baseProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('appelle onClose quand le bouton X est cliqué', () => {
    render(<UserModal {...baseProps} />)
    // Le bouton X est un IconButton sans texte explicite
    const closeButtons = screen.getAllByRole('button')
    const xButton = closeButtons.find(
      (btn) => btn.querySelector('svg') !== null && btn.closest('[role="dialog"]') !== null,
    )!
    fireEvent.click(xButton)
    expect(baseProps.onClose).toHaveBeenCalled()
  })

  it('affiche les erreurs de validation quand les champs requis sont vides', () => {
    render(<UserModal {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))
    expect(screen.getByText("L'email est requis")).toBeInTheDocument()
    expect(screen.getByText('Le prénom est requis')).toBeInTheDocument()
    expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
  })

  it("affiche l'erreur de mot de passe requis en mode création", () => {
    render(<UserModal {...baseProps} />)
    // Remplir prenom, nom, email mais pas le mot de passe
    fireEvent.change(screen.getByLabelText(/Prénom/i), { target: { value: 'Jean' } })
    fireEvent.change(screen.getByLabelText(/^Nom/i), { target: { value: 'Dupont' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jean@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))
    expect(
      screen.getByText('Le mot de passe est requis pour un nouvel utilisateur'),
    ).toBeInTheDocument()
  })

  it('affiche "Modifier" comme label du bouton de soumission en mode édition', () => {
    render(<UserModal {...baseProps} user={existingUser} />)
    expect(screen.getByRole('button', { name: /Modifier/i })).toBeInTheDocument()
  })

  it('désactive le bouton de soumission quand loading=true', () => {
    render(<UserModal {...baseProps} loading={true} />)
    expect(screen.getByRole('button', { name: /Sauvegarde.../i })).toBeDisabled()
  })

  it('appelle onSave avec les données valides', () => {
    render(<UserModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText(/Prénom/i), { target: { value: 'Jean' } })
    fireEvent.change(screen.getByLabelText(/^Nom/i), { target: { value: 'Dupont' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jean@test.com' } })
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))
    expect(baseProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean@test.com',
      }),
    )
  })
})
