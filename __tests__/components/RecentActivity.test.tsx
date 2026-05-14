import RecentActivity from '@/app/admin/components/RecentActivity'
import { render, screen } from '@testing-library/react'

type ActivityType =
  | 'user_registration'
  | 'diagnostic_completed'
  | 'content_created'
  | 'questionnaire_updated'

const makeActivity = (
  overrides: Partial<{
    id: string
    type: ActivityType
    description: string
    timestamp: Date
    user: { prenom: string; nom: string }
  }> = {},
) => ({
  id: '1',
  type: 'user_registration' as ActivityType,
  description: 'Nouvel utilisateur inscrit',
  timestamp: new Date(),
  ...overrides,
})

describe('RecentActivity', () => {
  it('affiche un message quand la liste est vide', () => {
    render(<RecentActivity activities={[]} />)
    expect(screen.getByText('Aucune activité récente')).toBeInTheDocument()
  })

  it('affiche les squelettes en mode chargement', () => {
    const { container } = render(<RecentActivity activities={[]} loading />)
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('affiche la description de chaque activité', () => {
    const activities = [
      makeActivity({ id: '1', description: 'Diagnostic complété par Jean Dupont' }),
      makeActivity({ id: '2', description: 'Contenu créé : Gestion du stress' }),
    ]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('Diagnostic complété par Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('Contenu créé : Gestion du stress')).toBeInTheDocument()
  })

  it("affiche le nom de l'utilisateur associé si présent", () => {
    const activities = [makeActivity({ id: '1', user: { prenom: 'Marie', nom: 'Curie' } })]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('Marie Curie')).toBeInTheDocument()
  })

  it("n'affiche pas de chip utilisateur si la propriété est absente", () => {
    const activities = [makeActivity({ id: '1' })]
    render(<RecentActivity activities={activities} />)
    // Pas de chip avec un nom
    expect(screen.queryByText('Marie Curie')).not.toBeInTheDocument()
  })

  it('affiche au maximum 10 activités', () => {
    const activities = Array.from({ length: 15 }, (_, i) =>
      makeActivity({ id: String(i), description: `Activité ${i}` }),
    )
    render(<RecentActivity activities={activities} />)
    // Seules les 10 premières descriptions sont visibles
    expect(screen.getByText('Activité 0')).toBeInTheDocument()
    expect(screen.getByText('Activité 9')).toBeInTheDocument()
    expect(screen.queryByText('Activité 10')).not.toBeInTheDocument()
  })

  it('affiche "À l\'instant" pour une activité très récente', () => {
    const activities = [makeActivity({ id: '1', timestamp: new Date() })]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText("À l'instant")).toBeInTheDocument()
  })

  it('affiche "Il y a Xh" pour une activité de moins de 24h', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const activities = [makeActivity({ id: '1', timestamp: twoHoursAgo })]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('Il y a 2h')).toBeInTheDocument()
  })
})
