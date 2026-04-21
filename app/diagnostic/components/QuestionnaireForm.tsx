'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import { CheckCircle, Circle } from 'lucide-react'

import type { DiagnosticSubmissionAnswer, Questionnaire } from '@/types'

interface QuestionnaireFormProps {
  questionnaire: Questionnaire
  answers: DiagnosticSubmissionAnswer[]
  progress: number
  onAnswerChange: (questionId: string, optionId: string, score: number) => void
  onSubmit: () => void
  disabled?: boolean
}

export default function QuestionnaireForm({
  questionnaire,
  answers,
  onAnswerChange,
  onSubmit,
  disabled = false,
}: QuestionnaireFormProps) {
  // Vérification si une question a été répondue
  const getAnswerForQuestion = (questionId: string) => {
    return answers.find((a) => a.questionId === questionId)
  }

  // Vérification si toutes les questions ont été répondues
  const allQuestionsAnswered = answers.length === questionnaire.questions.length

  // Gestion du changement de réponse
  const handleRadioChange = (questionId: string, optionId: string, score: number) => {
    if (!disabled) {
      onAnswerChange(questionId, optionId, score)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête du questionnaire */}
      <Box className="text-center mb-8">
        <Typography variant="h5" className="font-semibold mb-2">
          {questionnaire.title}
        </Typography>
        <Typography variant="body1" color="textSecondary" className="mb-4">
          {questionnaire.description}
        </Typography>
        <Chip
          label={questionnaire.category}
          variant="outlined"
          className="border-blue-500 text-blue-600"
        />
      </Box>

      {/* Questions */}
      {questionnaire.questions
        .sort((a, b) => a.order - b.order)
        .map((question, questionIndex) => {
          const currentAnswer = getAnswerForQuestion(question.id)
          const isAnswered = !!currentAnswer

          return (
            <Card
              key={question.id}
              variant="outlined"
              className={`transition-all duration-200 ${
                isAnswered
                  ? 'border-green-500 bg-green-50/30'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <CardContent className="p-6">
                {/* Titre de la question */}
                <Box className="flex items-start space-x-3 mb-4">
                  <div className="flex-shrink-0 mt-1">
                    {isAnswered ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Typography variant="h6" className="mb-2">
                      Question {questionIndex + 1}
                    </Typography>
                    <Typography variant="body1" className="text-gray-700">
                      {question.text}
                    </Typography>
                  </div>
                </Box>

                {/* Options de réponse */}
                <RadioGroup
                  value={currentAnswer?.optionId || ''}
                  onChange={(e) => {
                    const selectedOption = question.options.find((opt) => opt.id === e.target.value)
                    if (selectedOption) {
                      handleRadioChange(question.id, selectedOption.id, selectedOption.score)
                    }
                  }}
                  className="ml-8"
                >
                  {question.options.map((option) => (
                    <FormControlLabel
                      key={option.id}
                      value={option.id}
                      control={<Radio disabled={disabled} />}
                      label={
                        <Box className="flex justify-between items-center w-full mr-4">
                          <Typography variant="body1">{option.text}</Typography>
                          <Chip
                            size="small"
                            label={`${option.score} pts`}
                            variant="outlined"
                            className="text-xs"
                          />
                        </Box>
                      }
                      className="mx-0 mb-2 p-2 rounded hover:bg-gray-50 transition-colors"
                    />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )
        })}

      {/* Bouton de soumission */}
      <Box className="text-center pt-6">
        <Button
          variant="contained"
          size="large"
          onClick={onSubmit}
          disabled={!allQuestionsAnswered || disabled}
          className={`px-8 py-3 ${
            allQuestionsAnswered ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
          }`}
        >
          {allQuestionsAnswered
            ? 'Soumettre le Diagnostic'
            : `Veuillez répondre à toutes les questions (${answers.length}/${questionnaire.questions.length})`}
        </Button>

        {allQuestionsAnswered && (
          <Typography variant="body2" className="mt-3 text-green-600">
            Toutes les questions ont été répondues. Vous pouvez soumettre votre diagnostic.
          </Typography>
        )}
      </Box>
    </div>
  )
}
