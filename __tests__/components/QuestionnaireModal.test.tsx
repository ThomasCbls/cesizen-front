import QuestionnaireModal from '@/app/admin/components/QuestionnaireModal'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn(),
  loading: false,
}

const existingQuestionnaire = {
  id: 'q-1',
  title: 'Questionnaire de stress',
  description: 'Évaluez votre niveau de stress',
  category: 'STRESS' as const,
  isActive: true,
  questions: [
    {
      id: 'q1',
      text: 'Question 1',
      order: 0,
      options: [
        { id: 'o1', text: 'Jamais', score: 0 },
        { id: 'o2', text: 'Souvent', score: 3 },
      ],
    },
  ],
}

describe('QuestionnaireModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche le titre "Nouveau questionnaire" en mode création', async () => {
    render(<QuestionnaireModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText('Nouveau questionnaire')).toBeInTheDocument()
    })
  })

  it('affiche le titre "Modifier le questionnaire" en mode édition', async () => {
    render(<QuestionnaireModal {...baseProps} questionnaire={existingQuestionnaire} />)
    await waitFor(() => {
      expect(screen.getByText('Modifier le questionnaire')).toBeInTheDocument()
    })
  })

  it('affiche les champs Titre et Description', async () => {
    render(<QuestionnaireModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByLabelText(/Titre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })
  })

  it('affiche le bouton "Ajouter une question"', async () => {
    render(<QuestionnaireModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Ajouter une question/i })).toBeInTheDocument()
    })
  })

  it('appelle onClose quand le bouton Annuler est cliqué', async () => {
    render(<QuestionnaireModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }))
    expect(baseProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('affiche les erreurs de validation si le titre est vide', async () => {
    render(<QuestionnaireModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Créer/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))
    expect(screen.getByText('Le titre est requis')).toBeInTheDocument()
  })

  it('affiche l\'erreur "Au moins une question est requise"', async () => {
    render(<QuestionnaireModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByLabelText(/Titre/i)).toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText(/Titre/i), {
      target: { value: 'Mon questionnaire' },
    })
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Une description valide' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))
    expect(screen.getByText('Au moins une question est requise')).toBeInTheDocument()
  })

  it('affiche "Modifier" comme label du bouton de soumission en mode édition', async () => {
    render(<QuestionnaireModal {...baseProps} questionnaire={existingQuestionnaire} />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Modifier/i })).toBeInTheDocument()
    })
  })

  it('désactive le bouton de soumission quand loading=true', async () => {
    render(<QuestionnaireModal {...baseProps} loading={true} />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sauvegarde.../i })).toBeDisabled()
    })
  })

  it('pré-remplit le titre et la description en mode édition', async () => {
    render(<QuestionnaireModal {...baseProps} questionnaire={existingQuestionnaire} />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Questionnaire de stress')).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('Évaluez votre niveau de stress')).toBeInTheDocument()
  })
})
