/* eslint-disable no-undef */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const github = require('@actions/github');
const core = require('@actions/core');
const logger = require('../../common/logger.js');
const { processRepo } = require('../index'); // Adjust the path as needed

// Mock fs.promises before any other mocks
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('child_process');
jest.mock('path');
jest.mock('@actions/github');
jest.mock('@actions/core', () => ({
  ...jest.requireActual('@actions/core'),
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
}));
jest.mock('../../common/logger.js');

// Mock the setGitActionAccess function
jest.mock('../../common/git-operations.js', () => ({
  setGitActionAccess: jest.fn().mockResolvedValue({}),
}));

// Mock process.chdir to avoid changing the actual working directory
jest.spyOn(process, 'chdir').mockImplementation(() => {});

describe('processRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a private repository if it does not exist', async () => {
    const mockOctokit = {
      repos: {
        get: jest.fn().mockRejectedValue({ status: 404 }),
        createInOrg: jest.fn().mockResolvedValue({ data: { html_url: 'https://github.com/org/repo' } }),
      },
      request: jest.fn().mockResolvedValue({}),
    };
    github.getOctokit.mockReturnValue(mockOctokit);

    await processRepo('https://github.com/public/repo.git', 'org', 'token');

    expect(mockOctokit.repos.createInOrg).toHaveBeenCalledWith({
      org: 'org',
      name: 'repo',
      visibility: 'internal',
    });
    expect(execSync).toHaveBeenCalledWith('git clone https://github.com/public/repo.git public-repo');
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should not create a repository if it already exists', async () => {
    const mockOctokit = {
      repos: {
        get: jest.fn().mockResolvedValue({}),
        createInOrg: jest.fn(), // Ensure this is defined to avoid the undefined error
      },
      request: jest.fn().mockResolvedValue({}),
    };
    github.getOctokit.mockReturnValue(mockOctokit);

    await processRepo('https://github.com/public/repo.git', 'org', 'token');

    expect(mockOctokit.repos.get).toHaveBeenCalledWith({
      owner: 'org',
      repo: 'repo',
    });
    expect(mockOctokit.repos.createInOrg).not.toHaveBeenCalled();
  });

  // Add more tests for edge cases and other scenarios
});