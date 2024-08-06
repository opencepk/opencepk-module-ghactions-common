const core = require("@actions/core");
const github = require("@actions/github");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function run() {
  try {
    const publicRepoUrl = core.getInput("public_repo_url");
    const token = core.getInput("github_token");
    const octokit = github.getOctokit(token);
    const org = "tucowsinc";
    const repoName = publicRepoUrl.split("/").pop().replace(".git", "");

    // Check if the private repository already exists
    try {
      await octokit.repos.get({
        owner: org,
        repo: repoName,
      });
      core.setFailed(`Repository ${org}/${repoName} already exists.`);
      return;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    // Create a private repository in the organization
    const { data: privateRepo } = await octokit.repos.createInOrg({
      org,
      name: repoName,
      // private: true,
      visibility: "internal",
    });

    // Clone the public repository
    execSync(`git clone ${publicRepoUrl} public-repo`);
    process.chdir("public-repo");

    // Configure Git user
    execSync(
      'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"'
    );
    execSync('git config user.name "github-actions[bot]"');

    // Add UPSTREAM file
    const upstreamContent = `git@github.com:${
      publicRepoUrl.split("https://github.com/")[1]
    }.git`;
    const upstreamFilePath = path.join(".github", "UPSTREAM");
    fs.mkdirSync(path.dirname(upstreamFilePath), { recursive: true });
    fs.writeFileSync(upstreamFilePath, upstreamContent);

    // Commit the UPSTREAM file
    execSync("git add .github/UPSTREAM");
    execSync('git commit -m "Add UPSTREAM file"');

    // Add the GitHub Actions workflow file
    const workflowContent = `
name: sync-with-mirror

on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup SSH Agent
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: \${{ secrets.SSH_KEY_ICE_MODULES_READONLY }}

      - name: Sync with Upstream
        # uses: opencepk-module-ghactions-common/sync-with-mirror
        uses: opencepk/opencepk-module-ghactions-common/github-flow-sync-with-mirror@v2.0.9
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
    `;
    const workflowFilePath = path.join(
      ".github",
      "workflows",
      "sync-with-mirror.yml"
    );
    fs.mkdirSync(path.dirname(workflowFilePath), { recursive: true });
    fs.writeFileSync(workflowFilePath, workflowContent);

    // Commit the workflow file
    execSync("git add .github/workflows/sync-with-mirror.yml");
    execSync('git commit -m "Add sync-with-mirror workflow"');

    // Set the remote URL with the token for authentication
    const remoteUrl = `https://x-access-token:${token}@github.com/${org}/${repoName}.git`;
    execSync(`git remote set-url origin ${remoteUrl}`);
    execSync("git push origin main");

    core.setOutput("private_repo_url", privateRepo.html_url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
