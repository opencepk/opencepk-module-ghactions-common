// jest.config.mjs
export default {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverageFrom: [
    '<rootDir>/github-flow-check-commit-message/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/github-flow-sync-with-mirror/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/common/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/git-upstream-set-check-pr-block/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/git-upstream-set-create-pr/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/github-flow-check-branch-name/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/github-flow-mirror-repo/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/github-flow-update-pr-title/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/github-flow-update-release-notes/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/github-set-actions-permissions/**/*.{js,jsx,ts,tsx}',
  ],
  testMatch: [
    '**/tests/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
    '**/__tests__/**/*.[jt]s?(x)',
  ],
};
