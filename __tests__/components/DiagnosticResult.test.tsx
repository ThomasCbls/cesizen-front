import DiagnosticResult from '@/app/diagnostic/components/DiagnosticResult'
import type { DiagnosticResult as DiagnosticResultType } from '@/types'
import { fireEvent, render, screen } from '@testing-library/react'

const makeResult = (overrides: Partial<DiagnosticResultType> = {}): DiagnosticResultType => ({
  totalScore: 250,
  maxScore: 500,
  percentage: 50,
  level: 'MODERATE',
  interpretation: 'Votre niveau de stress est modéré.',
  recommendations: ['Pratiquez la méditation', 'Dormez 8 heures'],
  ...overrides,
})

const baseProps = {
  result: makeResult(),
  diagnosticId: 'diag-123',
  onNewDiagnostic: jest.fn(),
  onViewHistory: jest.fn(),
}

describe('DiagnosticResult', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche le titre de fin de diagnostic', () => {
    render(<DiagnosticResult {...baseProps} />)
    expect(screen.getByText('Diagnostic Terminé')).toBeInTheDocument()
  })

  it('affiche le score total et le score maximum', () => {
    render(<DiagnosticResult {...baseProps} />)
    expect(screen.getByText('250/500')).toBeInTheDocument()
  })

  it('affiche le pourcentage du score', () => {
    render(<DiagnosticResult {...baseProps} />)
    expect(screen.getByText(/50\.0%/)).toBeInTheDocument()
  })

  it('affiche le label du niveau MODERATE', () => {
    render(<DiagnosticResult {...baseProps} />)
    expect(screen.getByText('Stress Modéré')).toBeInTheDocument()
  })

  it('affiche le label du niveau LOW', () => {
    render(<DiagnosticResult {...baseProps} result={makeResult({ level: 'LOW' })} />)
    expect(screen.getByText('Stress Faible')).toBeInTheDocument()
  })

  it('affiche le label du niveau HIGH', () => {
    render(<DiagnosticResult {...baseProps} result={makeResult({ level: 'HIGH' })} />)
    expect(screen.getByText('Stress Élevé')).toBeInTheDocument()
  })

  it('affiche le label du niveau SEVERE', () => {
    render(<DiagnosticResult {...baseProps} result={makeResult({ level: 'SEVERE' })} />)
    expect(screen.getByText('Stress Sévère')).toBeInTheDocument()
  })

  it("affiche l'interprétation du résultat", () => {
    render(<DiagnosticResult {...baseProps} />)
    expect(screen.getByText('Votre niveau de stress est modéré.')).toBeInTheDocument()
  })

  it('affiche les recommandations', () => {
    render(<DiagnosticResult {...baseProps} />)
    expect(screen.getByText('Pratiquez la méditation')).toBeInTheDocument()
    expect(screen.getByText('Dormez 8 heures')).toBeInTheDocument()
  })

  it("n'affiche pas la section recommandations si la liste est vide", () => {
    render(<DiagnosticResult {...baseProps} result={makeResult({ recommendations: [] })} />)
    expect(screen.queryByText('Recommandations Personnalisées')).not.toBeInTheDocument()
  })

  it("affiche l'ID du diagnostic", () => {
    render(<DiagnosticResult {...baseProps} />)
    expect(screen.getByText(/diag-123/)).toBeInTheDocument()
  })

  it('appelle onNewDiagnostic au clic sur "Nouveau Diagnostic"', () => {
    render(<DiagnosticResult {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Nouveau Diagnostic/i }))
    expect(baseProps.onNewDiagnostic).toHaveBeenCalledTimes(1)
  })

  it('appelle onViewHistory au clic sur "Voir l\'Historique Complet"', () => {
    render(<DiagnosticResult {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Historique Complet/i }))
    expect(baseProps.onViewHistory).toHaveBeenCalledTimes(1)
  })
})
