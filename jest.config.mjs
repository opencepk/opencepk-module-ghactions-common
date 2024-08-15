// jest.config.mjs
export default {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  roots: [
    '<rootDir>/github-flow-mirror-repo',
    '<rootDir>/github-flow-sync-with-mirror',
  ],
  testMatch: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)', '**/__tests__/**/*.[jt]s?(x)']
};
