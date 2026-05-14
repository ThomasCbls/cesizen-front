import StatsCard from '@/app/admin/components/StatsCard'
import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'

// MUI nécessite un contexte minimal ; on mocke ThemeProvider pour simplifier
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material')
  return actual
})

describe('StatsCard', () => {
  const baseProps = {
    title: 'Utilisateurs',
    value: 42,
    icon: Users,
  }

  it('affiche le titre et la valeur', () => {
    render(<StatsCard {...baseProps} />)
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('affiche un Skeleton en mode chargement', () => {
    const { container } = render(<StatsCard {...baseProps} loading />)
    // MUI Skeleton rend un span avec la class MuiSkeleton-root
    const skeleton = container.querySelector('.MuiSkeleton-root')
    expect(skeleton).toBeInTheDocument()
  })

  it("n'affiche pas de Skeleton quand loading est false", () => {
    const { container } = render(<StatsCard {...baseProps} loading={false} />)
    const skeleton = container.querySelector('.MuiSkeleton-root')
    expect(skeleton).not.toBeInTheDocument()
  })

  it('affiche la tendance quand elle est fournie', () => {
    render(<StatsCard {...baseProps} trend={{ value: 12, label: 'ce mois' }} />)
    expect(screen.getByText(/12/)).toBeInTheDocument()
    expect(screen.getByText(/ce mois/)).toBeInTheDocument()
  })

  it('applique la couleur success sans erreur', () => {
    render(<StatsCard {...baseProps} color="success" />)
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument()
  })
})
