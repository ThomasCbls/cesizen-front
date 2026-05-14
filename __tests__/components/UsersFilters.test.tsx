import UsersFilters from '@/app/admin/components/UsersFilters'
import { fireEvent, render, screen } from '@testing-library/react'

const baseProps = {
  searchQuery: '',
  onSearchChange: jest.fn(),
  statusFilter: 'all' as const,
  onStatusFilterChange: jest.fn(),
  roleFilter: 'all' as const,
  onRoleFilterChange: jest.fn(),
  onCreateUser: jest.fn(),
  selectedCount: 0,
  onBulkAction: jest.fn(),
}

describe('UsersFilters', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche le champ de recherche', () => {
    render(<UsersFilters {...baseProps} />)
    expect(screen.getByPlaceholderText(/Rechercher par nom ou email/i)).toBeInTheDocument()
  })

  it("affiche le bouton de création d'utilisateur", () => {
    render(<UsersFilters {...baseProps} />)
    expect(screen.getByRole('button', { name: /Nouvel utilisateur/i })).toBeInTheDocument()
  })

  it('appelle onCreateUser au clic sur le bouton de création', () => {
    render(<UsersFilters {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Nouvel utilisateur/i }))
    expect(baseProps.onCreateUser).toHaveBeenCalledTimes(1)
  })

  it('appelle onSearchChange lors de la saisie dans le champ de recherche', () => {
    render(<UsersFilters {...baseProps} />)
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom ou email/i), {
      target: { value: 'dupont' },
    })
    expect(baseProps.onSearchChange).toHaveBeenCalledWith('dupont')
  })

  it('affiche le bouton Filtres', () => {
    render(<UsersFilters {...baseProps} />)
    expect(screen.getByRole('button', { name: /Filtres/i })).toBeInTheDocument()
  })

  it('affiche les filtres avancés après clic sur Filtres', () => {
    render(<UsersFilters {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Filtres/i }))
    // Le panneau de filtres est rendu : vérifier les valeurs par défaut des selects
    expect(screen.getByText('Tous les statuts')).toBeInTheDocument()
    expect(screen.getByText('Tous les rôles')).toBeInTheDocument()
  })

  it('affiche le nombre de filtres actifs quand searchQuery est renseigné', () => {
    render(<UsersFilters {...baseProps} searchQuery="jean" />)
    expect(screen.getByRole('button', { name: /Filtres \(1\)/i })).toBeInTheDocument()
  })

  it('affiche le nombre de filtres actifs pour roleFilter non-all', () => {
    render(<UsersFilters {...baseProps} roleFilter="ADMIN" />)
    expect(screen.getByRole('button', { name: /Filtres \(1\)/i })).toBeInTheDocument()
  })

  it('affiche le chip de sélection groupée quand selectedCount > 0', () => {
    render(<UsersFilters {...baseProps} selectedCount={5} />)
    // Quand des éléments sont sélectionnés, les boutons d'action groupée apparaissent
    expect(screen.getByRole('button', { name: 'Activer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Désactiver' })).toBeInTheDocument()
  })

  it('efface la recherche au clic sur le bouton X dans le champ', () => {
    render(
      <UsersFilters {...baseProps} searchQuery="test" onSearchChange={baseProps.onSearchChange} />,
    )
    // Le bouton X apparaît quand searchQuery est non vide
    const clearBtn = screen.getByRole('button', { name: '' })
    fireEvent.click(clearBtn)
    expect(baseProps.onSearchChange).toHaveBeenCalledWith('')
  })
})
