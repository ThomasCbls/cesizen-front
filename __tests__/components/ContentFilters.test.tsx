import ContentFilters from '@/app/admin/components/ContentFilters'
import { fireEvent, render, screen } from '@testing-library/react'

const baseProps = {
  searchQuery: '',
  onSearchChange: jest.fn(),
  typeFilter: 'all' as const,
  onTypeFilterChange: jest.fn(),
  statusFilter: 'all' as const,
  onStatusFilterChange: jest.fn(),
  activeFilter: 'all' as const,
  onActiveFilterChange: jest.fn(),
  onCreateContent: jest.fn(),
  selectedCount: 0,
  onBulkAction: jest.fn(),
}

describe('ContentFilters', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche le champ de recherche', () => {
    render(<ContentFilters {...baseProps} />)
    expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument()
  })

  it('affiche le bouton de création de contenu', () => {
    render(<ContentFilters {...baseProps} />)
    expect(screen.getByRole('button', { name: /Nouveau contenu/i })).toBeInTheDocument()
  })

  it('appelle onCreateContent au clic sur le bouton de création', () => {
    render(<ContentFilters {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Nouveau contenu/i }))
    expect(baseProps.onCreateContent).toHaveBeenCalledTimes(1)
  })

  it('appelle onSearchChange lors de la saisie dans le champ de recherche', () => {
    render(<ContentFilters {...baseProps} />)
    fireEvent.change(screen.getByPlaceholderText(/Rechercher/i), {
      target: { value: 'stress' },
    })
    expect(baseProps.onSearchChange).toHaveBeenCalledWith('stress')
  })

  it('affiche le bouton Filtres', () => {
    render(<ContentFilters {...baseProps} />)
    expect(screen.getByRole('button', { name: /Filtres/i })).toBeInTheDocument()
  })

  it('affiche les filtres avancés après clic sur Filtres', () => {
    render(<ContentFilters {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Filtres/i }))
    // Le panneau de filtres est rendu : les valeurs par défaut des selects sont visibles
    expect(screen.getByText('Tous les types')).toBeInTheDocument()
    expect(screen.getByText('Tous les statuts')).toBeInTheDocument()
  })

  it('affiche le nombre de filtres actifs dans le bouton Filtres', () => {
    render(<ContentFilters {...baseProps} searchQuery="test" />)
    expect(screen.getByRole('button', { name: /Filtres \(1\)/i })).toBeInTheDocument()
  })

  it("affiche un bouton d'action groupée quand selectedCount > 0", () => {
    render(<ContentFilters {...baseProps} selectedCount={3} />)
    // Les boutons d'actions groupées apparaissent quand au moins 1 contenu est sélectionné
    expect(screen.getByRole('button', { name: 'Publier' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
  })
})
