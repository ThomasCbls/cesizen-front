import ConfirmDeleteModal from '@/app/admin/components/ConfirmDeleteModal'
import { fireEvent, render, screen } from '@testing-library/react'

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  title: 'Supprimer cet utilisateur',
  message: 'Voulez-vous vraiment supprimer cet élément ?',
}

describe('ConfirmDeleteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche le titre et le message', () => {
    render(<ConfirmDeleteModal {...baseProps} />)
    expect(screen.getByText('Supprimer cet utilisateur')).toBeInTheDocument()
    expect(screen.getByText('Voulez-vous vraiment supprimer cet élément ?')).toBeInTheDocument()
  })

  it("n'est pas visible quand open est false", () => {
    render(<ConfirmDeleteModal {...baseProps} open={false} />)
    expect(screen.queryByText('Supprimer cet utilisateur')).not.toBeInTheDocument()
  })

  it("affiche le message d'avertissement quand il est fourni", () => {
    render(
      <ConfirmDeleteModal {...baseProps} warningMessage="Attention : suppression définitive" />,
    )
    expect(screen.getByText('Attention : suppression définitive')).toBeInTheDocument()
  })

  it("n'affiche pas de message d'avertissement quand il est absent", () => {
    render(<ConfirmDeleteModal {...baseProps} />)
    expect(screen.queryByText('Attention : suppression définitive')).not.toBeInTheDocument()
  })

  it('appelle onClose quand on clique sur Annuler', () => {
    render(<ConfirmDeleteModal {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(baseProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('appelle onConfirm quand on clique sur le bouton de confirmation', () => {
    render(<ConfirmDeleteModal {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('affiche un confirmText personnalisé', () => {
    render(<ConfirmDeleteModal {...baseProps} confirmText="Oui, effacer" />)
    expect(screen.getByRole('button', { name: /Oui, effacer/i })).toBeInTheDocument()
  })

  it('désactive les boutons en mode loading', () => {
    render(<ConfirmDeleteModal {...baseProps} loading />)
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Suppression\.\.\./i })).toBeDisabled()
  })

  it('affiche "Suppression..." sur le bouton quand loading est true', () => {
    render(<ConfirmDeleteModal {...baseProps} loading />)
    expect(screen.getByText('Suppression...')).toBeInTheDocument()
  })

  it("affiche toujours le message d'action irréversible", () => {
    render(<ConfirmDeleteModal {...baseProps} />)
    expect(screen.getByText(/irréversible/i)).toBeInTheDocument()
  })
})
