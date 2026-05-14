import ContentModal from '@/app/admin/components/ContentModal'
import { fireEvent, render, screen } from '@testing-library/react'

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn(),
  loading: false,
}

const existingContent = {
  id: 'c-1',
  title: 'Introduction au stress',
  slug: 'introduction-stress',
  type: 'article' as const,
  status: 'published' as const,
  isActive: true,
  excerpt: 'Un bref aperçu',
  content: "Contenu complet de l'article",
}

describe('ContentModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche le titre "Nouveau contenu" en mode création', () => {
    render(<ContentModal {...baseProps} />)
    expect(screen.getByText('Nouveau contenu')).toBeInTheDocument()
  })

  it('affiche le titre "Modifier le contenu" en mode édition', () => {
    render(<ContentModal {...baseProps} content={existingContent} />)
    expect(screen.getByText('Modifier le contenu')).toBeInTheDocument()
  })

  it('affiche les onglets Contenu, Paramètres et Aperçu', () => {
    render(<ContentModal {...baseProps} />)
    expect(screen.getByRole('tab', { name: 'Contenu' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Paramètres' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Aperçu' })).toBeInTheDocument()
  })

  it('affiche les champs Titre, Slug et Contenu par défaut', () => {
    render(<ContentModal {...baseProps} />)
    expect(screen.getByLabelText(/Titre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument()
    // MUI ajoute " *" (aria-hidden) au label des champs required.
    // On cible le textarea par son id fixé dans le composant.
    expect(document.getElementById('content-editor')).toBeInTheDocument()
  })

  it('pré-remplit les champs en mode édition', () => {
    render(<ContentModal {...baseProps} content={existingContent} />)
    expect(screen.getByDisplayValue('Introduction au stress')).toBeInTheDocument()
    expect(screen.getByDisplayValue('introduction-stress')).toBeInTheDocument()
  })

  it('génère automatiquement le slug à partir du titre en mode création', () => {
    render(<ContentModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText(/Titre/i), {
      target: { value: 'Mon Super Article' },
    })
    const slugInput = screen.getByLabelText(/Slug/i) as HTMLInputElement
    expect(slugInput.value).toBe('mon-super-article')
  })

  it('appelle onClose quand le bouton Annuler est cliqué', () => {
    render(<ContentModal {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }))
    expect(baseProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('affiche les erreurs de validation quand les champs requis sont vides', () => {
    render(<ContentModal {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))
    expect(screen.getByText('Le titre est requis')).toBeInTheDocument()
  })

  it('affiche une erreur si le contenu est vide', () => {
    render(<ContentModal {...baseProps} />)
    // Remplir titre et slug mais pas le contenu
    fireEvent.change(screen.getByLabelText(/Titre/i), { target: { value: 'Mon titre' } })
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))
    expect(screen.getByText('Le contenu est requis')).toBeInTheDocument()
  })

  it('affiche "Modifier" comme label du bouton de soumission en mode édition', () => {
    render(<ContentModal {...baseProps} content={existingContent} />)
    expect(screen.getByRole('button', { name: /Modifier/i })).toBeInTheDocument()
  })

  it('désactive le bouton de soumission quand loading=true', () => {
    render(<ContentModal {...baseProps} loading={true} />)
    expect(screen.getByRole('button', { name: /Sauvegarde.../i })).toBeDisabled()
  })

  it('appelle onSave avec les données valides', () => {
    render(<ContentModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText(/Titre/i), { target: { value: 'Mon article' } })
    // Cibler le textarea par son id fixé (MUI ajoute " *" au label des champs required)
    const contentEditor = document.getElementById('content-editor') as HTMLTextAreaElement
    fireEvent.change(contentEditor, { target: { value: 'Texte du contenu' } })
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))
    expect(baseProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Mon article',
        content: 'Texte du contenu',
      }),
    )
  })
})
