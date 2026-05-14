import LoadingSpinner from '@/app/diagnostic/components/LoadingSpinner'
import { render, screen } from '@testing-library/react'

describe('LoadingSpinner', () => {
  it('affiche le message par défaut', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('affiche un message personnalisé', () => {
    render(<LoadingSpinner message="Analyse en cours..." />)
    expect(screen.getByText('Analyse en cours...')).toBeInTheDocument()
  })

  it('affiche le spinner MUI CircularProgress', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument()
  })

  it("n'affiche pas l'icône quand showIcon est false", () => {
    const { container } = render(<LoadingSpinner showIcon={false} />)
    // L'icône Brain est dans un div absolu ; sans showIcon, ce div n'est pas rendu
    const icon = container.querySelector('[data-testid="brain-icon"]')
    expect(icon).not.toBeInTheDocument()
  })

  it('accepte les trois tailles sans erreur', () => {
    const { rerender } = render(<LoadingSpinner size="small" />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()

    rerender(<LoadingSpinner size="medium" />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()

    rerender(<LoadingSpinner size="large" />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })
})
