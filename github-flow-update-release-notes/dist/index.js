/******/ var __webpack_modules__ = ({});
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/******/ // expose the modules object (__webpack_modules__)
/******/ __nccwpck_require__.m = __webpack_modules__;
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/ensure chunk */
/******/ (() => {
/******/ 	__nccwpck_require__.f = {};
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__nccwpck_require__.e = (chunkId) => {
/******/ 		return Promise.all(Object.keys(__nccwpck_require__.f).reduce((promises, key) => {
/******/ 			__nccwpck_require__.f[key](chunkId, promises);
/******/ 			return promises;
/******/ 		}, []));
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/get javascript chunk filename */
/******/ (() => {
/******/ 	// This function allow to reference async chunks
/******/ 	__nccwpck_require__.u = (chunkId) => {
/******/ 		// return url for filenames based on template
/******/ 		return "" + chunkId + ".index.js";
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__nccwpck_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/******/ /* webpack/runtime/import chunk loading */
/******/ (() => {
/******/ 	// no baseURI
/******/ 	
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		179: 0
/******/ 	};
/******/ 	
/******/ 	var installChunk = (data) => {
/******/ 		var {ids, modules, runtime} = data;
/******/ 		// add "modules" to the modules object,
/******/ 		// then flag all "ids" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0;
/******/ 		for(moduleId in modules) {
/******/ 			if(__nccwpck_require__.o(modules, moduleId)) {
/******/ 				__nccwpck_require__.m[moduleId] = modules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(runtime) runtime(__nccwpck_require__);
/******/ 		for(;i < ids.length; i++) {
/******/ 			chunkId = ids[i];
/******/ 			if(__nccwpck_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				installedChunks[chunkId][0]();
/******/ 			}
/******/ 			installedChunks[ids[i]] = 0;
/******/ 		}
/******/ 	
/******/ 	}
/******/ 	
/******/ 	__nccwpck_require__.f.j = (chunkId, promises) => {
/******/ 			// import() chunk loading for javascript
/******/ 			var installedChunkData = __nccwpck_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 			if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 	
/******/ 				// a Promise means "currently loading".
/******/ 				if(installedChunkData) {
/******/ 					promises.push(installedChunkData[1]);
/******/ 				} else {
/******/ 					if(true) { // all chunks have JS
/******/ 						// setup Promise in chunk cache
/******/ 						var promise = import("./" + __nccwpck_require__.u(chunkId)).then(installChunk, (e) => {
/******/ 							if(installedChunks[chunkId] !== 0) installedChunks[chunkId] = undefined;
/******/ 							throw e;
/******/ 						});
/******/ 						var promise = Promise.race([promise, new Promise((resolve) => (installedChunkData = installedChunks[chunkId] = [resolve]))])
/******/ 						promises.push(installedChunkData[1] = promise);
/******/ 					} else installedChunks[chunkId] = 0;
/******/ 				}
/******/ 			}
/******/ 	};
/******/ 	
/******/ 	// no external install chunk
/******/ 	
/******/ 	// no on chunks loaded
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
const { execSync } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');

// import { execSync } from 'child_process';
// import * as github from '@actions/github';
// import * as logger from '../dist/logger.js';

async function run() {
  try {
    const { Octokit } = await __nccwpck_require__.e(/* import() */ 286).then(__nccwpck_require__.bind(__nccwpck_require__, 286));
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });
    const { owner, repo } = github.context.repo;

    core.info(`Repository: ${owner}/${repo}`);

    // Fetch the latest two tags
    const tags = execSync('git tag --sort=-creatordate')
      .toString()
      .trim()
      .split('\n');
    const latestTag = tags[0];
    const previousTag = tags[1];

    core.info(`Latest tag: ${latestTag}`);
    core.info(`Previous tag: ${previousTag}`);

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

    core.info(`Changes:\n${changes}`);
    core.info(`Contributors:\n${contributors}`);

    // Construct the release notes string carefully
    const releaseNotes = [
      "**What's Changed**",
      changes,
      '**Contributors**',
      contributors,
      `**Full Changelog**: https://github.com/${owner}/${repo}/compare/${previousTag}...${latestTag}`,
    ].join('\n\n');

    core.info(`Release Notes:\n${releaseNotes}`);

    // Update the latest release with the generated notes
    const releases = await octokit.repos.listReleases({ owner, repo });
    const latestRelease = releases.data.find(
      release => release.tag_name === latestTag,
    );

    if (latestRelease) {
      core.info(`Updating release with ID: ${latestRelease.id}`);
      await octokit.repos.updateRelease({
        owner,
        repo,
        release_id: latestRelease.id,
        body: releaseNotes,
      });
      core.info('Release updated successfully.');
    } else {
      const errorMessage = `Release for tag ${latestTag} not found.`;
      core.error(errorMessage);
      core.setFailed(errorMessage);
    }
  } catch (error) {
    core.error(`Error: ${error.message}`);
    core.setFailed(error.message);
  }
}

run();

