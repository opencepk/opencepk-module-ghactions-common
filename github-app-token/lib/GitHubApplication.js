const jwt = require('jsonwebtoken');
const github = require('@actions/github');
const core = require('@actions/core');
const HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
const URL = require('url');

class PrivateKey {
  constructor(key) {
    this.key = key;
  }
}

class GitHubApplication {
  constructor(privateKey, applicationId, baseApiUrl) {
    this.privateKey = new PrivateKey(
      validateInput('privateKey', privateKey),
    ).key;
    this.id = validateInput('applicationId', applicationId);
    this.githubApiUrl =
      baseApiUrl || process.env['GITHUB_API_URL'] || 'https://api.github.com';
    this.client = null;
  }

  async connect(validSeconds = 60, proxy) {
    const token = jwt.sign(
      {
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + validSeconds,
        iss: this.id,
      },
      this.privateKey,
      { algorithm: 'RS256' },
    );

    this.client = getOctokit(token, this.githubApiUrl, proxy);

    try {
      const resp = await this.client.request('GET /app', {
        mediaType: { previews: ['machine-man'] },
      });
      if (resp.status === 200) {
        this.metadata = resp.data;
        return resp.data;
      }
      throw new Error(
        `Failed to load application with id:${this.id}; ${resp.data}`,
      );
    } catch (err) {
      throw new Error(
        `Failed to connect as application; status code: ${err.status}\n${err.message}`,
      );
    }
  }

  async getApplicationInstallations() {
    return this._request('GET /app/installations');
  }

  async getRepositoryInstallation(owner, repo) {
    return this._request('GET /repos/{owner}/{repo}/installation', {
      owner,
      repo,
    });
  }

  async getOrganizationInstallation(org) {
    return this._request('GET /orgs/{org}/installation', { org });
  }

  async getInstallationAccessToken(installationId, permissions = {}) {
    if (!installationId) {
      throw new Error('GitHub Application installation id must be provided');
    }
    return this._request(
      `POST /app/installations/${installationId}/access_tokens`,
      { permissions },
    );
  }

  async _request(endpoint, params = {}) {
    try {
      const resp = await this.client.request(endpoint, {
        mediaType: { previews: ['machine-man'] },
        ...params,
      });
      if (resp.status >= 200 && resp.status < 300) {
        return resp.data;
      }
      throw new Error(`Unexpected status code ${resp.status}; ${resp.data}`);
    } catch (err) {
      throw new Error(`Failed to execute request; ${err.message}`);
    }
  }
}

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

module.exports = GitHubApplication;
