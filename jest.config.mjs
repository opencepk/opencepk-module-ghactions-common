// jest.config.mjs
export default {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  roots: [
    '<rootDir>/github-flow-mirror-repo'
  ],
  testMatch: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)', '**/__tests__/**/*.[jt]s?(x)']
};
