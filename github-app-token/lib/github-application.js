const GitHubApplication = require('./GitHubApplication');

module.exports = {
  create: (privateKey, applicationId, baseApiUrl, timeout, proxy) => {
    const app = new GitHubApplication(privateKey, applicationId, baseApiUrl);
    return app.connect(timeout, proxy).then(() => app);
  },
  revokeAccessToken: async (token, baseUrl, proxy) => {
    const client = getOctokit(token, baseUrl, proxy);
    try {
      const resp = await client.rest.apps.revokeInstallationAccessToken();
      if (resp.status === 204) {
        return true;
      }
      throw new Error(`Unexpected status code ${resp.status}; ${resp.data}`);
    } catch (err) {
      throw new Error(`Failed to revoke application token; ${err.message}`);
    }
  },
};

function getOctokit(token, baseApiUrl, proxy) {
  const octokitOptions = {
    baseUrl: baseApiUrl,
    request: {
      agent: getProxyAgent(proxy, baseApiUrl),
      timeout: 5000,
    },
  };
  return github.getOctokit(token, octokitOptions);
}

function getProxyAgent(proxy, baseUrl) {
  if (proxy) {
    core.info(`explicit proxy specified as '${proxy}'`);
    return new HttpsProxyAgent(proxy);
  }

  const envProxy =
    process.env.http_proxy ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.HTTPS_PROXY;
  if (envProxy) {
    core.info(`environment proxy specified as '${envProxy}'`);
    const noProxy = process.env.no_proxy || process.env.NO_PROXY;
    if (noProxy && !proxyExcluded(noProxy, baseUrl)) {
      core.info(`using proxy '${envProxy}' for GitHub API calls`);
      return new HttpsProxyAgent(envProxy);
    }
  }
  return null;
}

function proxyExcluded(noProxy, baseUrl) {
  const noProxyHosts = noProxy.split(',').map(part => part.trim());
  const baseUrlHost = new URL.URL(baseUrl).host;
  return noProxyHosts.includes(baseUrlHost);
}

function validateInput(name, value) {
  if (!value || !value.trim()) {
    throw new Error(`A valid ${name} must be provided, was "${value}"`);
  }
  return value.trim();
}
