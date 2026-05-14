import UsersTable from '@/app/admin/components/UsersTable'
import { render, screen } from '@testing-library/react'

const baseUser = {
  id: 'u-1',
  email: 'jean.dupont@example.com',
  prenom: 'Jean',
  nom: 'Dupont',
  role: 'USER' as const,
  isActive: true,
  createdAt: new Date('2024-01-15'),
}

const adminUser = {
  id: 'u-2',
  email: 'admin@example.com',
  prenom: 'Alice',
  nom: 'Admin',
  role: 'ADMIN' as const,
  isActive: false,
}

const baseProps = {
  users: [baseUser],
  loading: false,
  onToggleActive: jest.fn(),
  onChangeRole: jest.fn(),
  onDelete: jest.fn(),
  onEdit: jest.fn(),
}

describe('UsersTable', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche les en-têtes de colonnes', () => {
    render(<UsersTable {...baseProps} />)
    // getByRole('columnheader') évite l'ambiguïté avec le chip de rôle "Utilisateur"
    expect(screen.getByRole('columnheader', { name: 'Utilisateur' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Rôle' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Statut' })).toBeInTheDocument()
  })

  it("affiche le nom complet et l'email d'un utilisateur", () => {
    render(<UsersTable {...baseProps} />)
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('jean.dupont@example.com')).toBeInTheDocument()
  })

  it('affiche le chip "Utilisateur" pour le rôle USER', () => {
    render(<UsersTable {...baseProps} />)
    // "Utilisateur" apparaît deux fois : en-tête de colonne + chip de rôle
    expect(screen.getAllByText('Utilisateur').length).toBeGreaterThanOrEqual(2)
  })

  it('affiche le chip "Administrateur" pour le rôle ADMIN', () => {
    render(<UsersTable {...baseProps} users={[adminUser]} />)
    expect(screen.getByText('Administrateur')).toBeInTheDocument()
  })

  it('affiche le chip "Actif" quand isActive=true', () => {
    render(<UsersTable {...baseProps} />)
    expect(screen.getByText('Actif')).toBeInTheDocument()
  })

  it('affiche le chip "Inactif" quand isActive=false', () => {
    render(<UsersTable {...baseProps} users={[adminUser]} />)
    expect(screen.getByText('Inactif')).toBeInTheDocument()
  })

  it('affiche plusieurs utilisateurs', () => {
    render(<UsersTable {...baseProps} users={[baseUser, adminUser]} />)
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('Alice Admin')).toBeInTheDocument()
  })

  it('affiche la table vide sans erreur quand users=[]', () => {
    render(<UsersTable {...baseProps} users={[]} />)
    // Pas de crash, les en-têtes sont toujours visibles
    expect(screen.getByText('Utilisateur')).toBeInTheDocument()
  })

  it('affiche le bouton de menu contextuel par utilisateur', () => {
    render(<UsersTable {...baseProps} />)
    // Chaque ligne utilisateur a un bouton de menu contextuel (MoreVertical)
    // Il y a au moins 2 boutons : checkbox globale + bouton de menu de la ligne
    const allButtons = screen.getAllByRole('button')
    expect(allButtons.length).toBeGreaterThanOrEqual(2)
  })
})
