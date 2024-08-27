const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('./logger.js');

function replaceContentAndCommit() {
  // Replace all occurrences of opencepk/opencepk-module-ghactions-common with tucowsinc/opencepk-module-ghactions-common in .github/workflows/*.yml
  logger.info(
    'Replacing opencepk/opencepk-module-ghactions-common with tucowsinc/opencepk-module-ghactions-common in .github/workflows/*.yml',
  );
  const workflowDir = path.join('.github', 'workflows');
  const files = fs.readdirSync(workflowDir);
  files.forEach(file => {
    const filePath = path.join(workflowDir, file);
    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(
        /opencepk\/opencepk-module-ghactions-common/g,
        'tucowsinc/opencepk-module-ghactions-common',
      );
      fs.writeFileSync(filePath, content);
    }
  });

  // Commit the changes after replacement
  logger.info('Committing changes after replacement');
  execSync('git add .github/workflows');
  try {
    execSync(
      'git commit -m "chores/update Replace opencepk with tucowsinc in workflow files"',
    );
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      logger.info('No changes to commit in workflow files. Proceeding...');
    } else {
      throw error;
    }
  }

  // Replace all occurrences of git@github.com:opencepk with git@github.com:tucowsinc in .pre-commit-config.yaml
  logger.info(
    'Replacing git@github.com:opencepk with git@github.com:tucowsinc in .pre-commit-config.yaml',
  );
  const preCommitConfigPath = '.pre-commit-config.yaml';
  if (fs.existsSync(preCommitConfigPath)) {
    let preCommitContent = fs.readFileSync(preCommitConfigPath, 'utf8');
    preCommitContent = preCommitContent.replace(
      /git@github.com:opencepk/g,
      'git@github.com:tucowsinc',
    );
    fs.writeFileSync(preCommitConfigPath, preCommitContent);

    // Commit the changes after replacement
    logger.info('Committing changes to .pre-commit-config.yaml');
    execSync('git add .pre-commit-config.yaml');
    try {
      logger.info('Committing changes to .pre-commit-config.yaml');
      execSync(
        'git commit -m "chores/update: Replace opencepk with tucowsinc in .pre-commit-config.yaml"',
      );
    } catch (error) {
      logger.warn(`${JSON.stringify(error)}`);
      logger.info(
        'No changes to commit in .pre-commit-config.yaml. Proceeding...',
      );
    }
  } else {
    logger.info(
      '.pre-commit-config.yaml does not exist, skipping replacement.',
    );
  }
}

module.exports = { replaceContentAndCommit };
