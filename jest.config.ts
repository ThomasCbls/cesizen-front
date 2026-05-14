import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['<rootDir>/__tests__/**/*.{ts,tsx}'],
  collectCoverageFrom: [
    'lib/services/**/*.ts',
    'app/hooks/**/*.ts',
    'app/admin/components/**/*.tsx',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
}

export default createJestConfig(config)
