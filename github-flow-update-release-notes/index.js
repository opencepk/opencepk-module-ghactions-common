// const { execSync } = require('child_process');
// const core = require('@actions/core');
// const github = require('@actions/github');

import { execSync } from 'child_process';
import * as github from '@actions/github';
import * as logger from '../dist/logger.js';

async function run() {
  try {
    const { Octokit } = await import('@octokit/rest');
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });
    const { owner, repo } = github.context.repo;

    logger.info(`Repository: ${owner}/${repo}`);

    // Fetch the latest two tags
    const tags = execSync('git tag --sort=-creatordate')
      .toString()
      .trim()
      .split('\n');
    const latestTag = tags[0];
    const previousTag = tags[1];

    logger.info(`Latest tag: ${latestTag}`);
    logger.info(`Previous tag: ${previousTag}`);

    // Generate release notes between the two tags
    const compare = await octokit.repos.compareCommits({
      owner,
      repo,
      base: previousTag,
      head: latestTag,
    });

    const uniqueCommits = new Set();
    const uniqueContributors = new Set();

    compare.data.commits.forEach(commit => {
      // Split the commit message by new lines
      const messageLines = commit.commit.message.trim().split('\n');
      // Format the first line with a bullet point
      const formattedMessage = `- ${messageLines[0]}`;
      uniqueCommits.add(formattedMessage);
      // Indent subsequent lines
      let lineNumberEachPrMessage = 1;
      for (let i = 1; i < messageLines.length; i++) {
        if (messageLines[i].trim()) {
          uniqueCommits.add(
            `    ${lineNumberEachPrMessage}. ${messageLines[i]}`,
          );
          lineNumberEachPrMessage++;
        }
      }
      uniqueContributors.add(`- @${commit.author.login}`);
    });

    const changes = Array.from(uniqueCommits).join('\n');
    const contributors = Array.from(uniqueContributors).join('\n');

    logger.info(`Changes:\n${changes}`);
    logger.info(`Contributors:\n${contributors}`);

    // Construct the release notes string carefully
    const releaseNotes = [
      "**What's Changed**",
      changes,
      '**Contributors**',
      contributors,
      `**Full Changelog**: https://github.com/${owner}/${repo}/compare/${previousTag}...${latestTag}`,
    ].join('\n\n');

    logger.info(`Release Notes:\n${releaseNotes}`);

    // Update the latest release with the generated notes
    const releases = await octokit.repos.listReleases({ owner, repo });
    const latestRelease = releases.data.find(
      release => release.tag_name === latestTag,
    );

    if (latestRelease) {
      logger.info(`Updating release with ID: ${latestRelease.id}`);
      await octokit.repos.updateRelease({
        owner,
        repo,
        release_id: latestRelease.id,
        body: releaseNotes,
      });
      logger.info('Release updated successfully.');
    } else {
      const errorMessage = `Release for tag ${latestTag} not found.`;
      logger.error(errorMessage);
      logger.setFailed(errorMessage);
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    logger.setFailed(error.message);
  }
}

run();
