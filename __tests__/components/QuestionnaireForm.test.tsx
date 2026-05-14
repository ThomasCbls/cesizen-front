import QuestionnaireForm from '@/app/diagnostic/components/QuestionnaireForm'
import type { DiagnosticSubmissionAnswer, Questionnaire } from '@/types'
import { fireEvent, render, screen } from '@testing-library/react'

const mockQuestionnaire: Questionnaire = {
  id: 'q-1',
  title: 'Questionnaire de stress',
  description: 'Évaluez votre niveau de stress quotidien',
  category: 'STRESS',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  questions: [
    {
      id: 'q1',
      text: 'Vous sentez-vous souvent stressé ?',
      order: 0,
      options: [
        { id: 'o1', text: 'Jamais', score: 0 },
        { id: 'o2', text: 'Parfois', score: 1 },
        { id: 'o3', text: 'Souvent', score: 2 },
        { id: 'o4', text: 'Toujours', score: 3 },
      ],
    },
    {
      id: 'q2',
      text: 'Avez-vous des difficultés à dormir ?',
      order: 1,
      options: [
        { id: 'o5', text: 'Jamais', score: 0 },
        { id: 'o6', text: 'Souvent', score: 2 },
      ],
    },
  ],
}

const baseProps = {
  questionnaire: mockQuestionnaire,
  answers: [] as DiagnosticSubmissionAnswer[],
  progress: 0,
  onAnswerChange: jest.fn(),
  onSubmit: jest.fn(),
  disabled: false,
}

describe('QuestionnaireForm', () => {
  beforeEach(() => jest.clearAllMocks())

  // DIA-001 : Affichage questionnaire
  it('affiche le titre et la description du questionnaire', () => {
    render(<QuestionnaireForm {...baseProps} />)
    expect(screen.getByText('Questionnaire de stress')).toBeInTheDocument()
    expect(screen.getByText('Évaluez votre niveau de stress quotidien')).toBeInTheDocument()
  })

  it('affiche la catégorie du questionnaire', () => {
    render(<QuestionnaireForm {...baseProps} />)
    expect(screen.getByText('STRESS')).toBeInTheDocument()
  })

  it('affiche toutes les questions', () => {
    render(<QuestionnaireForm {...baseProps} />)
    expect(screen.getByText('Vous sentez-vous souvent stressé ?')).toBeInTheDocument()
    expect(screen.getByText('Avez-vous des difficultés à dormir ?')).toBeInTheDocument()
  })

  it('affiche les libellés "Question 1" et "Question 2"', () => {
    render(<QuestionnaireForm {...baseProps} />)
    expect(screen.getByText('Question 1')).toBeInTheDocument()
    expect(screen.getByText('Question 2')).toBeInTheDocument()
  })

  it('affiche les options de réponse pour chaque question', () => {
    render(<QuestionnaireForm {...baseProps} />)
    // "Jamais" apparaît dans la question 1 et 2
    expect(screen.getAllByText('Jamais').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Parfois')).toBeInTheDocument()
    expect(screen.getAllByText('Souvent').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Toujours')).toBeInTheDocument()
  })

  // DIA-002 : Réponse aux questions
  it('appelle onAnswerChange quand une option est sélectionnée', () => {
    render(<QuestionnaireForm {...baseProps} />)
    const radios = screen.getAllByRole('radio')
    // Sélectionner la première option ("Jamais" de la question 1)
    fireEvent.click(radios[0])
    expect(baseProps.onAnswerChange).toHaveBeenCalledWith('q1', 'o1', 0)
  })

  it('appelle onAnswerChange avec le bon score pour "Souvent" (score=2)', () => {
    render(<QuestionnaireForm {...baseProps} />)
    const radios = screen.getAllByRole('radio')
    // "Souvent" est la 3e option de la première question (index 2)
    fireEvent.click(radios[2])
    expect(baseProps.onAnswerChange).toHaveBeenCalledWith('q1', 'o3', 2)
  })

  it('désactive les radios quand disabled=true', () => {
    render(<QuestionnaireForm {...baseProps} disabled={true} />)
    const radios = screen.getAllByRole('radio')
    radios.forEach((radio) => {
      expect(radio).toBeDisabled()
    })
  })

  it("n'appelle pas onAnswerChange quand disabled=true", () => {
    render(<QuestionnaireForm {...baseProps} disabled={true} />)
    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios[0])
    expect(baseProps.onAnswerChange).not.toHaveBeenCalled()
  })

  it('désactive le bouton Soumettre quand toutes les questions ne sont pas répondues', () => {
    render(<QuestionnaireForm {...baseProps} answers={[]} />)
    // Le bouton affiche un message invitant à répondre à toutes les questions
    const submitBtn = screen.getByRole('button', { name: /Veuillez répondre/i })
    expect(submitBtn).toBeDisabled()
  })

  it('active le bouton Soumettre quand toutes les questions sont répondues', () => {
    const fullAnswers: DiagnosticSubmissionAnswer[] = [
      { questionId: 'q1', optionId: 'o1', score: 0 },
      { questionId: 'q2', optionId: 'o5', score: 0 },
    ]
    render(<QuestionnaireForm {...baseProps} answers={fullAnswers} />)
    const submitBtn = screen.getByRole('button', { name: /Soumettre le Diagnostic/i })
    expect(submitBtn).not.toBeDisabled()
  })

  it('appelle onSubmit quand le bouton Soumettre est cliqué (toutes réponses données)', () => {
    const fullAnswers: DiagnosticSubmissionAnswer[] = [
      { questionId: 'q1', optionId: 'o1', score: 0 },
      { questionId: 'q2', optionId: 'o5', score: 0 },
    ]
    render(<QuestionnaireForm {...baseProps} answers={fullAnswers} />)
    fireEvent.click(screen.getByRole('button', { name: /Soumettre le Diagnostic/i }))
    expect(baseProps.onSubmit).toHaveBeenCalledTimes(1)
  })
})
