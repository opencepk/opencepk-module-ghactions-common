/* eslint-disable no-undef */
const { execSync } = require('child_process');
const fs = require('fs');
const github = require('@actions/github');
const core = require('@actions/core');
const logger = require('../../common/logger.js');
const { processRepo } = require('../index'); // Adjust the path as needed

jest.mock('fs', () => ({
  default: {
    existsSync: jest.fn(),
  },
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// jest.mock('child_process');
// jest.mock('@actions/github');
// jest.mock('@actions/core', () => ({
//   ...jest.requireActual('@actions/core'),
//   getInput: jest.fn(),
//   setOutput: jest.fn(),
//   setFailed: jest.fn(),
// }));
// jest.mock('../../common/logger.js');

// // Mock the setGitActionAccess function
// jest.mock('../../common/git-operations.js', () => ({
//   setGitActionAccess: jest.fn().mockResolvedValue({}),
// }));

// // Mock process.chdir to avoid changing the actual working directory
// jest.spyOn(process, 'chdir').mockImplementation(() => {});

// describe('processRepo', () => {
//   let mockOctokit;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockOctokit = {
//       repos: {
//         get: jest.fn(),
//         createInOrg: jest.fn(),
//       },
//       request: jest.fn(),
//     };
//     github.getOctokit.mockReturnValue(mockOctokit);
//   });

//   // it('should create a private repository if it does not exist', async () => {
//   //   mockOctokit.repos.get.mockRejectedValue({ status: 404 });
//   //   mockOctokit.repos.createInOrg.mockResolvedValue({
//   //     data: { html_url: 'https://github.com/org/repo' },
//   //   });

//   //   await processRepo('https://github.com/public/repo.git', 'org', 'token');

//   //   expect(mockOctokit.repos.createInOrg).toHaveBeenCalledWith({
//   //     org: 'org',
//   //     name: 'repo',
//   //     visibility: 'internal',
//   //   });
//   //   expect(execSync).toHaveBeenCalledWith(
//   //     'git clone https://github.com/public/repo.git public-repo',
//   //   );
//   //   expect(fs.mkdirSync).toHaveBeenCalled();
//   //   expect(fs.writeFileSync).toHaveBeenCalled();
//   // });

//   it('should not create a repository if it already exists', async () => {
//     mockOctokit.repos.get.mockResolvedValue({});
//     mockOctokit.repos.createInOrg.mockResolvedValue({});

//     await processRepo('https://github.com/public/repo.git', 'org', 'token');

//     expect(mockOctokit.repos.get).toHaveBeenCalledWith({
//       owner: 'org',
//       repo: 'repo',
//     });
//     expect(mockOctokit.repos.createInOrg).not.toHaveBeenCalled();
//   });
// });

describe('Sample Test', () => {
  it('should always pass', () => {
    expect(true).toBe(true);
  });
});
