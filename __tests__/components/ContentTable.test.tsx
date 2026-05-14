import ContentTable from '@/app/admin/components/ContentTable'
import { render, screen } from '@testing-library/react'

const baseContent = {
  id: 'c-1',
  title: 'Introduction au stress',
  slug: 'introduction-stress',
  type: 'article' as const,
  status: 'published' as const,
  isActive: true,
  content: "Contenu de l'article",
  author: { prenom: 'Marie', nom: 'Curie' },
  updatedAt: new Date('2024-02-10'),
}

const draftContent = {
  id: 'c-2',
  title: 'Brouillon test',
  slug: 'brouillon-test',
  type: 'page' as const,
  status: 'draft' as const,
  isActive: false,
  content: 'Brouillon',
}

const archivedContent = {
  id: 'c-3',
  title: 'Contenu archivé',
  slug: 'contenu-archive',
  type: 'menu' as const,
  status: 'archived' as const,
  isActive: false,
  content: 'Archivé',
}

const baseProps = {
  contents: [baseContent],
  loading: false,
  onToggleActive: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onDuplicate: jest.fn(),
  onPreview: jest.fn(),
}

describe('ContentTable', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche les en-têtes de colonnes', () => {
    render(<ContentTable {...baseProps} />)
    expect(screen.getByText('Titre')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Statut')).toBeInTheDocument()
    expect(screen.getByText('Auteur')).toBeInTheDocument()
  })

  it("affiche le titre et le slug d'un contenu", () => {
    render(<ContentTable {...baseProps} />)
    expect(screen.getByText('Introduction au stress')).toBeInTheDocument()
    expect(screen.getByText('/introduction-stress')).toBeInTheDocument()
  })

  it('affiche le chip "Publié" pour status=published', () => {
    render(<ContentTable {...baseProps} />)
    expect(screen.getByText('Publié')).toBeInTheDocument()
  })

  it('affiche le chip "Brouillon" pour status=draft', () => {
    render(<ContentTable {...baseProps} contents={[draftContent]} />)
    expect(screen.getByText('Brouillon')).toBeInTheDocument()
  })

  it('affiche le chip "Archivé" pour status=archived', () => {
    render(<ContentTable {...baseProps} contents={[archivedContent]} />)
    expect(screen.getByText('Archivé')).toBeInTheDocument()
  })

  it('affiche le chip "Article" pour type=article', () => {
    render(<ContentTable {...baseProps} />)
    expect(screen.getByText('Article')).toBeInTheDocument()
  })

  it('affiche le chip "Page" pour type=page', () => {
    render(<ContentTable {...baseProps} contents={[draftContent]} />)
    expect(screen.getByText('Page')).toBeInTheDocument()
  })

  it('affiche le chip "Menu" pour type=menu', () => {
    render(<ContentTable {...baseProps} contents={[archivedContent]} />)
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it("affiche le nom de l'auteur quand disponible", () => {
    render(<ContentTable {...baseProps} />)
    expect(screen.getByText('Marie Curie')).toBeInTheDocument()
  })

  it('affiche "Auteur inconnu" quand pas d\'auteur', () => {
    render(<ContentTable {...baseProps} contents={[draftContent]} />)
    expect(screen.getByText('Auteur inconnu')).toBeInTheDocument()
  })

  it('affiche plusieurs contenus', () => {
    render(<ContentTable {...baseProps} contents={[baseContent, draftContent]} />)
    expect(screen.getByText('Introduction au stress')).toBeInTheDocument()
    expect(screen.getByText('Brouillon test')).toBeInTheDocument()
  })

  it("n'affiche pas de données quand contents=[]", () => {
    render(<ContentTable {...baseProps} contents={[]} />)
    expect(screen.queryByText('Introduction au stress')).not.toBeInTheDocument()
  })
})
