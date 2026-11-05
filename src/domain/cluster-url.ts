// The access token is sent to the cluster, so only Twinfield API hosts are accepted. The pattern
// is anchored on both ends and fixes the scheme, the `api.` label and the `.twinfield.com` suffix.
const CLUSTER_HOST = /^api\.[a-z0-9]+(-[a-z0-9]+)*\.twinfield\.com$/;

// One service file directly under /webservices/, so no `..` or encoded segment can leave it.
const WEB_SERVICE_PATH = /^\/webservices\/[A-Za-z]+\.(asmx|svc)$/;

/** The base URL of the Twinfield cluster that hosts an organisation, such as api.accounting. */
export class ClusterUrl {
  private constructor(private readonly origin: string) {}

  static parse(value: string): ClusterUrl {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error('The cluster URL is not a valid URL.');
    }
    const isBareOrigin = url.pathname === '/' && url.search === '' && url.hash === '';
    const hasUserInfo = url.username !== '' || url.password !== '';
    if (url.protocol !== 'https:' || url.port !== '' || hasUserInfo || !isBareOrigin) {
      throw new Error('The cluster URL must be a bare https origin.');
    }
    if (!CLUSTER_HOST.test(url.hostname)) {
      throw new Error(`The host ${url.hostname} is not a Twinfield cluster.`);
    }

    return new ClusterUrl(url.origin);
  }

  endpoint(path: string): URL {
    if (!WEB_SERVICE_PATH.test(path)) {
      throw new Error(`The path ${path} is not a Twinfield web service.`);
    }

    return new URL(path, this.origin);
  }

  toString(): string {
    return this.origin;
  }
}
