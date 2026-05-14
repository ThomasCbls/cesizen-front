import QuestionnaireTable from '@/app/admin/components/QuestionnaireTable'
import { render, screen } from '@testing-library/react'

const baseQuestionnaire = {
  id: 'q-1',
  title: 'Questionnaire de stress',
  description: 'Évaluez votre niveau de stress quotidien',
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

const anxietyQuestionnaire = {
  id: 'q-2',
  title: 'Questionnaire anxiété',
  description: 'Évaluez votre anxiété',
  category: 'ANXIETY' as const,
  isActive: false,
  questions: [],
}

const burnoutQuestionnaire = {
  id: 'q-3',
  title: 'Questionnaire burnout',
  description: 'Évaluez votre épuisement',
  category: 'BURNOUT' as const,
  isActive: true,
  questions: [],
}

const baseProps = {
  questionnaires: [baseQuestionnaire],
  loading: false,
  onToggleActive: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onDuplicate: jest.fn(),
  onPreview: jest.fn(),
}

describe('QuestionnaireTable', () => {
  beforeEach(() => jest.clearAllMocks())

  it('affiche les en-têtes de colonnes', () => {
    render(<QuestionnaireTable {...baseProps} />)
    expect(screen.getByText('Questionnaire')).toBeInTheDocument()
    expect(screen.getByText('Catégorie')).toBeInTheDocument()
    expect(screen.getByText('Questions')).toBeInTheDocument()
    expect(screen.getByText('Score max')).toBeInTheDocument()
  })

  it("affiche le titre et la description d'un questionnaire", () => {
    render(<QuestionnaireTable {...baseProps} />)
    expect(screen.getByText('Questionnaire de stress')).toBeInTheDocument()
    expect(screen.getByText('Évaluez votre niveau de stress quotidien')).toBeInTheDocument()
  })

  it('affiche le chip "Stress" pour category=STRESS', () => {
    render(<QuestionnaireTable {...baseProps} />)
    expect(screen.getByText('Stress')).toBeInTheDocument()
  })

  it('affiche le chip "Anxiété" pour category=ANXIETY', () => {
    render(<QuestionnaireTable {...baseProps} questionnaires={[anxietyQuestionnaire]} />)
    expect(screen.getByText('Anxiété')).toBeInTheDocument()
  })

  it('affiche le chip "Burnout" pour category=BURNOUT', () => {
    render(<QuestionnaireTable {...baseProps} questionnaires={[burnoutQuestionnaire]} />)
    expect(screen.getByText('Burnout')).toBeInTheDocument()
  })

  it('affiche le nombre de questions', () => {
    render(<QuestionnaireTable {...baseProps} />)
    expect(screen.getByText('1 questions')).toBeInTheDocument()
  })

  it('affiche le score maximum calculé', () => {
    render(<QuestionnaireTable {...baseProps} />)
    // Score max = 3 pts (max des options de la question 1)
    expect(screen.getByText('3 pts')).toBeInTheDocument()
  })

  it('affiche "Aucun questionnaire" quand la liste est vide', () => {
    render(<QuestionnaireTable {...baseProps} questionnaires={[]} />)
    expect(screen.getByText('Aucun questionnaire')).toBeInTheDocument()
    expect(screen.getByText('Créez votre premier questionnaire pour commencer')).toBeInTheDocument()
  })

  it('affiche plusieurs questionnaires', () => {
    render(
      <QuestionnaireTable
        {...baseProps}
        questionnaires={[baseQuestionnaire, anxietyQuestionnaire]}
      />,
    )
    expect(screen.getByText('Questionnaire de stress')).toBeInTheDocument()
    expect(screen.getByText('Questionnaire anxiété')).toBeInTheDocument()
  })
})
