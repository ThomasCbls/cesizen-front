import QuickActions from '@/app/admin/components/QuickActions'
import { fireEvent, render, screen } from '@testing-library/react'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('QuickActions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche le titre "Actions rapides"', () => {
    render(<QuickActions />)
    expect(screen.getByText('Actions rapides')).toBeInTheDocument()
  })

  it('affiche les trois actions', () => {
    render(<QuickActions />)
    expect(screen.getByText('Gérer les utilisateurs')).toBeInTheDocument()
    expect(screen.getByText('Créer un contenu')).toBeInTheDocument()
    expect(screen.getByText('Modifier questionnaires')).toBeInTheDocument()
  })

  it('navigue vers /admin/utilisateurs au clic sur "Gérer les utilisateurs"', () => {
    render(<QuickActions />)
    fireEvent.click(screen.getByText('Gérer les utilisateurs'))
    expect(mockPush).toHaveBeenCalledWith('/admin/utilisateurs')
  })

  it('navigue vers /admin/informations au clic sur "Créer un contenu"', () => {
    render(<QuickActions />)
    fireEvent.click(screen.getByText('Créer un contenu'))
    expect(mockPush).toHaveBeenCalledWith('/admin/informations')
  })

  it('navigue vers /admin/questionnaires au clic sur "Modifier questionnaires"', () => {
    render(<QuickActions />)
    fireEvent.click(screen.getByText('Modifier questionnaires'))
    expect(mockPush).toHaveBeenCalledWith('/admin/questionnaires')
  })

  it('affiche les descriptions des actions', () => {
    render(<QuickActions />)
    expect(
      screen.getByText(/Voir tous les utilisateurs et gérer leurs permissions/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/Ajouter une nouvelle page ou article informatif/i)).toBeInTheDocument()
    expect(screen.getByText(/Gérer les questionnaires de diagnostic/i)).toBeInTheDocument()
  })
})
